# Phaser 3 Cordova Starter Template

![screenshot](screenshot.png)

A starter template for building mobile games using Phaser 3 and Apache Cordova.

## Project Structure

A brief overview of the key directories:

*   `www/`: Contains the web assets (HTML, CSS, JavaScript) for your Phaser game. This is the directory served by Cordova.
*   `res/`: Contains platform-specific resources like icons and splash screens.
*   `hooks/`: Contains scripts that can be hooked into Cordova commands.
*   `config.xml`: The main configuration file for the Cordova application.

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

**Running the Development Server:**

To run the project in your browser with live-reloading enabled:

```bash
cordova run browser --live-reload
```

This command will start a local web server. Check the terminal output for the exact URL (often `http://localhost:3000` or similar, not necessarily port 8000). Open this URL in your browser to see the game.

**Building for Platforms:**

Refer to the official [Cordova documentation](https://cordova.apache.org/docs/en/latest/) for instructions on building your project for specific platforms like Android or iOS.
