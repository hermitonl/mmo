console.log('[API Server Module] TOP OF FILE api/index.js loading/re-loading. Timestamp:', new Date().toISOString()); // New log
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors'); // Add this line
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v4: uuidv4 } = require('uuid');

// Cache for quiz data
const quizCache = {};
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_QUIZ_VERSIONS_PER_KEY = 10; // Store up to 10 different versions of a quiz for the same topic/count

const DEFAULT_QUIZZES_LIST = [
  {
    id: 'default-bitcoin-quiz-v1',
    topic: 'Bitcoin Basics',
    questions: [
      { q: "What is Bitcoin's maximum supply?", a: ["21 million", "100 million", "1 billion", "Unlimited"], correct: "21 million" },
      { q: "Who is the creator of Bitcoin?", a: ["Elon Musk", "Satoshi Nakamoto", "Vitalik Buterin", "Ada Lovelace"], correct: "Satoshi Nakamoto" },
      { q: "What consensus mechanism does Bitcoin use?", a: ["Proof of Stake", "Proof of Work", "Proof of Authority", "Proof of History"], correct: "Proof of Work" }
    ]
  },
  {
    id: 'default-lightning-quiz-v1',
    topic: 'Lightning Network Intro',
    questions: [
      { q: "What is the Lightning Network primarily for?", a: ["Storing Bitcoin", "Fast, cheap Bitcoin txs", "Mining Bitcoin", "Issuing new tokens"], correct: "Fast, cheap Bitcoin txs" },
      { q: "Lightning Network operates as a ___ layer.", a: ["Base", "Second", "Third", "Sidechain"], correct: "Second" },
      { q: "What are payment channels in Lightning?", a: ["Email addresses", "Two-party ledgers", "Public blockchains", "Centralized servers"], correct: "Two-party ledgers" }
    ]
  },
  {
    id: 'default-crypto-concepts-v1',
    topic: 'General Crypto Concepts',
    questions: [
      { q: "What does 'DeFi' stand for?", a: ["Decentralized Finance", "Digital Finance", "Default Finance", "Defined Finance"], correct: "Decentralized Finance" },
      { q: "What is a 'private key' in crypto?", a: ["A public address", "A password for an exchange", "A secret code to access funds", "A type of cryptocurrency"], correct: "A secret code to access funds" },
      { q: "What is 'blockchain'?", a: ["A type of coin", "A distributed ledger", "A crypto exchange", "A wallet software"], correct: "A distributed ledger" }
    ]
  }
  // Add more default quizzes here if desired
];

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

// New VERY EARLY middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[API Server VERY EARLY MW - ${timestamp}] Path: ${req.path}, OriginalURL: ${req.originalUrl}, Method: ${req.method}`);
  if (req.path && req.path.startsWith('/api/quiz')) {
    console.log(`[API Server VERY EARLY MW - ${timestamp}] SAW /api/quiz request`);
  }
  next();
});

// Middleware to log all requests (existing)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[API Server - ${timestamp}] Received request: ${req.method} ${req.originalUrl}`); // Existing log, added timestamp
  next();
});

const server = http.createServer(app);
const allowedOrigins = [
  "https://game-client-7p87.onrender.com", // Your deployed client
  "https://mmo.hermit.onl", // Custom domain of your deployed client (Render)
  "https://play.hermit.onl", // Custom domain of your deployed client (Vercel)
  "http://localhost:8080", // For local development
  "http://192.168.0.192:8080", // For local development
  "http://192.168.0.191:8080" // For local development (removed trailing slash)
];

if (process.env.CLIENT_ORIGIN) {
  console.log(`Using CLIENT_ORIGIN from env: ${process.env.CLIENT_ORIGIN}`);
  // Ensure the env var is added if it's not already in the array
  if (!allowedOrigins.includes(process.env.CLIENT_ORIGIN)) {
    allowedOrigins.push(process.env.CLIENT_ORIGIN);
  }
} else {
  console.log('CLIENT_ORIGIN not set, using default allowed origins.');
}
console.log('Allowed CORS origins:', allowedOrigins);

// CORS configuration for Express
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests) or if origin is in allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`[API Server CORS] Error: Origin ${origin} not allowed by CORS policy.`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true // If your frontend needs to send cookies or auth headers
};

// Use CORS middleware for all Express routes
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));


const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        console.error(msg + ": " + origin);
        return callback(new Error(msg));
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"]
  }
});

// Initialize Google Generative AI
// Make sure to set your GEMINI_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-03-25" }); // Or your preferred model

const players = {}; // Simple in-memory store for player data (positions, socket IDs)
let playerBalances = {}; // Initialize as empty, players get 0 sats on first contact via endpoint logic

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  players[socket.id] = {
    id: socket.id,
    x: Math.floor(Math.random() * 700) + 50, // Random initial x
    y: Math.floor(Math.random() * 500) + 50, // Random initial y
    // Add other player properties here if needed, e.g., character sprite
  };

  // Send the current players object to the new player
  socket.emit('currentPlayers', players);

  // Announce the new player to other players
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    // Emit a message to all other clients to remove this player
    io.emit('playerDisconnected', socket.id);
  });

  // Listen for player movement
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      // Broadcast the movement to other players
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  // Add more game-specific event handlers here
  // e.g., for quiz interactions, chat messages, etc.
});

// Basic route for testing if the server is up (optional)
app.get('/api', (req, res) => {
  res.send('Hello from the API server!');
});

async function fetchAndCacheQuiz(originalTopic, originalCount, cacheKey) {
  console.log(`[API Server /api/quiz BACKGROUND] Starting fetch for topic: "${originalTopic}", count: ${originalCount}, cacheKey: ${cacheKey}`);
  const prompt = `Please generate a quiz about the topic: "${originalTopic}".
The quiz should consist of ${originalCount} multiple-choice questions.

IMPORTANT INSTRUCTIONS FOR BREVITY, SIMPLICITY, AND UI COMPATIBILITY:
- Each question MUST be a single, short sentence, ideally under 15 words.
- Each of the 4 answer options MUST also be very short and concise, ideally just a few words or a short phrase (e.g., under 5 words per option).
- Use simple language. Avoid complex sentence structures or jargon where possible.
- The total length of the question and its four answers should be minimized to fit well in a game UI.

IMPORTANT INSTRUCTIONS FOR VARIETY AND CREATIVITY:
- Ensure the questions are significantly different from previously generated questions on this topic. Aim for novelty.
- Generate creative and non-repetitive questions.
- The answer options should be diverse and include plausible, yet clearly incorrect, distractors.
- Make the quiz engaging and fresh. Surprise me with the questions!

JSON OUTPUT FORMAT REQUIREMENTS:
Each question must have exactly 4 answer options.
For each question, clearly indicate which of the 4 options is the correct answer.
Return the entire quiz as a single JSON object. This JSON object should have a single key "questions", which is an array. Each element in the "questions" array should be an object with three keys:
1. "q": A string representing the question text.
2. "a": An array of 4 strings, representing the answer options.
3. "correct": A string that exactly matches one of the 4 answer options in the "a" array, indicating the correct answer.

Example of one question object:
{
  "q": "What is the capital of France?",
  "a": ["Berlin", "Madrid", "Paris", "Rome"],
  "correct": "Paris"
}

Please strictly adhere to this JSON format and ensure the output is only the JSON object itself, without any surrounding text or markdown.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[API Server /api/quiz BACKGROUND] CRITICAL: GEMINI_API_KEY is not set.");
      // No res object here, just log and exit function for background task
      return;
    }

    const generationConfig = {
      temperature: 0.8,
    };
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    });
    const response = await result.response;
    const text = response.text();

    let quizData;
    let parseErrorOccurred = false;

    try {
      quizData = JSON.parse(text);
      console.log("[API Server /api/quiz BACKGROUND] Successfully parsed AI response directly as JSON.");
    } catch (initialParseError) {
      console.warn("[API Server /api/quiz BACKGROUND] Initial JSON.parse(text) failed:", initialParseError.message);
      console.log("[API Server /api/quiz BACKGROUND] Raw Gemini response (that failed initial parse):", text);
      parseErrorOccurred = true;
    }

    if (parseErrorOccurred) {
      console.log("[API Server /api/quiz BACKGROUND] Attempting fallback: extracting JSON from markdown code block.");
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/s);
      if (jsonMatch && jsonMatch[1]) {
        const extractedJson = jsonMatch[1].trim();
        console.log("[API Server /api/quiz BACKGROUND] Extracted potential JSON from markdown:", extractedJson);
        try {
          quizData = JSON.parse(extractedJson);
          console.log("[API Server /api/quiz BACKGROUND] Successfully parsed extracted JSON from markdown.");
        } catch (fallbackParseError) {
          console.error("[API Server /api/quiz BACKGROUND] Fallback JSON.parse(extractedJson) failed:", fallbackParseError.message);
          console.error("[API Server /api/quiz BACKGROUND] Trimmed extracted JSON that failed fallback parse:", extractedJson);
          return; // Exit if parsing fails
        }
      } else {
        console.error("[API Server /api/quiz BACKGROUND] Fallback failed: No JSON markdown code block found.");
        return; // Exit if no JSON found
      }
    }

    if (!quizData || typeof quizData !== 'object' || !Array.isArray(quizData.questions)) {
      console.error("[API Server /api/quiz BACKGROUND] Parsed data is not in the expected format:", quizData);
      return;
    }

    const validatedQuestions = [];
    for (const q of quizData.questions) {
      if (
        q &&
        typeof q.q === 'string' &&
        Array.isArray(q.a) &&
        q.a.length === 4 &&
        q.a.every(opt => typeof opt === 'string') &&
        typeof q.correct === 'string' &&
        q.a.includes(q.correct)
      ) {
        validatedQuestions.push({ q: q.q, a: q.a, correct: q.correct });
      } else {
        console.warn("[API Server /api/quiz BACKGROUND] Skipping malformed question from AI:", q);
      }
    }

    if (validatedQuestions.length === 0) {
      console.error(`[API Server /api/quiz BACKGROUND] No valid questions could be generated or parsed for topic: ${originalTopic}.`);
      return;
    }
     if (validatedQuestions.length < originalCount && quizData.questions.length > 0) {
        console.warn(`[API Server /api/quiz BACKGROUND] Requested ${originalCount} questions for ${originalTopic}, but only ${validatedQuestions.length} were valid.`);
    }


    const quizId = uuidv4();

    // Shuffle answers for each question before caching
    validatedQuestions.forEach(question => {
      if (question.a && Array.isArray(question.a)) {
        shuffleArray(question.a);
      }
    });

    const quizDataFromGemini = {
      id: quizId,
      topic: originalTopic, // Use the original requested topic here
      questions: validatedQuestions // Now with shuffled answers
    };

    // Initialize the array for this cache key if it doesn't exist
    if (!Array.isArray(quizCache[cacheKey])) {
      quizCache[cacheKey] = [];
    }

    const newCacheEntry = {
      data: quizDataFromGemini, // Already has shuffled answers
      expiresAt: Date.now() + CACHE_DURATION_MS,
      fetchedAt: Date.now() // To identify the newest if needed, though unshift handles it
    };

    // Add the new quiz version to the beginning of the array
    quizCache[cacheKey].unshift(newCacheEntry);

    // Ensure we don't store more than MAX_QUIZ_VERSIONS_PER_KEY
    if (quizCache[cacheKey].length > MAX_QUIZ_VERSIONS_PER_KEY) {
      quizCache[cacheKey].pop(); // Remove the oldest version (from the end)
    }

    console.log(`[API Server /api/quiz BACKGROUND] Cached new data for key: ${cacheKey}, topic: ${originalTopic}. Versions stored: ${quizCache[cacheKey].length}. Expires at: ${new Date(newCacheEntry.expiresAt).toISOString()}`);

  } catch (error) {
    console.error(`[API Server /api/quiz BACKGROUND] Error generating quiz for topic "${originalTopic}":`, error);
    // Specific error logging for API key or connection issues can be added here if needed
  }
}


// New GET /api/quiz endpoint
app.get('/api/quiz', async (req, res) => {
  const { topic: requestedTopic } = req.query; // Renamed to avoid conflict
  const count = parseInt(req.query.count, 10) || 3; // Default to 3 questions

  if (!requestedTopic) {
    return res.status(400).json({ error: "Missing 'topic' query parameter" });
  }

  if (isNaN(count) || count <= 0 || count > 10) { // Max 10 questions for this endpoint
    return res.status(400).json({ error: "Invalid 'count'. Must be a number between 1 and 10." });
  }

  const cacheKey = `quiz-${requestedTopic}-${count}`;

  // Check cache for the *requested* quiz
  let servedFromCache = false;
  if (Array.isArray(quizCache[cacheKey]) && quizCache[cacheKey].length > 0) {
    // Filter out expired versions and update the cache for this key
    const now = Date.now();
    const validEntries = quizCache[cacheKey].filter(entry => now < entry.expiresAt);
    quizCache[cacheKey] = validEntries; // Update cache with only valid entries

    if (validEntries.length > 0) {
      // Randomly select one of the valid, non-expired quiz versions
      const randomIndex = Math.floor(Math.random() * validEntries.length);
      const quizToServeEntry = validEntries[randomIndex];
      const quizToServe = quizToServeEntry.data; // This data already has answers shuffled

      console.log(`[API Server /api/quiz] Cache HIT for key: ${cacheKey} (topic: ${requestedTopic}). Randomly serving 1 of ${validEntries.length} valid versions. Selected version fetched at ${new Date(quizToServeEntry.fetchedAt).toISOString()}`);
      
      // Send a deep copy to prevent accidental modification of the cached object
      const cachedQuizCopy = JSON.parse(JSON.stringify(quizToServe));
      res.json(cachedQuizCopy);
      servedFromCache = true;
    }
  }

  if (servedFromCache) {
    return; // Response already sent
  }

  // Cache MISS for the requested quiz (or all versions expired)
  console.log(`[API Server /api/quiz] Cache MISS for key: ${cacheKey} (topic: ${requestedTopic}). Serving a RANDOMLY SELECTED default quiz (with shuffled answers) and fetching in background.`);
  
  // Select a random default quiz from the list
  const randomDefaultQuizIndex = Math.floor(Math.random() * DEFAULT_QUIZZES_LIST.length);
  const selectedDefaultQuiz = DEFAULT_QUIZZES_LIST[randomDefaultQuizIndex];

  // Create a deep copy of the selected default quiz to shuffle its answers
  const defaultQuizCopy = JSON.parse(JSON.stringify(selectedDefaultQuiz));
  defaultQuizCopy.questions.forEach(question => {
    if (question.a && Array.isArray(question.a)) {
      shuffleArray(question.a);
    }
  });
  // Immediately return the randomly selected, shuffled default quiz
  console.log(`[API Server /api/quiz] Serving randomly selected default quiz: "${defaultQuizCopy.topic}" (ID: ${defaultQuizCopy.id})`);
  res.json(defaultQuizCopy);

  // Asynchronously fetch the *actually requested* quiz and cache it (fetchAndCacheQuiz will also shuffle answers)
  fetchAndCacheQuiz(requestedTopic, count, cacheKey)
    .catch(err => {
      // Log errors from the background fetch, but don't crash the server or affect the response already sent
      console.error(`[API Server /api/quiz BACKGROUND] Unhandled error during fetchAndCacheQuiz for ${cacheKey}:`, err);
    });
});

// Endpoint to generate a quiz
app.get('/api/quiz/generate', async (req, res) => {
  const { topic, numQuestions: numQuestionsStr } = req.query;
  const numQuestions = parseInt(numQuestionsStr, 10) || 5; // Default to 5 questions

  if (!topic) {
    return res.status(400).json({ error: "Missing 'topic' query parameter" });
  }

  if (isNaN(numQuestions) || numQuestions <= 0 || numQuestions > 20) { // Added upper limit for safety
    return res.status(400).json({ error: "Invalid 'numQuestions'. Must be between 1 and 20." });
  }

  const prompt = `Generate a multiple-choice quiz about "${topic}".
The quiz should have ${numQuestions} questions.
Each question must have exactly 4 answer options.
Clearly indicate the single correct answer for each question.
Format the output as a valid JSON array of objects, where each object represents a question and has the following structure:
{
  "question_text": "The text of the question",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": "The text of the correct option"
}
Ensure the entire output is a single, valid JSON array. Do not include any text before or after the JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let generatedQuestions;
    try {
      // Attempt to parse the text directly as JSON
      // Gemini should ideally return clean JSON based on the prompt
      generatedQuestions = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      console.error("Raw Gemini response:", text);
      // Fallback: try to extract JSON from markdown code block if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          generatedQuestions = JSON.parse(jsonMatch[1]);
        } catch (fallbackParseError) {
          console.error("Failed to parse extracted JSON from markdown:", fallbackParseError);
          return res.status(500).json({ error: "Failed to parse quiz data from AI response. The response was not valid JSON.", details: fallbackParseError.message, rawResponse: text });
        }
      } else {
        return res.status(500).json({ error: "Failed to parse quiz data from AI response. The response was not valid JSON and no markdown block found.", rawResponse: text });
      }
    }

    if (!Array.isArray(generatedQuestions)) {
        console.error("Parsed data is not an array:", generatedQuestions);
        return res.status(500).json({ error: "AI response did not result in a valid array of questions." });
    }

    const formattedQuestions = generatedQuestions.map(q => {
      if (!q.question_text || !Array.isArray(q.options) || q.options.length !== 4 || !q.correct_answer) {
        console.warn("Skipping malformed question from AI:", q);
        return null; // Skip malformed questions
      }
      return {
        q: q.question_text,
        a: q.options,
        correct: q.correct_answer
      };
    }).filter(q => q !== null); // Remove any null entries from malformed questions

    if (formattedQuestions.length === 0 && generatedQuestions.length > 0) {
        return res.status(500).json({ error: "All questions received from AI were malformed." });
    }
     if (formattedQuestions.length < numQuestions && generatedQuestions.length > 0) {
        console.warn(`Requested ${numQuestions} questions, but only ${formattedQuestions.length} were valid after parsing.`);
    }


    const quizId = `quiz_${Date.now()}`;
    res.json({
      id: quizId,
      topic: topic,
      questions: formattedQuestions
    });

  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    res.status(500).json({ error: "Failed to generate quiz due to an internal server error.", details: error.message });
  }
});
// Endpoint for the demon to answer questions using Gemini
app.post('/api/ask-demon', async (req, res) => {
  const { question, playerId, frontendBalance } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Missing 'question' in request body." });
  }
  if (!playerId) {
    return res.status(400).json({ error: "Missing 'playerId' in request body. The demon requires your identity!" });
  }

  // Initialize balance if player is new
  // Synchronize balance: Use frontendBalance if player is new or if frontend has a higher (more up-to-date) balance.
  const currentBackendBalance = playerBalances[playerId];
  let effectiveBalance = 0; // Default to 0 if no other info

  if (currentBackendBalance !== undefined) {
    effectiveBalance = currentBackendBalance; // Player known, start with their backend balance
  }

  if (typeof frontendBalance === 'number' && frontendBalance >= 0) {
    if (currentBackendBalance === undefined) {
      // Player is new to backend, trust frontend's balance as starting point
      effectiveBalance = frontendBalance;
      console.log(`[API Server /api/ask-demon] New player ${playerId} identified by backend. Using frontendBalance: ${frontendBalance} as initial sats.`);
    } else if (frontendBalance > currentBackendBalance) {
      // Frontend has more sats (e.g., earned offline or from other interactions not yet synced)
      // For this simple model, we'll trust the frontend if it's higher.
      effectiveBalance = frontendBalance;
      console.log(`[API Server /api/ask-demon] Player ${playerId} frontendBalance (${frontendBalance}) is higher than backend (${currentBackendBalance}). Updating backend.`);
    } else if (frontendBalance < currentBackendBalance) {
        // Backend has more - this could happen if another transaction occurred on backend.
        // For now, we'll still use backend's higher value. Frontend will sync on response.
        console.log(`[API Server /api/ask-demon] Player ${playerId} backendBalance (${currentBackendBalance}) is higher than frontend (${frontendBalance}). Using backend balance.`);
    }
    // If frontendBalance === currentBackendBalance, effectiveBalance is already correct.
  } else if (currentBackendBalance === undefined) {
    // Player is new, and no valid frontendBalance was sent, default to 0.
    console.log(`[API Server /api/ask-demon] New player ${playerId} with no valid frontendBalance. Initializing with 0 virtual sats.`);
  }
  // If player known and no frontendBalance, effectiveBalance remains currentBackendBalance.

  playerBalances[playerId] = effectiveBalance; // Set the synchronized or initial balance

  // Check player balance
  if (playerBalances[playerId] < 1) {
    console.log(`[API Server /api/ask-demon] Player ${playerId} has insufficient sats (${playerBalances[playerId]}).`);
    return res.status(402).json({ // 402 Payment Required
      error: "Not enough virtual sats. The demon demands payment! You need at least 1 sat.",
      currentBalance: playerBalances[playerId]
    });
  }

  // Deduct sats
  playerBalances[playerId] -= 1;
  console.log(`[API Server /api/ask-demon] Player ${playerId} paid 1 sat. New balance: ${playerBalances[playerId]}. Question: "${question}"`);


  if (!process.env.GEMINI_API_KEY) {
    console.error("[API Server /api/ask-demon] CRITICAL: GEMINI_API_KEY is not set.");
    // Refund sat if Gemini call can't be made
    playerBalances[playerId] += 1;
    console.log(`[API Server /api/ask-demon] GEMINI_API_KEY not set. Refunding 1 sat to ${playerId}. New balance: ${playerBalances[playerId]}.`);
    return res.status(500).json({ error: "Server configuration error: AI service is unavailable." });
  }

  const prompt = `You are a wise, slightly mischievous, but ultimately helpful demon.
A player has asked you the following question: "${question}"

Your task is to answer this question. However, you MUST adhere to the following rules:
1.  Your knowledge is strictly limited to Bitcoin, the Lightning Network, and Lightning Service Providers (LSPs).
2.  If the question is about any other topic, you must politely state that the topic is outside your domain of expertise and you cannot answer. For example, say something like: "Hah! A curious question, mortal, but alas, matters of [off-topic subject] are beyond my ken. I only deal in the arcane arts of Bitcoin, Lightning, and LSPs!"
3.  If the question IS on-topic (Bitcoin, Lightning Network, LSPs), provide a helpful and friendly answer.
4.  Keep your answer concise, ideally 2-3 short paragraphs.
5.  Maintain a slightly mischievous, ancient, and wise demonic tone. For example, you might start with "Hmm, a seeker of knowledge, are we?" or "The ether whispers of such things..."

Do not provide any preamble or explanation of these rules in your response. Just give the answer (or the polite refusal if off-topic) directly.`;

  try {
    const generationConfig = {
      temperature: 0.7, // Adjust for desired creativity/factuality balance
      maxOutputTokens: 2048, // Further increased token limit
    };
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    });
    const response = await result.response;
    let demonAnswer = ""; // Initialize
    const candidate = response.candidates && response.candidates[0];

    if (response.promptFeedback && response.promptFeedback.blockReason) {
        console.warn(`[API Server /api/ask-demon] Prompt blocked by Gemini. Reason: ${response.promptFeedback.blockReason}`);
        demonAnswer = `The demon recoils from your very query! (Issue: ${response.promptFeedback.blockReason})`;
        if (response.promptFeedback.safetyRatings) {
            console.log("[API Server /api/ask-demon] Prompt Safety Ratings:", JSON.stringify(response.promptFeedback.safetyRatings, null, 2));
        }
    } else if (candidate) {
        demonAnswer = response.text(); // Helper for candidate.content.parts[0].text
        console.log(`[API Server /api/ask-demon] Raw demonAnswer from Gemini: "${demonAnswer}"`);

        const finishReason = candidate.finishReason;
        const safetyRatings = candidate.safetyRatings;

        if (finishReason && finishReason !== "STOP") {
            console.warn(`[API Server /api/ask-demon] Gemini finishReason: ${finishReason}.`);
            if (demonAnswer.trim() === "") { // If response is empty and finishReason is not STOP
                demonAnswer = `The demon's words trail off into the ether... (Reason: ${finishReason})`;
            }
        }
        
        if (safetyRatings && safetyRatings.some(r => r.blocked || (r.probability && ['HIGH', 'MEDIUM'].includes(r.probability.toUpperCase())) )) {
            // Check for 'blocked' or high/medium probability of harmful content
            console.warn("[API Server /api/ask-demon] Gemini response has safety concerns:", JSON.stringify(safetyRatings, null, 2));
            const concerningRating = safetyRatings.find(r => r.blocked || (r.probability && ['HIGH', 'MEDIUM'].includes(r.probability.toUpperCase())));
            const category = concerningRating ? concerningRating.category : "UNKNOWN_SAFETY_CONCERN";
            // If already blocked by finishReason='SAFETY', this might be redundant but provides more detail
            if (demonAnswer.trim() === "" || finishReason === "SAFETY") {
                demonAnswer = `The demon shudders, refusing to speak on such a matter (Concern: ${category}).`;
            }
        }

        // If answer is still empty after all specific checks (e.g., finishReason was STOP but text was genuinely empty)
        if (demonAnswer.trim() === "") {
            console.warn("[API Server /api/ask-demon] Gemini returned an empty answer despite no explicit block or adverse finishReason/safetyRating.");
            demonAnswer = "The demon stares blankly, offering no words. Perhaps the question was too mundane, or too profound?";
        }
    } else {
        // This case means no candidates were returned and the prompt itself wasn't blocked. Highly unusual.
        console.error("[API Server /api/ask-demon] No candidates found in Gemini response and no prompt block. This is unexpected.");
        demonAnswer = "The demon seems to have vanished in a puff of arcane static!";
    }

    res.json({ answer: demonAnswer, newBalance: playerBalances[playerId] });

  } catch (error) {
    console.error("[API Server /api/ask-demon] Error during Gemini API call or processing:", error);
    // Refund sat if Gemini call fails
    playerBalances[playerId] += 1;
    console.log(`[API Server /api/ask-demon] Gemini API processing error. Refunding 1 sat to ${playerId}. New balance: ${playerBalances[playerId]}.`);
    
    let errorMessage = "The demon is wrestling with arcane energies and cannot answer. Try again later.";
    let errorDetails = error.message || "No specific details available.";

    if (error.response && error.response.promptFeedback) {
        console.error("[API Server /api/ask-demon] Gemini Prompt Feedback:", JSON.stringify(error.response.promptFeedback, null, 2));
        errorMessage = "The demon found your query... problematic. (Prompt Feedback)";
        errorDetails = JSON.stringify(error.response.promptFeedback);
    } else if (error.message && error.message.toLowerCase().includes('api key not valid')) {
        errorMessage = "The demon's source of knowledge is currently inaccessible (API key issue).";
    } else if (error.message && error.message.toLowerCase().includes('quota')) {
        errorMessage = "The demon has exhausted its daily allowance of whispers from the void (Quota Exceeded).";
    }
    
    // Ensure we always send a JSON response
    if (!res.headersSent) {
        res.status(500).json({
            error: errorMessage,
            details: errorDetails,
            fullError: error.stack, // Include stack for more detailed debugging if needed by server admin
            newBalance: playerBalances[playerId]
        });
    } else {
        console.error("[API Server /api/ask-demon] Headers already sent, could not send JSON error response.");
    }
  }
});

// Vercel will typically handle starting the server.
// For local development, you might add:
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[API Server] Listening on http://localhost:${PORT}`);
  console.log(`[API Server] Socket.IO server also attached.`);
});

module.exports = server; // Export for serverless, but listen locally too