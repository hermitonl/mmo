require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[API Server] Received request: ${req.method} ${req.originalUrl}`);
  next();
});

const server = http.createServer(app);
const allowedOrigins = [
  "https://game-client-7p87.onrender.com", // Your deployed client
  "https://mmo.hermit.onl", // Custom domain of your deployed client (Render)
  "https://play.hermit.onl", // Custom domain of your deployed client (Vercel)
  "http://localhost:8080", // For local development
  "http://192.168.0.192:8080/" // For local development
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

const players = {}; // Simple in-memory store for player data

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

// New GET /api/quiz endpoint
app.get('/api/quiz', async (req, res) => {
  const { topic } = req.query;
  const count = parseInt(req.query.count, 10) || 3; // Default to 3 questions

  if (!topic) {
    return res.status(400).json({ error: "Missing 'topic' query parameter" });
  }

  if (isNaN(count) || count <= 0 || count > 10) { // Max 10 questions for this endpoint
    return res.status(400).json({ error: "Invalid 'count'. Must be a number between 1 and 10." });
  }

  const prompt = `Please generate a quiz about the topic: "${topic}".
The quiz should consist of ${count} multiple-choice questions.
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
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let quizData;
    let parseErrorOccurred = false;

    try {
      // Primary attempt: Parse the text directly as JSON
      quizData = JSON.parse(text);
      console.log("[API Server] Successfully parsed AI response directly as JSON.");
    } catch (initialParseError) {
      console.warn("[API Server] Initial JSON.parse(text) failed:", initialParseError.message);
      console.log("[API Server] Raw Gemini response (that failed initial parse):", text);
      parseErrorOccurred = true; // Mark that we need to try the fallback
    }

    if (parseErrorOccurred) {
      // Fallback attempt: Extract JSON from markdown code block
      console.log("[API Server] Attempting fallback: extracting JSON from markdown code block.");
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/s); // Added 's' flag for dotall
      if (jsonMatch && jsonMatch[1]) {
        const extractedJson = jsonMatch[1].trim();
        console.log("[API Server] Extracted potential JSON from markdown:", extractedJson);
        try {
          quizData = JSON.parse(extractedJson);
          console.log("[API Server] Successfully parsed extracted JSON from markdown.");
        } catch (fallbackParseError) {
          console.error("[API Server] Fallback JSON.parse(extractedJson) failed:", fallbackParseError);
          console.error("[API Server] Trimmed extracted JSON that failed fallback parse:", extractedJson);
          return res.status(500).json({
            error: "Failed to parse quiz data from AI (fallback attempt).",
            details: fallbackParseError.message,
            rawResponse: text,
            extractedJsonAttempt: extractedJson
          });
        }
      } else {
        console.error("[API Server] Fallback failed: No JSON markdown code block found in AI response.");
        return res.status(500).json({
          error: "AI response was not valid JSON and no JSON markdown code block was found.",
          rawResponse: text
        });
      }
    }

    // Validate the structure of quizData
    if (!quizData || typeof quizData !== 'object' || !Array.isArray(quizData.questions)) {
      console.error("Parsed data is not in the expected format (missing 'questions' array):", quizData);
      return res.status(500).json({ error: "AI response did not result in a valid quiz structure." });
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
        console.warn("Skipping malformed question from AI:", q);
      }
    }

    if (validatedQuestions.length === 0 && quizData.questions.length > 0) {
        return res.status(500).json({ error: "All questions received from AI were malformed." });
    }
     if (validatedQuestions.length < count && quizData.questions.length > 0) {
        console.warn(`Requested ${count} questions, but only ${validatedQuestions.length} were valid after parsing and validation.`);
    }
    if (validatedQuestions.length === 0) {
        return res.status(500).json({ error: "No valid questions could be generated or parsed." });
    }


    const quizId = uuidv4();
    res.json({
      id: quizId,
      topic: topic,
      questions: validatedQuestions
    });

  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    if (error.message && error.message.includes("API key not valid")) {
        return res.status(500).json({ error: "Failed to generate quiz. API key is not valid. Please check server configuration."});
    }
    res.status(500).json({ error: "Failed to generate quiz due to an internal server error.", details: error.message });
  }
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

// Vercel will typically handle starting the server.
// For local development, you might add:
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[API Server] Listening on http://localhost:${PORT}`);
  console.log(`[API Server] Socket.IO server also attached.`);
});

module.exports = server; // Export for serverless, but listen locally too