#!/usr/bin/env python3
"""Unit tests for the movie seed builder.

Run with:
    python -m unittest discover -s scripts/movie-seed
"""

from __future__ import annotations

import csv
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_movie_seed import (  # noqa: E402
    ImdbRating,
    build_movies,
    is_importable_movie,
    parse_genres,
    read_ratings,
    select_top_movies,
    write_movies,
)

BASICS_HEADER = [
    "tconst",
    "titleType",
    "primaryTitle",
    "originalTitle",
    "isAdult",
    "startYear",
    "endYear",
    "runtimeMinutes",
    "genres",
]


def basics_row(
    tconst: str,
    *,
    title_type: str = "movie",
    title: str = "A Film",
    is_adult: str = "0",
    start_year: str = "1994",
    runtime: str = "142",
    genres: str = "Drama",
) -> dict[str, str]:
    return {
        "tconst": tconst,
        "titleType": title_type,
        "primaryTitle": title,
        "originalTitle": title,
        "isAdult": is_adult,
        "startYear": start_year,
        "endYear": "\\N",
        "runtimeMinutes": runtime,
        "genres": genres,
    }


def rows_to_reader(rows: list[dict[str, str]]):
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=BASICS_HEADER, delimiter="\t")
    writer.writeheader()
    writer.writerows(rows)
    buffer.seek(0)
    return csv.DictReader(buffer, delimiter="\t")


class ParseGenresTest(unittest.TestCase):
    def test_splits_comma_separated_genres(self):
        self.assertEqual(parse_genres("Action,Sci-Fi"), ["Action", "Sci-Fi"])

    def test_treats_imdb_null_token_as_empty(self):
        self.assertEqual(parse_genres("\\N"), [])

    def test_treats_blank_as_empty(self):
        self.assertEqual(parse_genres(""), [])


class IsImportableMovieTest(unittest.TestCase):
    def setUp(self):
        self.ratings = {"tt1": ImdbRating(8.5, 1000)}

    def test_accepts_a_rated_feature_film(self):
        self.assertTrue(is_importable_movie(basics_row("tt1"), self.ratings))

    def test_rejects_non_movie_title_types(self):
        row = basics_row("tt1", title_type="tvSeries")
        self.assertFalse(is_importable_movie(row, self.ratings))

    def test_rejects_adult_titles(self):
        row = basics_row("tt1", is_adult="1")
        self.assertFalse(is_importable_movie(row, self.ratings))

    def test_rejects_missing_or_zero_runtime(self):
        self.assertFalse(is_importable_movie(basics_row("tt1", runtime="\\N"), self.ratings))
        self.assertFalse(is_importable_movie(basics_row("tt1", runtime="0"), self.ratings))

    def test_rejects_missing_year_because_the_ui_always_prints_one(self):
        row = basics_row("tt1", start_year="\\N")
        self.assertFalse(is_importable_movie(row, self.ratings))

    def test_rejects_titles_with_no_rating(self):
        self.assertFalse(is_importable_movie(basics_row("tt404"), self.ratings))


class ReadRatingsTest(unittest.TestCase):
    def test_parses_ratings_and_skips_malformed_rows(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "ratings.tsv"
            path.write_text(
                "tconst\taverageRating\tnumVotes\n"
                "tt1\t9.3\t2500000\n"
                "tt2\t\\N\t100\n"
                "tt3\t7.1\t\\N\n",
                encoding="utf-8",
            )

            ratings = read_ratings(path)

        self.assertEqual(set(ratings), {"tt1"})
        self.assertEqual(ratings["tt1"], ImdbRating(9.3, 2_500_000))


class SelectTopMoviesTest(unittest.TestCase):
    def test_ranks_by_vote_count_descending(self):
        rows = [
            basics_row("tt1", title="Fewest"),
            basics_row("tt2", title="Most"),
            basics_row("tt3", title="Middle"),
        ]
        ratings = {
            "tt1": ImdbRating(8.0, 10),
            "tt2": ImdbRating(7.0, 300),
            "tt3": ImdbRating(9.0, 50),
        }

        movies = select_top_movies(rows_to_reader(rows), ratings, limit=3)

        self.assertEqual([m.title for m in movies], ["Most", "Middle", "Fewest"])

    def test_keeps_only_the_top_n(self):
        rows = [basics_row(f"tt{i}", title=f"Film {i}") for i in range(1, 6)]
        ratings = {f"tt{i}": ImdbRating(8.0, i * 100) for i in range(1, 6)}

        movies = select_top_movies(rows_to_reader(rows), ratings, limit=2)

        self.assertEqual([m.title for m in movies], ["Film 5", "Film 4"])

    def test_excludes_rows_failing_the_import_rules(self):
        rows = [
            basics_row("tt1", title="Kept"),
            basics_row("tt2", title="A Series", title_type="tvSeries"),
            basics_row("tt3", title="Adult", is_adult="1"),
        ]
        ratings = {t: ImdbRating(8.0, 100) for t in ("tt1", "tt2", "tt3")}

        movies = select_top_movies(rows_to_reader(rows), ratings, limit=10)

        self.assertEqual([m.title for m in movies], ["Kept"])

    def test_is_deterministic_when_vote_counts_tie(self):
        rows = [basics_row("tt2"), basics_row("tt1")]
        ratings = {"tt1": ImdbRating(8.0, 100), "tt2": ImdbRating(8.0, 100)}

        first = select_top_movies(rows_to_reader(rows), ratings, limit=2)
        second = select_top_movies(rows_to_reader(rows), ratings, limit=2)

        self.assertEqual([m.id for m in first], [m.id for m in second])

    def test_rejects_a_non_positive_limit(self):
        with self.assertRaises(ValueError):
            select_top_movies(rows_to_reader([]), {}, limit=0)


class WriteMoviesTest(unittest.TestCase):
    def test_writes_json_shaped_for_the_frontend(self):
        rows = [basics_row("tt0111161", title="The Shawshank Redemption", genres="Drama,Crime")]
        ratings = {"tt0111161": ImdbRating(9.3, 2_500_000)}
        movies = select_top_movies(rows_to_reader(rows), ratings, limit=1)

        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "nested" / "movies.generated.json"
            count = write_movies(movies, output)
            payload = json.loads(output.read_text(encoding="utf-8"))

        self.assertEqual(count, 1)
        self.assertEqual(
            payload[0],
            {
                "id": "tt0111161",
                "title": "The Shawshank Redemption",
                "year": 1994,
                "rating": 9.3,
                "runtimeMinutes": 142,
                "votes": 2_500_000,
                "genres": ["Drama", "Crime"],
            },
        )


class BuildMoviesTest(unittest.TestCase):
    def test_reads_both_files_end_to_end(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            basics = root / "basics.tsv"
            ratings = root / "ratings.tsv"

            with basics.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=BASICS_HEADER, delimiter="\t")
                writer.writeheader()
                writer.writerows(
                    [
                        basics_row("tt1", title="Popular"),
                        basics_row("tt2", title="Obscure"),
                        basics_row("tt3", title="Unrated"),
                    ]
                )

            ratings.write_text(
                "tconst\taverageRating\tnumVotes\n"
                "tt1\t8.8\t900000\n"
                "tt2\t7.4\t120\n",
                encoding="utf-8",
            )

            movies = build_movies(basics, ratings, limit=10)

        self.assertEqual([m.title for m in movies], ["Popular", "Obscure"])


if __name__ == "__main__":
    unittest.main()
