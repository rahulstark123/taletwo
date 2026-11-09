/** Content for the couple games. Light, playful and never intrusive. Client-safe. */

export const TRUTH_QUESTIONS = [
  "What is a small thing I did that made you feel loved?",
  "What is your favourite memory of us so far?",
  "What is one thing you have always wanted to tell me?",
  "What is a habit of mine that you secretly adore?",
  "Where would you go on a surprise trip with me tomorrow?",
  "What is the first thing you noticed about me?",
  "What is a dream you have never told anyone?",
  "When did you last laugh so hard with me that you cried?",
];

export const DARE_CHALLENGES = [
  "Give your partner a 60-second shoulder massage.",
  "Sing the chorus of a song you both love, to each other.",
  "Write a two-line poem about your partner and read it aloud.",
  "Recreate your first photo together, with the same pose.",
  "Cook or order a dessert and feed each other one bite.",
  "Dance to one song with no music playing in your head, just together.",
  "Send your partner a voice note of three compliments right now.",
  "Let your partner choose your next selfie, and post nothing but make them smile.",
];

export interface QuizQuestion {
  emojis: string;
  answer: string;
  options: string[];
}

export const EMOJI_QUIZ: QuizQuestion[] = [
  { emojis: "🎬❤️🚢", answer: "Titanic", options: ["Titanic", "The Notebook", "Romeo + Juliet", "Ghost"] },
  { emojis: "🌧️☂️💑", answer: "Singin' in the Rain", options: ["Singin' in the Rain", "Umbrella Love", "Rainy Day", "Pride & Prejudice"] },
  { emojis: "🍕🎬🛋️", answer: "Movie night in", options: ["Movie night in", "Pizza party", "Sofa day", "Late supper"] },
  { emojis: "✈️🗼💕", answer: "A trip to Paris", options: ["A trip to Paris", "Airport goodbye", "Eiffel dinner", "Sky wedding"] },
  { emojis: "💍🌹🌙", answer: "A proposal under the moon", options: ["A proposal under the moon", "Anniversary dinner", "Rose garden walk", "Wedding night"] },
  { emojis: "☕📖🌅", answer: "A slow morning with a book", options: ["A slow morning with a book", "Coffee date", "Sunrise run", "Bookstore visit"] },
  { emojis: "🏖️🌊🥥", answer: "A beach holiday", options: ["A beach holiday", "Coconut party", "Ocean cruise", "Island wedding"] },
  { emojis: "🎂🕯️🎁", answer: "A birthday celebration", options: ["A birthday celebration", "Candle night", "Gift exchange", "Anniversary cake"] },
];

export const SENTENCE_STARTERS = [
  "The first time I saw you, I thought…",
  "My favourite way to spend a weekend with you is…",
  "You make me feel safe when…",
  "One thing I want us to do before we turn 40 is…",
  "The thing I admire most about you is…",
  "On a bad day, what cheers me up most is you…",
  "If we had one free year to ourselves, I would…",
  "The little habit of yours I would never change is…",
];

export const NEVER_HAVE_I_EVER = [
  "Never have I ever cooked a meal for us that did not go to plan.",
  "Never have I ever fallen asleep during one of our movie nights.",
  "Never have I ever sent a text to the wrong person.",
  "Never have I ever danced alone in the kitchen.",
  "Never have I ever cried at a song you played for me.",
  "Never have I ever forgotten an important date.",
  "Never have I ever wanted to travel somewhere on a whim.",
  "Never have I ever stayed up all night talking.",
];

export interface GuessQuestion {
  prompt: string;
  options: string[];
}

export const GUESS_QUESTIONS: GuessQuestion[] = [
  { prompt: "Your ideal weekend?", options: ["Beach", "Mountains", "City", "Home & blankets"] },
  { prompt: "Favourite cuisine?", options: ["Italian", "Indian", "Japanese", "Mexican"] },
  { prompt: "How do you like to be surprised?", options: ["A small gift", "A planned trip", "A handwritten letter", "A special dinner"] },
  { prompt: "Your dream travel style?", options: ["Slow and cosy", "Packed itinerary", "Road trip", "Luxury stay"] },
  { prompt: "Best way to spend a rainy day?", options: ["Movies", "Baking", "Reading", "Board games"] },
  { prompt: "What is your love language?", options: ["Words", "Touch", "Gifts", "Quality time"] },
];

export const KNOW_BETTER_QUESTIONS: GuessQuestion[] = [
  { prompt: "What would you order at a café?", options: ["Coffee", "Tea", "Hot chocolate", "Juice"] },
  { prompt: "Pick a song genre you play most.", options: ["Pop", "Classic", "Indie", "Bollywood"] },
  { prompt: "Your phone wallpaper is…", options: ["A photo of us", "Nature", "Something minimal", "A pet"] },
  { prompt: "On a free afternoon you would…", options: ["Nap", "Go out", "Cook", "Watch a series"] },
  { prompt: "Which dessert is your weakness?", options: ["Chocolate", "Ice cream", "Fruit", "Something baked"] },
  { prompt: "Your comfort show or film?", options: ["Romcom", "Thriller", "Animation", "Documentary"] },
];

export const LOVE_RESULTS: { min: number; message: string }[] = [
  { min: 90, message: "Off the charts. Frankly, the wheel is jealous." },
  { min: 75, message: "Strong and sweet. Keep doing what you are doing." },
  { min: 55, message: "A good, warm match with plenty of room to grow." },
  { min: 35, message: "A fun spark. Take each other on a surprise date." },
  { min: 0, message: "Opposites attract. Give it a little time and some laughter." },
];

export const LOVE_SEGMENTS = [12, 28, 37, 46, 58, 66, 74, 83, 91, 97, 42, 63];
