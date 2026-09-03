#!/usr/bin/env python3
"""Build the frontend movie catalogue from the IMDb non-commercial dataset.

Ported from imdb-clone/infrastructure/movie-seed/build_movie_seed.py, which is
reference-only and must not be modified. The filtering and ranking rules are
kept identical; two things differ because the consumer is different:

  * That pipeline feeds a relational database, so it emits CSV with genres
    packed into an integer bitmask. This one feeds a static React app, so it
    emits JSON with genres as plain strings.
  * It has a TMDB enrichment stage for blurbs, certificates and posters. That
    needs an API key and a slow rate-limited crawl, so it is deliberately not
    ported -- everything here is offline and deterministic.

Run it once and commit the output; the app reads the JSON directly and never
needs this script at runtime.
"""

from __future__ import annotations

import argparse
import csv
import gzip
import heapq
import json
import sys
import urllib.request
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Iterable, Iterator, TextIO

DATASET_BASE_URL = "https://datasets.imdbws.com"
BASICS_FILENAME = "title.basics.tsv.gz"
RATINGS_FILENAME = "title.ratings.tsv.gz"

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CACHE_DIR = REPO_ROOT / "scripts" / "movie-seed" / ".dataset-cache"
DEFAULT_OUTPUT = REPO_ROOT / "src" / "data" / "movies.generated.json"
DEFAULT_LIMIT = 250

# IMDb ships a literal backslash-N for missing values rather than an empty cell.
NULL_TOKEN = "\\N"


@dataclass(frozen=True)
class ImdbRating:
    average_rating: float
    num_votes: int


@dataclass(frozen=True)
class Movie:
    """Mirrors the `Movie` type in src/data/movies.ts."""

    id: str
    title: str
    year: int
    rating: float
    runtimeMinutes: int
    votes: int
    genres: list[str] = field(default_factory=list)


def open_text(path: Path) -> TextIO:
    if path.suffix == ".gz":
        return gzip.open(path, "rt", encoding="utf-8", newline="")
    return path.open(encoding="utf-8", newline="")


def parse_genres(raw: str) -> list[str]:
    if not raw or raw == NULL_TOKEN:
        return []
    return [genre for genre in raw.split(",") if genre and genre != NULL_TOKEN]


def has_valid_runtime(row: dict[str, str]) -> bool:
    runtime = row.get("runtimeMinutes", "")
    return runtime.isdigit() and int(runtime) > 0


def has_valid_year(row: dict[str, str]) -> bool:
    return row.get("startYear", "").isdigit()


def is_importable_movie(row: dict[str, str], ratings: dict[str, ImdbRating]) -> bool:
    """Same rules as the reference pipeline, plus a year check.

    The reference tolerates a missing startYear because its database column is
    nullable. The UI always prints a year, so rows without one are dropped here
    rather than rendered as "\\N".
    """
    return (
        row.get("titleType") == "movie"
        and row.get("isAdult") == "0"
        and has_valid_runtime(row)
        and has_valid_year(row)
        and row.get("tconst", "") in ratings
    )


def read_ratings(ratings_path: Path) -> dict[str, ImdbRating]:
    with open_text(ratings_path) as ratings_file:
        reader = csv.DictReader(ratings_file, delimiter="\t")
        return {
            row["tconst"]: ImdbRating(
                average_rating=float(row["averageRating"]),
                num_votes=int(row["numVotes"]),
            )
            for row in reader
            if row.get("averageRating", NULL_TOKEN) != NULL_TOKEN
            and row.get("numVotes", "").isdigit()
        }


def to_movie(row: dict[str, str], rating: ImdbRating) -> Movie:
    return Movie(
        id=row["tconst"],
        title=row["primaryTitle"],
        year=int(row["startYear"]),
        rating=rating.average_rating,
        runtimeMinutes=int(row["runtimeMinutes"]),
        votes=rating.num_votes,
        genres=parse_genres(row.get("genres", "")),
    )


def select_top_movies(
    basics_rows: Iterator[dict[str, str]],
    ratings: dict[str, ImdbRating],
    limit: int,
) -> list[Movie]:
    """Keep the `limit` most-voted movies without holding the file in memory.

    title.basics is ~1.5M rows, so this streams and keeps only a bounded heap.
    Ties break on IMDb id so repeat runs on the same dataset are identical.
    """
    if limit < 1:
        raise ValueError("limit must be greater than zero")

    heap: list[tuple[int, str, Movie]] = []
    for row in basics_rows:
        if not is_importable_movie(row, ratings):
            continue

        movie = to_movie(row, ratings[row["tconst"]])
        entry = (movie.votes, movie.id, movie)

        if len(heap) < limit:
            heapq.heappush(heap, entry)
        elif entry > heap[0]:
            heapq.heapreplace(heap, entry)

    return sorted(
        (entry[2] for entry in heap),
        key=lambda movie: (-movie.votes, movie.id),
    )


def build_movies(basics_path: Path, ratings_path: Path, limit: int) -> list[Movie]:
    ratings = read_ratings(ratings_path)
    with open_text(basics_path) as basics_file:
        reader = csv.DictReader(basics_file, delimiter="\t")
        return select_top_movies(reader, ratings, limit)


def write_movies(movies: Iterable[Movie], output_path: Path) -> int:
    payload = [asdict(movie) for movie in movies]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="\n") as output_file:
        json.dump(payload, output_file, ensure_ascii=False, indent=2)
        output_file.write("\n")
    return len(payload)


def _report_progress(downloaded: int, total: int) -> None:
    if total > 0:
        percent = downloaded / total * 100
        sys.stderr.write(
            f"\r  {downloaded / 1_048_576:.1f}/{total / 1_048_576:.1f} MiB ({percent:.0f}%)"
        )
    else:
        sys.stderr.write(f"\r  {downloaded / 1_048_576:.1f} MiB")
    sys.stderr.flush()


def ensure_dataset(filename: str, cache_dir: Path) -> Path:
    """Return a local path for `filename`, downloading it if absent.

    The datasets are large and rarely change, so a cached copy is reused. The
    cache directory is gitignored.
    """
    destination = cache_dir / filename
    if destination.exists():
        return destination

    cache_dir.mkdir(parents=True, exist_ok=True)
    url = f"{DATASET_BASE_URL}/{filename}"
    print(f"Downloading {url}", file=sys.stderr)

    partial = destination.with_suffix(destination.suffix + ".partial")
    try:
        with urllib.request.urlopen(url) as response, partial.open("wb") as sink:
            total = int(response.headers.get("Content-Length", 0))
            downloaded = 0
            while chunk := response.read(1 << 20):
                sink.write(chunk)
                downloaded += len(chunk)
                _report_progress(downloaded, total)
        sys.stderr.write("\n")
        # Only publish the final name once the body is complete, so an
        # interrupted run cannot leave a truncated file that looks cached.
        partial.replace(destination)
    except BaseException:
        partial.unlink(missing_ok=True)
        raise

    return destination


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Build src/data/movies.generated.json from the IMDb "
            "non-commercial dataset."
        )
    )
    parser.add_argument(
        "--basics",
        type=Path,
        help=f"Path to {BASICS_FILENAME}. Downloaded to the cache if omitted.",
    )
    parser.add_argument(
        "--ratings",
        type=Path,
        help=f"Path to {RATINGS_FILENAME}. Downloaded to the cache if omitted.",
    )
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE_DIR)
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    basics = args.basics or ensure_dataset(BASICS_FILENAME, args.cache_dir)
    ratings = args.ratings or ensure_dataset(RATINGS_FILENAME, args.cache_dir)

    print(f"Reading ratings from {ratings}", file=sys.stderr)
    print(f"Scanning titles from {basics}", file=sys.stderr)

    movies = build_movies(basics, ratings, args.limit)
    written = write_movies(movies, args.output)

    print(f"Wrote {written} movies to {args.output}", file=sys.stderr)
    if movies:
        top = movies[0]
        print(f"Top title: {top.title} ({top.year}) {top.rating} from {top.votes:,} votes", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
