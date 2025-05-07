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
*   **Basic Multiplayer:** See other players move in real-time using Socket.IO.
*   **Educational Focus:** Designed to make learning complex Bitcoin topics fun and accessible for everyone.

## Multiplayer with Socket.IO

Bitcoin Quest now features basic real-time multiplayer functionality, allowing players to see each other move within the game world. This is achieved using Socket.IO.

*   **Backend:** An Express server (`api/index.js`) handles Socket.IO connections, manages player states (positions), and broadcasts updates.
*   **Frontend:** The Phaser client (`www/js/index.js`) connects to the Socket.IO server, sends local player movement, and receives updates about other players to render them on screen.
*   **Synchronization:** Player positions are synchronized across all connected clients. When a player moves, their new coordinates are sent to the server, which then broadcasts this information to all other clients.
*   **Event Handling:** Key Socket.IO events handled include:
    *   `connect`: A new user connects.
    *   `currentPlayers`: Server sends the list of already connected players to the new user.
    *   `newPlayer`: Server informs existing clients about a new player joining.
    *   `playerMoved`: Server broadcasts a player's updated position.
    *   `playerDisconnected`: Server informs clients when a player leaves.

## Gameplay Deep Dive

*   **Movement:**
    *   **Desktop:** Navigate the vibrant game world using the **Arrow Keys**.
    *   **Mobile/Touch Devices:** Use the **on-screen D-pad** (directional buttons) located at the bottom-left of the screen.
*   **Interaction:**
    *   **Desktop:** Approach Non-Player Characters (NPCs) and press the **'E' key** when the interaction prompt appears.
    *   **Mobile/Touch Devices:** Approach NPCs and tap the **on-screen interact button** (target icon) located at the bottom-right of the screen.
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
2.  **Install Project Dependencies:**
    *   **Backend & Core Dependencies (Express, Socket.IO, etc.):**
        Run this in the project root directory:
        ```bash
        npm install
        ```
    *   **Frontend (Phaser - if managing separately, though often included via CDN or as part of the main `npm install` if `package.json` in `www/` is not used):**
        The current project includes Phaser via a CDN in `www/index.html`, so a separate `npm install phaser` in the `www` directory might not be strictly necessary if you are not bundling it. If you were to bundle Phaser, you would typically install it as a project dependency in the root `package.json`.

    **Troubleshooting `npm install` Permissions (EACCES Error):**
    If you encounter an `EACCES: permission denied` error during `npm install`, it's likely due to incorrect ownership of the `node_modules` directory. To fix this:
    ```bash
    sudo rm -rf node_modules
    npm install
    ```
    The first command removes the problematic `node_modules` directory (you'll be prompted for your password). The second command reinstalls dependencies with correct user permissions.

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

## Running the Game Locally (Desktop & Mobile)

This setup allows you to run the game with multiplayer functionality on your local machine and access it from desktop or mobile browsers on the same network.

1.  **Start the Backend Socket.IO Server:**
    Open a terminal in the project root directory and run:
    ```bash
    node api/index.js
    ```
    This will start the backend server, typically on port 3001. You should see a message like `Server listening on port 3001`.

2.  **Start the Frontend Development Server (with Proxy):**
    Open another terminal in the project root directory and run:
    ```bash
    npx http-server www -p 8080 -c-1 --cors --proxy http://localhost:3001
    ```
    *   This serves the `www` directory (your Phaser game) on port `8080`.
    *   `--cors` enables Cross-Origin Resource Sharing.
    *   `-c-1` disables caching, which is useful for development.
    *   `--proxy http://localhost:3001` is crucial. It tells `http-server` that any requests it can't find locally (like `/socket.io/...`) should be forwarded to your backend server running on port 3001. This makes the client-side code (which requests `/socket.io/socket.io.js` and connects to `io()`) work seamlessly.

3.  **Accessing the Game:**
    *   **On your Desktop:** Open a web browser and go to `http://localhost:8080`.
    *   **On your Mobile Device (or other devices on the same network):**
        1.  Find your computer's local IP address.
            *   **macOS:** Open Terminal and run `ipconfig getifaddr en0` (or `en1` if `en0` is not your Wi-Fi).
            *   **Windows:** Open Command Prompt and run `ipconfig`, then look for the "IPv4 Address" under your active network adapter.
            *   **Linux:** Open a terminal and run `hostname -I` or `ip addr show`.
        2.  Ensure your mobile device is connected to the same Wi-Fi network as your computer.
        3.  Open a web browser on your mobile device and navigate to `http://YOUR_COMPUTER_IP_ADDRESS:8080` (e.g., `http://192.168.0.192:8080`).

    You should see the game load, and players connecting from different browsers/devices should appear and move in real-time. Check the terminal running `node api/index.js` for connection logs.

**Note on Cordova:** The instructions above are for web-based local development. If you are using Cordova to build and run on specific platforms (like Android or iOS emulators/devices), the Cordova build process and webviews might handle local connections differently. The `cordova run browser --live-reload` command, for instance, sets up its own server and might not require the `http-server` proxy setup if the backend is accessible. However, for pure web testing with `http-server` and mobile browser access, the proxy method is effective.

## Vercel Deployment

This project is configured for deployment to Vercel. The `vercel.json` file handles the necessary build steps and routing:

*   **Static Frontend:** Files in the `www/` directory are served as static assets.
*   **Node.js Backend:** The `api/index.js` file is deployed as a Vercel serverless function.
*   **Socket.IO Routing:** The crucial route `{ "src": "/socket.io/(.*)", "dest": "/api/index.js" }` in `vercel.json` ensures that Socket.IO requests from the client are correctly routed to the backend serverless function, enabling real-time communication.

**Client-Side Configuration for Vercel:**
The client-side code in `www/index.html` and `www/js/index.js` is set up to work with Vercel's environment:
*   `www/index.html` loads the Socket.IO client library via `<script src="/socket.io/socket.io.js"></script>`.
*   `www/js/index.js` initializes the connection via `this.socket = io();` (no explicit URL).

Vercel's environment and routing handle the rest, so no IP addresses or specific ports need to be hardcoded in the client for deployment.

**Backend Configuration for Vercel:**
The `api/index.js` file exports the Express app (`module.exports = app;`). Vercel uses this to run the serverless function. The `server.listen(...)` call in `api/index.js` is primarily for local development; Vercel manages the listening process in its environment.

## Future Enhancements

*   Expanded Bitcoin curriculum with more advanced topics.
*   Player inventory and special items (e.g., quiz hints).
*   Unlockable map areas or NPC dialogues.
*   More diverse quiz types (e.g., image-based questions).
*   Customizable player avatars.
*   Leaderboards for quiz scores.

## Contributing

Contributions, feedback, and suggestions are welcome! Please feel free to open an issue or submit a pull request.
