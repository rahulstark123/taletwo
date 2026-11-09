/** Content for the newer couple games. Kept apart from the components so it is easy to add more. */

export interface WouldRatherPair {
  a: string;
  b: string;
}

export const WOULD_RATHER: WouldRatherPair[] = [
  { a: "Start every morning with a long walk together", b: "End every night with a long slow dinner together" },
  { a: "Travel with zero plans and figure it out on the way", b: "Travel with a perfect plan, down to the snacks" },
  { a: "Cook a feast for each other every Sunday", b: "Order takeaway and eat it in matching pyjamas" },
  { a: "Dance in the rain with no music", b: "Sing badly together in the car" },
  { a: "Know exactly what your partner is thinking", b: "Always be surprised by them" },
  { a: "Live in the mountains, quiet and cold", b: "Live by the sea, loud and warm" },
  { a: "Have a movie night every night for a year", b: "Have a board game night every night for a year" },
  { a: "Write each other a letter every week", b: "Record a voice note for each other every day" },
  { a: "Spend a weekend at a fancy hotel", b: "Spend a weekend camping under the stars" },
  { a: "Be the one who remembers every date", b: "Be the one who plans every surprise" },
];

export interface MadLib {
  title: string;
  /** Use {noun}, {adjective}, {place} and so on. Each token becomes one blank, in order. */
  template: string;
}

export const MAD_LIBS: MadLib[] = [
  {
    title: "The Great Kitchen Adventure",
    template:
      "One {adjective} Sunday, we decided to cook a {food} for dinner. The recipe said to add {number} spoons of {ingredient}, but I added {number} of {noun} instead. The kitchen smelled like a {place}, and the cat stared at us as if we were {adjective}. We laughed until we {verb}, and it was, without doubt, the most {adjective} meal of our lives.",
  },
  {
    title: "Our Secret Date Mission",
    template:
      "Agent {name} and Agent {name} were sent on a top-secret date to {place}. Their mission: find the most {adjective} {food} in town without being seen. Halfway through, a {noun} started following them and they had to {verb} to escape. They made it back home just in time for a {adjective} movie and a very {adjective} hug.",
  },
  {
    title: "The Trip We Will Never Forget",
    template:
      "We packed our bags with three {noun}, one {adjective} hat and a map that was upside down. Our first stop was {place}, where a {adjective} tour guide taught us to {verb} like locals. Then it started to {verb}, and we ended up sharing one {food} under an umbrella. Best {noun} we have ever had, and we plan to go back next year.",
  },
];

/** Blank labels are looked up here; anything not listed is asked for as a plain word. */
export const MAD_LIB_LABELS: Record<string, string> = {
  adjective: "An adjective (describing word)",
  noun: "A noun (thing or creature)",
  food: "A food",
  place: "A place",
  verb: "A verb (action word)",
  name: "A first name",
  number: "A number",
  ingredient: "An ingredient",
};

export interface DateIdea {
  idea: string;
  budget: "free" | "cozy" | "treat";
}

export const DATE_IDEAS: DateIdea[] = [
  { idea: "Stargazing on the terrace with hot chocolate", budget: "free" },
  { idea: "A picnic at sunset with your favourite snacks", budget: "free" },
  { idea: "Cook a new recipe together and rate it out of ten", budget: "free" },
  { idea: "Walk a new neighbourhood and find the best chai stall", budget: "free" },
  { idea: "A board game tournament with a silly prize", budget: "free" },
  { idea: "Old-school arcade or bowling night", budget: "cozy" },
  { idea: "Share a dessert crawl through three cafes", budget: "cozy" },
  { idea: "Pottery class, and bring home the wobbliest mug", budget: "cozy" },
  { idea: "Movie marathon of your childhood favourites", budget: "cozy" },
  { idea: "Karaoke night with your worst and best songs", budget: "cozy" },
  { idea: "Cooking class for a cuisine neither of you has tried", budget: "cozy" },
  { idea: "A sunrise hike followed by a big breakfast", budget: "cozy" },
  { idea: "Dinner at a rooftop restaurant with a view", budget: "treat" },
  { idea: "A spa afternoon, booked for two", budget: "treat" },
  { idea: "A weekend getaway to a place you have never seen", budget: "treat" },
  { idea: "Live music tickets for a band you both love", budget: "treat" },
];

export const BUDGET_LABEL: Record<DateIdea["budget"], string> = {
  free: "Free",
  cozy: "Cozy",
  treat: "Treat yourselves",
};
