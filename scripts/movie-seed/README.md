# Movie Seed

Builds the app's movie catalogue from the
[IMDb non-commercial dataset](https://developer.imdb.com/non-commercial-datasets/).

The output, `src/data/movies.generated.json`, **is committed**. You only need to
run this to refresh the data — the app never runs it.

## Regenerate

```bash
python scripts/movie-seed/build_movie_seed.py --limit 250
```

The two source files are downloaded to `scripts/movie-seed/.dataset-cache/` on
first run (`title.basics.tsv.gz` is ~216 MB, `title.ratings.tsv.gz` ~8 MB) and
reused afterwards. The cache is gitignored. Delete it to pull fresh data — IMDb
refreshes the dumps daily.

Options:

| Flag | Default | Meaning |
| --- | --- | --- |
| `--limit` | `250` | How many titles to keep |
| `--output` | `src/data/movies.generated.json` | Where to write |
| `--basics` / `--ratings` | *(downloaded)* | Use local dataset files instead |
| `--cache-dir` | `scripts/movie-seed/.dataset-cache` | Download location |

## What it does

Streams `title.basics.tsv.gz` and keeps rows that are a `movie`, non-adult, have
a positive runtime, a known year, and a rating — then keeps the `--limit`
most-voted of those. Selection uses a bounded heap, so peak memory stays flat
across the ~1.5M-row file rather than scaling with it.

Output is sorted by vote count descending, ties broken on IMDb id so repeat runs
on the same dataset produce byte-identical output.

```json
{
  "id": "tt0111161",
  "title": "The Shawshank Redemption",
  "year": 1994,
  "rating": 9.3,
  "runtimeMinutes": 142,
  "votes": 3232959,
  "genres": ["Drama"]
}
```

## What it deliberately does not do

The dataset has no plot synopsis, certificate or poster art. Those live behind
TMDB, which needs an API key and a slow rate-limited crawl. That stage is not
ported, which keeps this script fully offline and deterministic.

Consequences:

- **Blurbs** — a short hand-written list in `src/data/blurbs.ts` is merged in by
  IMDb id. Titles without one render without a description.
- **Posters** — `src/components/Poster.tsx` generates a deterministic gradient
  from the title instead.

## Tests

```bash
python -m unittest discover -s scripts/movie-seed
```

## Relationship to `imdb-clone/`

Ported from `imdb-clone/infrastructure/movie-seed/build_movie_seed.py`, which is
reference-only and must not be modified. Filtering and ranking rules are
identical. Two things differ, because the consumer differs:

- That pipeline feeds a relational database and emits CSV with genres packed
  into an integer bitmask. This one feeds a static React app and emits JSON with
  genres as plain strings.
- It tolerates a missing `startYear`, since its column is nullable. This one
  drops those rows, because the UI always prints a year.
