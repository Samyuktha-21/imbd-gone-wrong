export type Movie = {
  id: string;
  title: string;
  year: number;
  rating: number;
  runtimeMinutes: number;
  certificate: string;
  genres: string[];
  blurb: string;
};

/**
 * Static catalogue. The reference project in `imdb-clone/` seeds real titles
 * from the IMDb non-commercial dataset via a backend; this app is deliberately
 * standalone, so a hand-picked slice is enough to demo the fog against.
 */
export const movies: Movie[] = [
  {
    id: "tt0111161",
    title: "The Shawshank Redemption",
    year: 1994,
    rating: 9.3,
    runtimeMinutes: 142,
    certificate: "R",
    genres: ["Drama"],
    blurb:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
  },
  {
    id: "tt0068646",
    title: "The Godfather",
    year: 1972,
    rating: 9.2,
    runtimeMinutes: 175,
    certificate: "R",
    genres: ["Crime", "Drama"],
    blurb:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
  },
  {
    id: "tt0468569",
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    runtimeMinutes: 152,
    certificate: "PG-13",
    genres: ["Action", "Crime", "Drama"],
    blurb:
      "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests of his ability to fight injustice.",
  },
  {
    id: "tt0110912",
    title: "Pulp Fiction",
    year: 1994,
    rating: 8.9,
    runtimeMinutes: 154,
    certificate: "R",
    genres: ["Crime", "Drama"],
    blurb:
      "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
  },
  {
    id: "tt0109830",
    title: "Forrest Gump",
    year: 1994,
    rating: 8.8,
    runtimeMinutes: 142,
    certificate: "PG-13",
    genres: ["Drama", "Romance"],
    blurb:
      "The presidencies of Kennedy and Johnson, Vietnam, and more unfold from the perspective of an Alabama man with an IQ of 75.",
  },
  {
    id: "tt1375666",
    title: "Inception",
    year: 2010,
    rating: 8.8,
    runtimeMinutes: 148,
    certificate: "PG-13",
    genres: ["Action", "Adventure", "Sci-Fi"],
    blurb:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
  },
  {
    id: "tt0137523",
    title: "Fight Club",
    year: 1999,
    rating: 8.8,
    runtimeMinutes: 139,
    certificate: "R",
    genres: ["Drama"],
    blurb:
      "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
  },
  {
    id: "tt0816692",
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
    runtimeMinutes: 169,
    certificate: "PG-13",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    blurb:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  },
  {
    id: "tt0133093",
    title: "The Matrix",
    year: 1999,
    rating: 8.7,
    runtimeMinutes: 136,
    certificate: "R",
    genres: ["Action", "Sci-Fi"],
    blurb:
      "A computer programmer discovers that reality as he knows it is a simulation, and joins a rebellion against its architects.",
  },
  {
    id: "tt0245429",
    title: "Spirited Away",
    year: 2001,
    rating: 8.6,
    runtimeMinutes: 125,
    certificate: "PG",
    genres: ["Animation", "Adventure", "Family"],
    blurb:
      "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods and witches.",
  },
  {
    id: "tt6751668",
    title: "Parasite",
    year: 2019,
    rating: 8.5,
    runtimeMinutes: 132,
    certificate: "R",
    genres: ["Drama", "Thriller"],
    blurb:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between two families.",
  },
  {
    id: "tt0114369",
    title: "Se7en",
    year: 1995,
    rating: 8.6,
    runtimeMinutes: 127,
    certificate: "R",
    genres: ["Crime", "Drama", "Mystery"],
    blurb:
      "Two detectives hunt a serial killer who uses the seven deadly sins as his motives.",
  },
];

export const featuredMovie = movies[0];
