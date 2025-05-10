# Amazon Q Developer Context File for "Bitcoin Quiz Game"

This document provides detailed context for Amazon Q Developer to assist in the development, maintenance, and enhancement of the "Top-Down Bitcoin Quiz Game." Its purpose is to enable Amazon Q to provide highly relevant, accurate, and efficient support by understanding the project's nuances.

## 1. Project Overview

*   **Project Name:** Top-Down Bitcoin Quiz Game (also known as "Bitcoin Quest")
*   **Elevator Pitch:** An engaging 2D top-down educational game built with Phaser 3 and Cordova, where players learn about Bitcoin concepts by exploring, interacting with NPCs, completing timed quizzes, and chatting with an AI Demon.
*   **Primary Goal:** To make learning about Bitcoin fun, accessible, and interactive.
*   **Secondary Goals:**
    *   Showcase innovative use of game mechanics for education.
    *   Explore cross-platform deployment using Cordova.
    *   Demonstrate effective integration of Amazon Q Developer in the development lifecycle.
    *   Leverage Gemini AI for dynamic quiz generation and interactive NPC chat.
*   **Current Status:** Playable version deployed, migrated from an earlier Hytopia SDK 3D prototype, now includes AI Demon Chat, Virtual Sats Economy (session-based), and basic real-time multiplayer.
*   **Target Platforms:** Web (primary via Render.com/Vercel), potentially Android/iOS via Cordova builds.

## 2. Core Gameplay Loop

1.  **Explore:** Player navigates a 2D tile-based map using arrow keys or on-screen D-pad.
2.  **Learn:** Player interacts (presses 'E' or tap) with "Knowledge NPCs" who deliver short lessons on Bitcoin topics. Player earns a small amount of "Sats" (in-game currency) for completing a lesson.
3.  **Quiz:** Player interacts with "Quiz NPCs."
    *   NPC presents a quiz topic (some AI-generated, some predefined).
    *   Player accepts, Sats may be deducted for certain quizzes.
    *   A timed multiple-choice question (A, B, C, D) appears.
    *   Player moves their character avatar into the physical zone on the map corresponding to their chosen answer before the timer runs out.
4.  **AI Demon Chat:** Player interacts with the Demon NPC.
    *   Spends 1 Sat to ask a question.
    *   Receives an AI-generated response about Bitcoin, Lightning Network, or LSPs.
5.  **Reward:** Correct quiz answers award more Sats. Incorrect answers or running out of time result in no reward for that question.
6.  **Progression:** Player accumulates Sats. (Future: Unlock new areas, cosmetic items, or more advanced topics).
7.  **Multiplayer Interaction:** Players can see other players moving in real-time on the map.

## 3. Target Audience & Educational Goals

*   **Target Audience:** Individuals new to Bitcoin and cryptocurrencies, students, gamers interested in educational content. Age range: 13+.
*   **Educational Philosophy:** Learn-by-doing, gamified learning, bite-sized information, interactive AI conversations.
*   **Key Bitcoin Concepts to Cover (Examples):**
    *   What is Bitcoin? Blockchain basics.
    *   Mining, Proof-of-Work.
    *   Wallets, Private/Public Keys.
    *   Transactions, Confirmations.
    *   Scarcity, Halving.
    *   Common terms (HODL, Satoshi, FUD).
    *   Security best practices.
    *   Lightning Network basics.
    *   Lightning Service Providers (LSPs).
    *   (Expandable list)

## 4. Art Style & Look and Feel

*   **Visual Style:** Retro-inspired 2D pixel art, reminiscent of 16-bit era RPGs or adventure games (e.g., classic Zelda, Pokémon). Clean, vibrant, and inviting.
*   **Character Design:** Simple, recognizable player avatar. NPCs should be visually distinct based on their role (Knowledge, Quiz, AI Demon).
*   **Environment Design:** Tile-based maps with clear pathways and distinct zones for answers. Visual cues for interactable objects.
*   **UI/UX:**
    *   Minimalist on-screen UI during exploration (Sats display, interaction prompts).
    *   Clear, legible text for lessons, quiz questions, and AI chat.
    *   Intuitive interaction prompts (e.g., "Press E to talk").
    *   Visual feedback for correct/incorrect answers, timer, Sat transactions.
*   **Audio:**
    *   Upbeat, retro-style background music (chiptune).
    *   Simple sound effects for movement, interaction, correct/incorrect answers, earning/spending Sats.

## 5. Key Game Mechanics (Detailed)

*   **Player Movement:** 4-directional (or 8-directional) tile-based movement. Collision with map boundaries and non-traversable tiles.
*   **NPC Interaction:** Proximity-based. An interaction prompt appears when the player is close enough to an NPC.
*   **Lesson Delivery:** Modal dialog box or dedicated UI panel displaying text-based lessons. Option to paginate longer lessons.
*   **Quiz System:**
    *   **Question Structure:** Question text, 4 answer options (A, B, C, D). One correct answer. AI-generated quizzes use Gemini.
    *   **Answer Zones:** Clearly marked rectangular areas on the map, each corresponding to an answer choice.
    *   **Timer:** Visual countdown timer. Duration adjustable per question difficulty.
    *   **Scoring:** Fixed Sat reward per correct answer.
    *   **Caching Strategy (for AI Quizzes):** The backend (`api/index.js`) employs a caching mechanism. If a specific AI quiz isn't cached or is stale, a default "Bitcoin Basics" quiz is served immediately while the requested quiz is fetched from Gemini in the background. The cache stores multiple versions with shuffled answers and a 5-minute expiry (details in `quiz_app_design.md`).
*   **Currency System (Sats):**
    *   Tracked globally for the player (session-based).
    *   Used to pay for some quiz attempts and for AI Demon Chat (1 Sat per query).
*   **AI Demon Chat:**
    *   **Trigger:** Interaction with the Demon NPC.
    *   **Mechanism:** Player's query sent to `/api/ask-demon`. Backend verifies/deducts 1 Sat, then queries Gemini AI for a response.
    *   **Topics:** Bitcoin, Lightning Network, Lightning Service Providers (LSPs).
*   **Multiplayer Functionality:**
    *   **Core Feature:** Basic real-time player presence using Socket.IO.
    *   **Player Experience:** Players see other connected players as sprites moving on the map. Positions are synchronized via the backend.
*   **Game State Management:** Current player position, Sats balance, completed lessons/quizzes. (Phaser's DataManager or a simple global state object in `www/js/index.js`).

## 6. Technical Stack & Architecture

*   **Game Engine:** Phaser 3 (latest stable version).
*   **Language:** JavaScript (ES6+).
*   **AI for Quiz Generation & Chat:** Google Gemini AI (via `@google/generative-ai` SDK).
*   **Backend Framework:** Node.js with Express.
*   **Real-time Communication:** Socket.IO.
*   **Mobile Wrapper:** Apache Cordova.
*   **Key Phaser Modules Used:** Scenes, Sprites, Tilemaps, Arcade Physics, Input (Keyboard & Touch), Tweens, Text objects, Groups, DataManager.
*   **Project Structure:**
    *   `www/`: Contains all game assets (HTML, CSS, JS, images, audio).
        *   `www/index.html`: Main entry point.
        *   `www/js/index.js`: Main Phaser game logic, including scene management, quiz handling, AI Demon chat UI, Sats display management, and Socket.IO client event handling for multiplayer.
        *   `www/assets/`: Images, audio, tilemaps, sprite sheets.
    *   `api/index.js`: Node.js Express backend, Socket.IO server, Gemini AI interaction for quiz generation and AI Demon chat, quiz caching, and conceptual Sat management.
    *   `config.xml`: Cordova configuration.
    *   `hooks/`: Cordova hooks.
    *   `res/`: Platform-specific resources.
    *   `render.yaml`: Render.com deployment configuration.
    *   `vercel.json`: Vercel deployment configuration.
*   **Deployment:**
    *   Web: Render.com (API & Client), Vercel (Client).
    *   Mobile: Cordova CLI builds.

## 7. Amazon Q Developer Integration Strategy

This section outlines how Amazon Q Developer should be leveraged, including desired configurations for context profiles and potential MCP setups.

### 7.1. Context Profiles for Amazon Q CLI / IDE

Define distinct profiles to help Q provide specialized assistance:

*   **Profile: `phaser-gamedev`**
    *   **Focus:** Core Phaser 3 game logic, scene management, sprite manipulation, physics, input handling, asset loading, Socket.IO client integration for multiplayer, UI for AI chat interactions.
    *   **Preferred Language/Syntax:** JavaScript ES6+, Phaser 3 API conventions.
    *   **Key Knowledge Areas:** Phaser 3 documentation, common Phaser patterns (state machines, event emitters), 2D game development principles, Socket.IO client API.
    *   **Example Use Case:** "In profile `phaser-gamedev`, how do I best manage Socket.IO event listeners in `GameScene.js` for player movement (`playerMoved`, `newPlayer`, `playerDisconnected`) and AI Demon chat responses, ensuring UI updates correctly as per the flows in `quiz_app_design.md`?"

*   **Profile: `cordova-mobile`**
    *   **Focus:** Cordova setup, plugin integration (e.g., `cordova-plugin-browsersync`, status bar, splash screen), build processes for Android/iOS, platform-specific considerations.
    *   **Key Knowledge Areas:** Cordova CLI commands, `config.xml` structure, lifecycle events, common mobile development challenges (performance, screen sizes).
    *   **Example Use Case:** "Using profile `cordova-mobile`, what's the best way to handle safe areas for UI elements on notched iPhone devices, considering the UI described in `quiz_app_design.md`?"

*   **Profile: `bitcoin-education`**
    *   **Focus:** Accuracy of Bitcoin concepts, clarity of educational content, quiz question formulation, lesson structuring, generating engaging and accurate conversational content for the AI Demon on topics like Lightning Network and LSPs.
    *   **Key Knowledge Areas:** Reputable Bitcoin educational resources, common misconceptions about Bitcoin, age-appropriate language, conversational AI best practices for educational bots.
    *   **Example Use Case:** "In profile `bitcoin-education`, draft three distinct, informative responses for the AI Demon NPC when a player asks 'What is the Lightning Network?', suitable for a beginner and reflecting the 1 Sat cost, as outlined in `quiz_app_design.md`."

*   **Profile: `project-management-mmo`** (MMO refers to the project [codename/repo name](https://github.com/hermitonl/mmo))
    *   **Focus:** Overall project structure, task breakdown, documentation (like this file, `README.md`, `quiz_app_design.md`), version control (Git), issue tracking.
    *   **Key Knowledge Areas:** This `AmazonQContext.md` file, `README.md`, `quiz_app_design.md`, `render.yaml`, `vercel.json`, `package.json`.
    *   **Example Use Case:** "Using profile `project-management-mmo`, based on the 'Virtual Sats Economy' and 'AI Demon Chat' sections in `quiz_app_design.md`, what are the key frontend tasks in `www/js/index.js` to implement the Sat deduction and display for the Demon chat feature?"

### 7.2. Context Hooks (Conceptual for CLI/IDE)

How context hooks could ideally enhance Q's assistance:

*   **File System Awareness:** When asking Q to generate code or scripts, hooks could allow Q to:
    *   Read `package.json` to understand existing scripts and dependencies.
    *   Scan `www/js/` (especially `index.js` and any scene files) to know which scenes/major functions already exist.
    *   Check `config.xml` for installed Cordova plugins.
    *   Read `quiz_app_design.md` to understand detailed feature specifications, API endpoints (`/api/quiz`, `/api/ask-demon`), and interaction flows when generating code or plans.
*   **Git Integration:** Hooks could enable Q to:
    *   Be aware of the current branch.
    *   Suggest commit messages based on changes.
    *   Reference recent changes when debugging.
*   **Live Game State (Advanced/Hypothetical):** For debugging, hooks could (in an ideal future) allow Q to query certain aspects of the live running game (e.g., current scene, player coordinates, Sat balance) if a debug bridge was established.

### 7.3. Amazon Q MCP Configuration (Desired)

If setting up a custom MCP server for this project:

*   **Server Name:** `BitcoinQuizGameHelper`
*   **Provided Tools:**
    *   **Tool: `get_bitcoin_concept_explanation`**
        *   **Description:** Fetches a curated, verified explanation of a Bitcoin concept suitable for the game's audience.
        *   **Input Schema:** `{ "concept_name": "string" }` (e.g., "Proof-of-Work")
        *   **Output:** Plain text explanation.
        *   **Underlying Logic:** Could query a trusted Bitcoin API or a custom knowledge base.
    *   **Tool: `generate_quiz_question`**
        *   **Description:** Generates a multiple-choice quiz question for a given Bitcoin topic.
        *   **Input Schema:** `{ "topic": "string", "difficulty": "easy|medium|hard" }`
        *   **Output:** `{ "question": "string", "options": ["A", "B", "C", "D"], "correct_answer": "char" }`
        *   **Underlying Logic:** Could use a template engine combined with concept data, or Gemini AI. *Note: This tool should ideally be aware of the quiz caching strategy detailed in `quiz_app_design.md` to help generate varied questions that complement, rather than duplicate, recently cached or default quizzes.*
    *   **Tool: `get_demon_chat_response`**
        *   **Description:** Generates a contextually appropriate conversational response for the AI Demon NPC.
        *   **Input Schema:** `{ "player_query": "string", "conversation_history": "array_of_strings (optional)", "topic_context": "Bitcoin|Lightning|LSP|General" }`
        *   **Output:** `{ "demon_response": "string" }`
        *   **Underlying Logic:** Utilizes Gemini AI with specific system prompts tailored for the Demon character's persona and knowledge domain (Bitcoin, Lightning, LSPs).
    *   **Tool: `validate_phaser_code_snippet`**
        *   **Description:** Performs a basic linting and Phaser 3 best-practice check on a JavaScript code snippet.
        *   **Input Schema:** `{ "code": "string" }`
        *   **Output:** `{ "isValid": "boolean", "suggestions": ["string"] }`
*   **Provided Resources:**
    *   **URI: `game://assets/tilemap/main.json`** - Provides the current main tilemap data.
    *   **URI: `game://state/player`** - Provides current player Sats, completed quizzes (hypothetical live data).
    *   **URI: `docs://bitcoin/all_concepts`** - List of all Bitcoin concepts covered in the game.
    *   **URI: `design://quiz_app_features`** - Provides access to the detailed feature specifications, API endpoints, and architecture documented in `quiz_app_design.md`.

### 7.4. Example Prompts for Amazon Q

*   "Using profile `phaser-gamedev` and considering the quiz mechanics in `quiz_app_design.md` (including answer zones and timer), generate a Phaser 3 `GameScene` method in `www/js/index.js` called `handlePlayerAnswer(answerZoneId)` that checks if the player is in the correct zone and updates the score."
*   "In profile `cordova-mobile`, how can I optimize the game's loading time when deployed as an Android app, given the assets in `www/assets/` and the need to initialize Socket.IO connections as per `quiz_app_design.md`?"
*   "Review the 'Art Style & Look and Feel' section of `AmazonQContext.md`. Suggest 3 chiptune background music tracks from a royalty-free library that would fit this style and the educational, adventurous theme."
*   "Using profile `project-management-mmo`, update the `README.md` to include a new section on 'AI Features', detailing the AI Quiz and AI Demon Chat based on `quiz_app_design.md`."
*   "With context hooks enabled to read `quiz_app_design.md`, analyze `api/index.js` for potential improvements to the `/api/ask-demon` endpoint regarding error handling and sat deduction logic."
*   "Using profile `phaser-gamedev` and referencing the multiplayer architecture in `quiz_app_design.md`, generate the client-side Socket.IO event handlers in `www/js/index.js` for `newPlayer`, `playerMoved`, `playerDisconnected`, and `currentPlayers`, including basic sprite creation/updates and ensuring they are added to the correct Phaser Group."

## 8. Future Feature Ideas (For Q to help brainstorm/implement)

*   Player inventory for special items (e.g., "Hint" for quizzes).
*   Unlockable map areas or NPC dialogues based on Sats or completed quizzes.
*   Multiplayer leaderboards for quiz scores (requires backend database for persistence).
*   More complex quiz types (e.g., image-based, fill-in-the-blank).
*   Customizable player avatar.
*   Persistent Sat balances linked to user accounts (requires backend database and authentication).

This document should be considered the primary source of truth for Amazon Q regarding the "Top-Down Bitcoin Quiz Game" project. It will be updated as the project evolves.