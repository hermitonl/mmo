# Top-Down Bitcoin Quiz Game (Phaser 3 + Cordova)

![screenshot](screenshot.png)

A top-down Bitcoin quiz game built using Phaser 3 and Apache Cordova for the Amazon Q Developer Challenge. Learn about Bitcoin concepts and test your knowledge!

## Play Online

Play the latest version online: https://play.hermit.onl/ | [backup](https://phaser-beta.vercel.app/)

## Amazon Q Developer Challenge Context

This project aims to address multiple facets of the Amazon Q Developer Challenge:

*   **Prompt 1: Crushing the Command Line:** While not fully implemented in this initial version, the development workflow presents opportunities to leverage command-line automation. Future iterations could explore using tools like the Amazon Q Developer CLI to generate build scripts, automate repetitive Cordova commands (platform adding, building, running), analyze code for improvements, or even assist in generating documentation snippets. This project serves as a foundation for exploring how AI-powered CLI tools can streamline mobile game development.

*   **Prompt 2: That's Entertainment!:** This project directly tackles the "That's Entertainment!" prompt. It's designed as an educational game, blending the fun of top-down exploration and timed quizzes with the practical goal of learning about Bitcoin concepts. The interactive nature aims to make learning more engaging than traditional methods.

*   **Prompt 3: Exploring the Possibilities:** The game represents an exploration into creating interactive educational experiences on the Cordova platform. It combines established game mechanics (character movement, NPC interaction, timed challenges) with specific educational content delivery (lessons, quizzes). This fusion explores the potential of using game development frameworks like Phaser within a cross-platform mobile wrapper like Cordova for novel learning applications. Furthermore, the development process itself highlights how AI assistants like Amazon Q can accelerate the creation of such unique projects by helping with code generation, debugging, and exploring different implementation possibilities.

## Project Structure

A brief overview of the key directories:

*   `www/`: Contains the web assets (HTML, CSS, JavaScript) for your Phaser game. This is the directory served by Cordova.
*   `res/`: Contains platform-specific resources like icons and splash screens.
*   `hooks/`: Contains scripts that can be hooked into Cordova commands.
*   `config.xml`: The main configuration file for the Cordova application.

## Gameplay

*   **Movement:** Navigate the game world using the Arrow Keys.
*   **Interaction:** Approach NPCs (Non-Player Characters) and press the 'E' key when the interaction prompt appears.
*   **Knowledge NPCs:** These NPCs provide educational lessons about Bitcoin. Interacting with them displays the lesson content and awards you with Satoshis (Sats).
*   **Quiz NPCs:** These NPCs offer quizzes on specific Bitcoin topics. Interacting initially shows a prompt with the topic and the Sat cost to attempt the quiz. Press 'E' again to accept and start the quiz (Sats will be deducted).
*   **Quiz Mechanics:** During a quiz, a question and multiple-choice answers (A, B, C, D) are displayed. A timer starts counting down. Move your player character into the zone corresponding to the correct answer before the timer expires.
*   **Scoring:** Earn Sats for each correctly answered quiz question.

## Controls

*   **Arrow Keys:** Move Player
*   **E Key:** Interact with NPCs / Start Quiz

## Prerequisites

This project uses JavaScript (and HTML/CSS). You need to have [Node.js](https://nodejs.org/) installed, which includes `node` and `npm`.

## Setup and Installation

Follow these steps to set up the project:

1.  **Install Cordova CLI:**
    If you don't have Cordova installed globally, run:
    ```bash
    sudo npm install -g cordova
    ```
    *(You might need `sudo` depending on your system configuration)*

2.  **Install Project Dependencies (Phaser):**
    Navigate to the `www` directory and install Phaser:
    ```bash
    cd www
    npm install phaser
    cd ..
    ```
    > **Note:** Phaser is installed within the `www` directory because Cordova serves static files from here. Installing it in the project root would make it inaccessible to the game running in the Cordova WebView.

3.  **Add Cordova Platform:**
    Add the browser platform for testing in a desktop browser:
    ```bash
    cordova platform add browser
    ```
    *(You can add other platforms like `ios` or `android` later)*

4.  **Install Live-Reload Plugin (Optional but Recommended):**
    For a smoother development experience with automatic reloading on code changes:
    ```bash
    cordova plugin add cordova-plugin-browsersync
    ```

## Usage

**Running Locally (Cordova):**

This method is primarily for local development and testing, especially if you plan to test Cordova-specific features or build for native platforms later.

To run the project in your browser with live-reloading enabled:

```bash
cordova run browser --live-reload
```

This command will start a local web server. Check the terminal output for the exact URL (often `http://localhost:3000` or similar, not necessarily port 8000). Open this URL in your browser to see the game.

## Vercel Deployment

This project is configured for easy deployment to Vercel. The `vercel.json` file specifies the following:

*   **Build Configuration:** It uses the `@vercel/static` builder to serve the contents of the `www/` directory as static assets.
*   **Routing:** All incoming requests are rewritten to serve files from the `www/` directory, ensuring that the game's `index.html` and other assets are correctly accessed.

```json
{
  "version": 2,
  "builds": [
    {
      "src": "www/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/www/$1" }
  ]
}
```

**Building for Platforms:**

Refer to the official [Cordova documentation](https://cordova.apache.org/docs/en/latest/) for instructions on building your project for specific platforms like Android or iOS.
