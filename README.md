# Bitcoin Quest: A Top-Down Quiz Adventure! (Phaser 3 + Cordova)

![screenshot](screenshot.png)

Embark on **Bitcoin Quest**, a retro-inspired, top-down educational game where learning about Bitcoin is an exciting adventure! Built with Phaser 3 and Apache Cordova, this game challenges your knowledge of Bitcoin concepts through interactive gameplay, engaging NPC interactions, and timed quizzes. Dive into a pixel-art world and earn Satoshis as you master the fundamentals of Bitcoin.

This project was developed for the **Amazon Q Developer "Quack The Code" Challenge**, aiming to showcase innovation in entertainment, explore new development possibilities, and leverage AI for a smarter workflow.

## Play Online Now!

Ready to test your Bitcoin knowledge? Play the latest version here:
*   **Main Link:** [https://play.hermit.onl/](https://play.hermit.onl/)
*   Backup Link: [https://phaser-beta.vercel.app/](https://phaser-beta.vercel.app/)

## Key Features

*   **Engaging Gameplay:** Explore a 2D world, interact with unique characters, and undertake quiz challenges.
*   **Learn & Earn:** Gain knowledge about Bitcoin concepts from "Knowledge NPCs" and earn in-game Satoshis.
*   **Interactive Quizzes:** Test your understanding with timed, multiple-choice quizzes where you move your player to the correct answer zone.
*   **Retro Pixel Art Style:** Enjoy a visually appealing game reminiscent of 16-bit classics.
*   **Cross-Platform Potential:** Built with Cordova for web deployment and future mobile possibilities.
*   **Educational Focus:** Designed to make learning complex Bitcoin topics fun and accessible for everyone.

## Gameplay Deep Dive

*   **Movement:** Navigate the vibrant game world using the **Arrow Keys**.
*   **Interaction:** Approach Non-Player Characters (NPCs) and press the **'E' key** when the interaction prompt appears.
*   **Knowledge NPCs:** These friendly characters provide bite-sized, easy-to-understand lessons about various Bitcoin topics. Completing a lesson rewards you with Satoshis (Sats).
*   **Quiz NPCs:** Feeling confident? These NPCs offer quizzes on specific Bitcoin subjects. Interacting will show the topic and the Sat cost to attempt the quiz. Press 'E' again to accept the challenge (Sats will be deducted).
*   **Dynamic Quiz Mechanics:** Once a quiz starts, a question with multiple-choice answers (A, B, C, D) is displayed alongside a countdown timer. Your mission? Move your player character into the physical zone on the map corresponding to the correct answer before time runs out!
*   **Scoring & Progression:** Earn more Sats for each correctly answered quiz question. Accumulate Sats to (in future versions) unlock new areas, items, or more advanced learning modules.

## Amazon Q Developer Challenge Context

This project proudly addresses multiple prompts of the Amazon Q Developer Challenge:

*   **Prompt 2: That's Entertainment!:** At its heart, Bitcoin Quest is an educational game designed to entertain and delight users while they learn.
*   **Prompt 3: Exploring the Possibilities:** The game represents a significant technical exploration, having been migrated and re-imagined from an earlier 3D Hytopia SDK prototype to a 2D Phaser/Cordova architecture. This transformation heavily relied on the potential of AI-assisted development with Amazon Q.
*   **Prompt 1: Crushing the Command Line:** While the current version focuses on the game, the development process and the creation of `AmazonQContext.md` (see below) lay a strong foundation for leveraging the Amazon Q Developer CLI for advanced automation in future iterations.

A key aspect of this project's approach to the challenge is the strategic use of Amazon Q Developer, guided by a detailed context file. See the **"Leveraging Amazon Q Developer"** section and the `AmazonQContext.md` file in this repository for more details.

## Technical Stack

*   **Game Engine:** Phaser 3 (latest stable version)
*   **Core Language:** JavaScript (ES6+)
*   **Mobile Wrapper:** Apache Cordova
*   **Deployment (Web):** Vercel
*   **Key Phaser Modules:** Scenes, Sprites, Tilemaps, Arcade Physics, Input Handling, Tweens, Text Objects, Groups.

## Leveraging Amazon Q Developer

Amazon Q Developer was (and is envisioned to be) a crucial partner in this project's lifecycle. To maximize its effectiveness, a dedicated context file, `AmazonQContext.md`, was created. This file provides Amazon Q with a deep understanding of the project's goals, technical stack, gameplay mechanics, art style, and even desired AI interaction patterns (like custom profiles and hypothetical MCP configurations).

**How Amazon Q was/can be utilized:**

1.  **Accelerated Migration & Development:**
    *   Assisted in translating concepts and code from the previous 3D Hytopia SDK version to Phaser 3.
    *   Helped generate boilerplate code for Phaser scenes, game objects, and UI elements, adhering to the project's specific style and architecture defined in `AmazonQContext.md`.
2.  **Enhanced Problem Solving with Contextual Understanding:**
    *   By defining **profiles** (e.g., `phaser-gamedev`, `cordova-mobile`, `bitcoin-education` as outlined in `AmazonQContext.md`), Q's responses to queries become highly targeted. For example, asking for "performant collision detection in Phaser for mobile" within the correct profile yields much more relevant advice.
3.  **Strategic Use of Agentic Commands (Conceptualized):**
    *   `/transform`: For converting specific Hytopia code patterns to Phaser.
    *   `/dev`: For planning and scaffolding new features (like a "Satoshi Shop") or refactoring existing game logic.
    *   `/review`: For auditing code quality, checking for Phaser anti-patterns, or reviewing educational content for accuracy.
    *   `/test`: For generating unit tests for core game logic (like quiz scoring).
4.  **Intelligent CLI Automation (Future Vision):**
    *   The `AmazonQContext.md` file lays the groundwork for using the Amazon Q Developer CLI with context hooks to automate complex build, test, and deployment workflows for Cordova, making them more intelligent and project-aware.

For a comprehensive understanding of the AI collaboration strategy, please refer to the **[`AmazonQContext.md`](AmazonQContext.md)** file in this repository.

## Project Structure Overview

*   `www/`: Contains all the web assets (HTML, CSS, JavaScript, images, audio) for the Phaser game. This is the core directory served by Cordova.
    *   `www/js/`: Main Phaser game logic.
    *   `www/assets/`: Game images, tilemaps, audio files, etc.
*   `config.xml`: The main configuration file for the Apache Cordova application (defines app ID, permissions, plugins, etc.).
*   `res/`: Platform-specific resources like icons and splash screens for mobile builds.
*   `hooks/`: Scripts that can be hooked into Cordova's build commands.
*   `AmazonQContext.md`: Detailed context file for guiding Amazon Q Developer.
*   `vercel.json`: Configuration for Vercel deployment.

## Prerequisites

*   [Node.js](https://nodejs.org/) (which includes `npm`)
*   Apache Cordova CLI: If not installed, run `sudo npm install -g cordova`

## Setup and Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/hermitonl/mmo.git
    cd mmo
    ```
2.  **Install Project Dependencies (Phaser):**
    Phaser is installed within the `www` directory as it's part of the static assets served by Cordova.
    ```bash
    cd www
    npm install phaser
    cd ..
    ```
3.  **Add Cordova Platform(s):**
    For browser testing:
    ```bash
    cordova platform add browser
    ```
    For mobile, you can add `android` or `ios` (requires respective SDKs to be configured):
    ```bash
    cordova platform add android
    # cordova platform add ios
    ```
4.  **Install Live-Reload Plugin (Recommended for Development):**
    ```bash
    cordova plugin add cordova-plugin-browsersync
    ```

## Running the Game

**1. Locally with Cordova (for browser or device testing):**

This method allows you to test Cordova features and prepare for native builds.

*   **With Live Reload (Recommended for Web/Browser Development):**
    ```bash
    cordova run browser --live-reload
    ```
    This starts a local server. Check your terminal for the URL (often `http://localhost:3000` or similar).

*   **Run on a Connected Device or Emulator (e.g., Android):**
    ```bash
    cordova run android
    ```

**2. Directly Opening `www/index.html` (Quick Web Preview):**

For a very quick preview of the Phaser game logic without Cordova wrappers, you can often open the `www/index.html` file directly in a modern web browser. However, some browser security features (like CORS for local file access) might affect asset loading. Running through a local server (even a simple one like `python -m http.server` from the `www` directory) or using Cordova's serve/run commands is generally more reliable.

## Vercel Deployment

This project is pre-configured for easy deployment to Vercel via the `vercel.json` file. It serves the `www/` directory as static content.

## Future Enhancements

*   Expanded Bitcoin curriculum with more advanced topics.
*   Player inventory and special items (e.g., quiz hints).
*   Unlockable map areas or NPC dialogues.
*   More diverse quiz types (e.g., image-based questions).
*   Customizable player avatars.
*   Leaderboards for quiz scores.

## Contributing

Contributions, feedback, and suggestions are welcome! Please feel free to open an issue or submit a pull request.
