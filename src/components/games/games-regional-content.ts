/** Content for the Indian style and Western style couple games. Original prompts only. */

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index of the correct option in `options`. */
  answer: number;
  note: string;
}

export interface PairQuestion {
  a: string;
  b: string;
}

/* ---------- Indian style ---------- */

/** Festival trivia. Each fact is widely documented. */
export const FESTIVAL_QUIZ: QuizQuestion[] = [
  { q: "Which festival is known as the festival of lights?", options: ["Holi", "Diwali", "Onam", "Pongal"], answer: 1, note: "Diwali is celebrated with diyas, rangoli and fireworks in many parts of India." },
  { q: "Holi is most famously called the festival of what?", options: ["Lights", "Colours", "Harvest", "Kites"], answer: 1, note: "People throw coloured powder and water to celebrate the arrival of spring." },
  { q: "Onam is the harvest festival of which state?", options: ["Kerala", "Punjab", "Gujarat", "Assam"], answer: 0, note: "Onam is the main festival of Kerala and includes a grand feast called the Sadya." },
  { q: "Pongal is celebrated mainly in which state?", options: ["Tamil Nadu", "Bihar", "Rajasthan", "Odisha"], answer: 0, note: "Pongal is a harvest festival of Tamil Nadu, named after the rice dish cooked during it." },
  { q: "Eid al-Fitr marks the end of which month?", options: ["Muharram", "Ramadan", "Shawwal", "Rajab"], answer: 1, note: "Eid al-Fitr celebrates the end of Ramadan, the month of fasting." },
  { q: "Raksha Bandhan celebrates the bond between whom?", options: ["Husband and wife", "Parents and children", "Brothers and sisters", "Friends"], answer: 2, note: "Sisters tie a rakhi on their brothers' wrists, and brothers promise to protect them." },
  { q: "Ganesh Chaturthi honours which deity?", options: ["Lord Shiva", "Lord Ganesha", "Lord Hanuman", "Lord Vishnu"], answer: 1, note: "Ganesha is worshipped as the remover of obstacles, with idols installed for several days." },
  { q: "Durga Puja is most famously celebrated in which state?", options: ["West Bengal", "Kerala", "Gujarat", "Punjab"], answer: 0, note: "Kolkata's pandals are especially well known during Durga Puja." },
  { q: "Bihu is a festival of which state?", options: ["Assam", "Karnataka", "Madhya Pradesh", "Himachal Pradesh"], answer: 0, note: "Bihu marks the Assamese new year and the seasons of the farming year." },
  { q: "Navratri is celebrated for how many nights?", options: ["Five", "Seven", "Nine", "Twelve"], answer: 2, note: "Navratri means nine nights, dedicated to the goddess Durga in her many forms." },
];

/** Plot parts for the Filmi Plot Builder. Generic, original, meant for laughs. */
export const PLOT_POOLS = {
  hero: ["a cheerful wedding planner", "a shy chef with a secret recipe", "a retired cricketer turned poet", "an overconfident tour guide", "a sleepy night-shift nurse"],
  love: ["a stubborn rickshaw driver", "a famous food blogger", "a classical singer who never sings", "a neighbour with a very loud dog", "a stranger who keeps missing the same bus"],
  setting: ["a monsoon-soaked hill station", "a busy wedding in a palace garden", "a midnight train to somewhere far", "a spice market on the last day of the festival", "a rooftop with a view of a thousand lights"],
  obstacle: ["a family feud over a single samosa recipe", "a surprise engagement that nobody approved", "a misplaced ring and a very confused dog", "a power cut right in the middle of the speech", "a rival with the same name"],
  twist: ["the grandmother was the matchmaker all along", "the lost ring was in the kurta pocket", "they were already married, by accident", "the villain turns out to be the best dancer in town", "the whole story is being told by a parrot"],
  finale: ["a dance that stops traffic", "a song nobody rehearsed but everybody knows", "a reunion on the same bus stop, ten years later", "a grand feast where everyone is forgiven", "a surprise proposal made by a choir of aunties"],
} as const;

/** Rhythms are named by simple beats; the game only needs the number of pads. */
export const DHOL_PADS = ["Dha", "Ge", "Tin"] as const;

/** Antakshari: no lyrics are used. Players name songs and link each one to the last letter of the last. */
export const ANTAKSHARI_PROMPT = "Name any song you both know. The next song must start with the last letter of the one before.";

/* ---------- Western style ---------- */

export const RAPID_FIRE_PROMPTS = [
  "What is one small thing I did this week that made you smile?",
  "Where would you go for a surprise weekend, no questions asked?",
  "What song always puts you in a good mood?",
  "What is your comfort food on a bad day?",
  "What is one thing you have never told me about your childhood?",
  "What would you order if we went to a diner at midnight?",
  "Which of my habits do you secretly love?",
  "What is the best gift you have ever received?",
  "Which movie could you watch again tonight?",
  "What is a skill you would like to learn together?",
  "What is your perfect lazy Sunday?",
  "Which place in this city feels most like home to you?",
  "What is one tiny thing that always makes you feel loved?",
  "If we had a day with no phones, what would we do?",
  "What is a dream you have not mentioned in a while?",
  "What is the funniest thing that has happened to us?",
];

export const BINGO_SQUARES = [
  "Cook a meal together", "Dance in the living room", "Watch the sunrise", "Write each other a note", "Visit a new café",
  "Take a silly photo", "Go for a late-night drive", "Try a new cuisine", "Play a board game", "Stargaze on the terrace",
  "Plan a surprise", "Read aloud to each other", "Walk in the rain", "Make a playlist for each other", "Share a dessert",
  "Learn a new word together", "Have a picnic", "Take a short trip", "Sing in the car", "Cuddle through a movie",
  "Visit a bookshop", "Try a new sport", "Do a face mask night", "Make pancakes for dinner", "Go to a market together",
];

export const CAPTION_PROMPTS = [
  "Our cat has just taken over the bed and we are both squeezed on the edge.",
  "Me asking for directions, you insisting we know where we are going.",
  "The day we tried to assemble the new shelf without the instructions.",
  "The moment we realised the restaurant was closed, and we had walked there in the rain.",
  "Our first attempt at baking bread, shown in a single photo.",
  "When the power cuts out during our favourite show.",
];

export const CHARADES_CARDS = [
  "Making chai in a rush", "Dancing at a wedding", "Ordering pizza by mistake", "Looking for keys already in your hand",
  "A cricket shot gone wrong", "Riding a scooter in the rain", "Yoga that goes badly", "Trying to parallel park",
  "Haggling at a market", "Sneezing in a library", "Waiting for a bus that never comes", "Cooking a dal that burned",
  "Taking a selfie with a sleepy dog", "Hiding a surprise birthday cake", "Opening an enormous gift box", "Stuck in a lift and waving for help",
];

export const DESERT_ISLAND_ITEMS = [
  "A good book", "A guitar", "A hammock", "Sunscreen", "A pot of coffee", "A tent", "A deck of cards", "A chai kettle",
  "Warm blanket", "A kayak", "Fresh fruit", "A camera", "Headphones", "A map", "Cozy socks", "A pillow",
  "A notebook", "Fishing rod", "Board game", "Hot sauce",
];

export const DESI_FAMILY_QUESTIONS: PairQuestion[] = [
  { a: "Festival: lights and sweets at home", b: "Festival: the big family trip" },
  { a: "Weekend: a family lunch with everyone", b: "Weekend: just the two of us" },
  { a: "Dinner: cooked at home, from scratch", b: "Dinner: ordered in, no dishes" },
  { a: "Wedding: a grand celebration for hundreds", b: "Wedding: a small ceremony with close friends" },
  { a: "Holiday: a hill station in the cool", b: "Holiday: a beach with the sea breeze" },
  { a: "Gifts: something handmade", b: "Gifts: something bought with love" },
  { a: "Plans: decided a month in advance", b: "Plans: decided on the day" },
  { a: "Music: a classic playlist from our parents' era", b: "Music: whatever is trending now" },
];
