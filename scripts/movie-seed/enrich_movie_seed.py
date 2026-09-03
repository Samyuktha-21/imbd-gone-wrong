#!/usr/bin/env python3
"""Add TMDB posters, backdrops and synopses to the movie seed.

Adapted from imdb-clone/infrastructure/movie-seed/enrich_movie_seed.py, which
is reference-only. Two differences, because the consumer differs:

  * That pipeline downloads originals and generates WebP variants for object
    storage. This one records the TMDB *paths* only; the app builds CDN URLs at
    render time, so no binaries enter the repo.
  * It writes CSV for a database importer. This one merges the fields straight
    back into src/data/movies.generated.json.

Needs a free TMDB API key. Put it in a gitignored .env at the repo root:

    TMDB_API_KEY=your-key-here

Responses are cached per IMDb id, so a re-run costs nothing for titles already
fetched and you can safely interrupt it.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_INPUT = REPO_ROOT / "src" / "data" / "movies.generated.json"
DEFAULT_CACHE_DIR = REPO_ROOT / "scripts" / "movie-seed" / ".dataset-cache" / "tmdb"
ENV_FILE = REPO_ROOT / ".env"

TMDB_FIND_URL = "https://api.themoviedb.org/3/find/{imdb_id}"


def load_api_key() -> str:
    """Environment first, then a .env at the repo root."""
    key = os.environ.get("TMDB_API_KEY", "").strip()
    if key:
        return key

    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in stripped:
                continue
            name, _, value = stripped.partition("=")
            if name.strip() == "TMDB_API_KEY":
                return value.strip().strip("\"'")

    raise SystemExit(
        "No TMDB API key found.\n"
        "  Get one free at https://www.themoviedb.org/settings/api\n"
        f"  then add this line to {ENV_FILE}:\n\n"
        "    TMDB_API_KEY=your-key-here\n"
    )


def fetch_json(url: str, retries: int = 3) -> dict[str, Any] | None:
    """GET with a small retry budget. Returns None when the title is unknown."""
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=20) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return None
            # 429 means the rate limit bit; back off and try again.
            if error.code == 429 and attempt < retries - 1:
                time.sleep(2 * (attempt + 1))
                continue
            if attempt == retries - 1:
                raise
        except urllib.error.URLError:
            if attempt == retries - 1:
                raise
            time.sleep(1 + attempt)
    return None


def lookup(imdb_id: str, api_key: str, cache_dir: Path) -> dict[str, Any] | None:
    """TMDB's /find endpoint maps an IMDb id straight onto a TMDB record."""
    cache_file = cache_dir / f"{imdb_id}.json"
    if cache_file.exists():
        try:
            return json.loads(cache_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            cache_file.unlink(missing_ok=True)

    query = urllib.parse.urlencode(
        {"api_key": api_key, "external_source": "imdb_id"}
    )
    payload = fetch_json(f"{TMDB_FIND_URL.format(imdb_id=imdb_id)}?{query}")
    results = (payload or {}).get("movie_results") or []
    record = results[0] if results else None

    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(json.dumps(record), encoding="utf-8")
    return record


def enrich(
    movies: list[dict[str, Any]],
    api_key: str,
    cache_dir: Path,
    sleep_seconds: float,
    log_every: int,
) -> dict[str, int]:
    counts = {"posters": 0, "overviews": 0, "misses": 0, "cached": 0}

    for index, movie in enumerate(movies, start=1):
        imdb_id = movie["id"]
        was_cached = (cache_dir / f"{imdb_id}.json").exists()

        record = lookup(imdb_id, api_key, cache_dir)

        if was_cached:
            counts["cached"] += 1
        elif sleep_seconds:
            time.sleep(sleep_seconds)

        if not record:
            counts["misses"] += 1
        else:
            if record.get("poster_path"):
                movie["posterPath"] = record["poster_path"]
                counts["posters"] += 1
            if record.get("backdrop_path"):
                movie["backdropPath"] = record["backdrop_path"]
            # Only take TMDB's synopsis when we do not already have a curated one.
            if record.get("overview"):
                movie["overview"] = record["overview"].strip()
                counts["overviews"] += 1

        if index % log_every == 0 or index == len(movies):
            print(
                f"[{index}/{len(movies)}] posters={counts['posters']} "
                f"overviews={counts['overviews']} misses={counts['misses']} "
                f"cached={counts['cached']}",
                file=sys.stderr,
            )

    return counts


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Add TMDB posters and synopses to movies.generated.json."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE_DIR)
    parser.add_argument("--sleep-seconds", type=float, default=0.06)
    parser.add_argument("--log-every", type=int, default=25)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    api_key = load_api_key()
    output = args.output or args.input

    movies = json.loads(args.input.read_text(encoding="utf-8"))
    print(f"Enriching {len(movies)} titles from TMDB", file=sys.stderr)

    counts = enrich(
        movies, api_key, args.cache_dir, args.sleep_seconds, args.log_every
    )

    output.write_text(
        json.dumps(movies, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"Wrote {len(movies)} titles to {output} "
        f"({counts['posters']} with posters, {counts['misses']} not found)",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
