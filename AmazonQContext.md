# Amazon Q Developer Context File for "Bitcoin Quiz Game"

This document provides detailed context for Amazon Q Developer to assist in the development, maintenance, and enhancement of the "Top-Down Bitcoin Quiz Game." Its purpose is to enable Amazon Q to provide highly relevant, accurate, and efficient support by understanding the project's nuances.

## 1. Project Overview

*   **Project Name:** Top-Down Bitcoin Quiz Game
*   **Elevator Pitch:** An engaging 2D top-down educational game built with Phaser 3 and Cordova, where players learn about Bitcoin concepts by exploring, interacting with NPCs, and completing timed quizzes.
*   **Primary Goal:** To make learning about Bitcoin fun, accessible, and interactive.
*   **Secondary Goals:**
    *   Showcase innovative use of game mechanics for education.
    *   Explore cross-platform deployment using Cordova.
    *   Demonstrate effective integration of Amazon Q Developer in the development lifecycle.
*   **Current Status:** Playable version deployed, migrated from an earlier Hytopia SDK 3D prototype.
*   **Target Platforms:** Web (primary via Vercel), potentially Android/iOS via Cordova builds.

## 2. Core Gameplay Loop

1.  **Explore:** Player navigates a 2D tile-based map using arrow keys.
2.  **Learn:** Player interacts (presses 'E') with "Knowledge NPCs" who deliver short lessons on Bitcoin topics. Player earns a small amount of "Sats" (in-game currency) for completing a lesson.
3.  **Quiz:** Player interacts (presses 'E') with "Quiz NPCs."
    *   NPC presents a quiz topic and a Sat cost to attempt.
    *   Player accepts (presses 'E' again), Sats are deducted.
    *   A timed multiple-choice question (A, B, C, D) appears.
    *   Player moves their character avatar into the physical zone on the map corresponding to their chosen answer before the timer runs out.
4.  **Reward:** Correct answers award more Sats. Incorrect answers or running out of time result in no reward for that question.
5.  **Progression:** Player accumulates Sats. (Future: Unlock new areas, cosmetic items, or more advanced topics).

## 3. Target Audience & Educational Goals

*   **Target Audience:** Individuals new to Bitcoin and cryptocurrencies, students, gamers interested in educational content. Age range: 13+.
*   **Educational Philosophy:** Learn-by-doing, gamified learning, bite-sized information.
*   **Key Bitcoin Concepts to Cover (Examples):**
    *   What is Bitcoin? Blockchain basics.
    *   Mining, Proof-of-Work.
    *   Wallets, Private/Public Keys.
    *   Transactions, Confirmations.
    *   Scarcity, Halving.
    *   Common terms (HODL, Satoshi, FUD).
    *   Security best practices.
    *   (Expandable list)

## 4. Art Style & Look and Feel

*   **Visual Style:** Retro-inspired 2D pixel art, reminiscent of 16-bit era RPGs or adventure games (e.g., classic Zelda, Pokémon). Clean, vibrant, and inviting.
*   **Character Design:** Simple, recognizable player avatar. NPCs should be visually distinct based on their role (Knowledge vs. Quiz).
*   **Environment Design:** Tile-based maps with clear pathways and distinct zones for answers. Visual cues for interactable objects.
*   **UI/UX:**
    *   Minimalist on-screen UI during exploration.
    *   Clear, legible text for lessons and quiz questions.
    *   Intuitive interaction prompts (e.g., "Press E to talk").
    *   Visual feedback for correct/incorrect answers and timer.
*   **Audio:**
    *   Upbeat, retro-style background music (chiptune).
    *   Simple sound effects for movement, interaction, correct/incorrect answers, earning Sats.

## 5. Key Game Mechanics (Detailed)

*   **Player Movement:** 4-directional (or 8-directional) tile-based movement. Collision with map boundaries and non-traversable tiles.
*   **NPC Interaction:** Proximity-based. An interaction prompt appears when the player is close enough to an NPC.
*   **Lesson Delivery:** Modal dialog box or dedicated UI panel displaying text-based lessons. Option to paginate longer lessons.
*   **Quiz System:**
    *   **Question Structure:** Question text, 4 answer options (A, B, C, D). One correct answer.
    *   **Answer Zones:** Clearly marked rectangular areas on the map, each corresponding to an answer choice.
    *   **Timer:** Visual countdown timer. Duration adjustable per question difficulty.
    *   **Scoring:** Fixed Sat reward per correct answer.
*   **Currency System (Sats):** Tracked globally for the player. Used to pay for quiz attempts.
*   **Game State Management:** Current player position, Sats balance, completed lessons/quizzes. (Consider using Phaser's DataManager or a simple global state object).

## 6. Technical Stack & Architecture

*   **Game Engine:** Phaser 3 (latest stable version).
*   **Language:** JavaScript (ES6+).
*   **Mobile Wrapper:** Apache Cordova.
*   **Key Phaser Modules Used:** Scenes, Sprites, Tilemaps, Arcade Physics (for collision and movement into answer zones), Input (Keyboard), Tweens (for simple animations), Text objects, Groups.
*   **Project Structure:**
    *   `www/`: Contains all game assets (HTML, CSS, JS, images, audio).
        *   `www/index.html`: Main entry point.
        *   `www/js/`: Phaser game code.
            *   `main.js` or `game.js`: Phaser game configuration and scene initialization.
            *   `scenes/`: Directory for different game scenes (e.g., Preloader, MainMenu, GameScene, UIScene).
        *   `www/assets/`: Images, audio, tilemaps, sprite sheets.
    *   `config.xml`: Cordova configuration.
    *   `hooks/`: Cordova hooks.
    *   `res/`: Platform-specific resources.
*   **Deployment:**
    *   Web: Vercel (configured via `vercel.json`).
    *   Mobile: Cordova CLI builds.

## 7. Amazon Q Developer Integration Strategy

This section outlines how Amazon Q Developer should be leveraged, including desired configurations for context profiles and potential MCP setups.

### 7.1. Context Profiles for Amazon Q CLI / IDE

Define distinct profiles to help Q provide specialized assistance:

*   **Profile: `phaser-gamedev`**
    *   **Focus:** Core Phaser 3 game logic, scene management, sprite manipulation, physics, input handling, asset loading.
    *   **Preferred Language/Syntax:** JavaScript ES6+, Phaser 3 API conventions.
    *   **Key Knowledge Areas:** Phaser 3 documentation, common Phaser patterns (state machines, event emitters), 2D game development principles.
    *   **Example Use Case:** "In profile `phaser-gamedev`, how do I create a reusable NPC class with an interaction method?"

*   **Profile: `cordova-mobile`**
    *   **Focus:** Cordova setup, plugin integration (e.g., `cordova-plugin-browsersync`, status bar, splash screen), build processes for Android/iOS, platform-specific considerations.
    *   **Key Knowledge Areas:** Cordova CLI commands, `config.xml` structure, lifecycle events, common mobile development challenges (performance, screen sizes).
    *   **Example Use Case:** "Using profile `cordova-mobile`, what's the best way to handle safe areas for UI elements on notched iPhone devices?"

*   **Profile: `bitcoin-education`**
    *   **Focus:** Accuracy of Bitcoin concepts, clarity of educational content, quiz question formulation, lesson structuring.
    *   **Key Knowledge Areas:** Reputable Bitcoin educational resources, common misconceptions about Bitcoin, age-appropriate language.
    *   **Example Use Case:** "In profile `bitcoin-education`, review this lesson on Bitcoin mining for clarity and accuracy for a beginner audience."

*   **Profile: `project-management-mmo`** (MMO refers to the project [codename/repo name](https://github.com/hermitonl/mmo))
    *   **Focus:** Overall project structure, task breakdown, documentation (like this file), version control (Git), issue tracking.
    *   **Key Knowledge Areas:** This `AmazonQContext.md` file, `README.md`, `vercel.json`, `package.json`.
    *   **Example Use Case:** "Using profile `project-management-mmo`, what are the next steps for implementing the Sats currency display in the UI, based on `AmazonQContext.md`?"

### 7.2. Context Hooks (Conceptual for CLI/IDE)

How context hooks could ideally enhance Q's assistance:

*   **File System Awareness:** When asking Q to generate code or scripts, hooks could allow Q to:
    *   Read `package.json` to understand existing scripts and dependencies.
    *   Scan `www/js/scenes/` to know which scenes already exist.
    *   Check `config.xml` for installed Cordova plugins.
*   **Git Integration:** Hooks could enable Q to:
    *   Be aware of the current branch.
    *   Suggest commit messages based on changes.
    *   Reference recent changes when debugging.
*   **Live Game State (Advanced/Hypothetical):** For debugging, hooks could (in an ideal future) allow Q to query certain aspects of the live running game (e.g., current scene, player coordinates) if a debug bridge was established.

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
        *   **Underlying Logic:** Could use a template engine combined with concept data, or even a fine-tuned LLM for question generation.
    *   **Tool: `validate_phaser_code_snippet`**
        *   **Description:** Performs a basic linting and Phaser 3 best-practice check on a JavaScript code snippet.
        *   **Input Schema:** `{ "code": "string" }`
        *   **Output:** `{ "isValid": "boolean", "suggestions": ["string"] }`
*   **Provided Resources:**
    *   **URI: `game://assets/tilemap/main.json`** - Provides the current main tilemap data.
    *   **URI: `game://state/player`** - Provides current player Sats, completed quizzes (hypothetical live data).
    *   **URI: `docs://bitcoin/all_concepts`** - List of all Bitcoin concepts covered in the game.

### 7.4. Example Prompts for Amazon Q

*   "Using profile `phaser-gamedev` and considering the mechanics in `AmazonQContext.md`, generate a Phaser 3 scene template for a 'QuizNPCInteraction' that handles deducting Sats and displaying a question from a predefined list."
*   "In profile `cordova-mobile`, how can I optimize the game's loading time when deployed as an Android app, given the assets in `www/assets/`?"
*   "Review the 'Art Style & Look and Feel' section of `AmazonQContext.md`. Suggest 3 chiptune background music tracks from a royalty-free library that would fit this style."
*   "Using profile `project-management-mmo`, update the `README.md` to include a new section on 'Future Features' based on the 'Progression' ideas in `AmazonQContext.md`."
*   "With context hooks enabled, analyze `www/js/scenes/GameScene.js` for potential performance improvements when handling multiple NPC interactions."

## 8. Future Feature Ideas (For Q to help brainstorm/implement)

*   Player inventory for special items (e.g., "Hint" for quizzes).
*   Unlockable map areas or NPC dialogues based on Sats or completed quizzes.
*   Leaderboard (if deployed with a backend).
*   More complex quiz types (e.g., image-based, fill-in-the-blank).
*   Customizable player avatar.

This document should be considered the primary source of truth for Amazon Q regarding the "Top-Down Bitcoin Quiz Game" project. It will be updated as the project evolves.