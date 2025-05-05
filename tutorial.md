# Creating Mobile Games with Phaser 3 and Cordova

Photon Storm’s [Phaser](https://phaser.io/) is one of the most trusted frameworks for developing professional-quality 2D games in JavaScript. With Phaser, you can build performant games that run smoothly in all major browsers—across all major systems—while maintaining a single codebase. The latest installment, [Phaser 3](https://phaser.io/phaser3), has brought even more power and flexibility to the table.

But did you know the same code that runs in your browser can be wrapped into a “native” mobile app? By combining Phaser 3 with [Apache Cordova](https://cordova.apache.org/), you can produce games that not only run in the browser but can also be published to the App Store and Google Play Store.

In this tutorial, we’ll use Phaser to create a simple "game" within this existing Cordova project structure. While the result won’t be a fully playable game yet, it lays the foundation for future tutorials where we’ll develop complete, interactive games.

------

## Table of Contents

- [Pre-requisites (Things to Install)](#pre-requisites-things-to-install)
- [Project Setup](#project-setup)
- [Basic Game Code](#basic-game-code)
- [Adding Game Objects](#adding-game-objects)
- [Animating the Sprite](#animating-the-sprite)
- [Adding a Background](#adding-a-background)
- [Scaling the Game](#scaling-the-game)
- [Infinite Scrolling](#infinite-scrolling)
- [Building for iOS and Android](#building-for-ios-and-android)
- [Distributing the Game](#distributing-the-game)
- [Conclusion](#conclusion)

------

## Pre-requisites (Things to Install)

This tutorial uses JavaScript (and a bit of HTML). All you need to install is [Node.js](https://nodejs.org/), which provides the `node` and `npm` executables.

After installing Node.js, install the Cordova CLI globally:

```bash
npm install -g cordova
```

> **Note:** Depending on your system's configuration, you might need to run this command using `sudo` (for macOS/Linux) or as an Administrator (for Windows) if you encounter permission errors.

------

## Project Setup

This tutorial assumes you are working within the existing `phaser-3-cordova` project directory (`/Users/kafechew/dev/mmo`).

First, install Phaser inside the `www` directory, as Cordova serves web content from there:

```bash
# Make sure you run this command inside the 'www' directory
npm install phaser
```

> **Note:** We install Phaser in the `www` directory because Cordova serves static files from here, and we want Phaser to be accessible to the browser. If you install Phaser in the project root, it won’t be available in your game. The `www/package.json` file should already exist in this project.

Next, ensure the browser platform is added to your Cordova project (run from the project root):

```bash
cordova platform add browser
```

For a better development experience, let’s enable live-reloading so changes show up instantly (run from the project root):

```bash
cordova plugin add cordova-plugin-browsersync
```

Run the development server (from the project root):

```bash
cordova run browser --live-reload
```

Visit the URL provided in your terminal output (usually `http://localhost:8000`, but the port might vary) to see your game in action.

------

## Basic Game Code

First, ensure your `www/index.html` looks like this. The default Cordova starter code should already be removed.

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *; img-src 'self' data: content:;">
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
    <link rel="stylesheet" type="text/css" href="css/index.css">
    <title>Hello World</title>
</head>
<body>
    <div class="app">
        <h1>Apache Cordova</h1>
        <div id="deviceready" class="blink">
            <p class="event listening">Connecting to Device</p>
            <p class="event received">Device is Ready</p>
        </div>
        <!-- Phaser game canvas will be injected here if using 'parent' config -->
        <div id="game"></div>
    </div>
    <script src="cordova.js"></script>
    <!-- Make sure Phaser is included -->
    <script src="node_modules/phaser/dist/phaser.js"></script>
    <!-- Your game logic -->
    <script src="js/index.js"></script>
</body>
</html>
```

> **Tip:** The `Content-Security-Policy` meta tag is important for security in production apps, but can sometimes cause issues during development if you load external resources. For this tutorial, the default policy should be sufficient.

Now, in `www/js/index.js`, replace the default Cordova sample code with this code to initialize Phaser:

```javascript
// Wait for the device to be ready before initializing Phaser
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Phaser game configuration
    var config = {
        type: Phaser.AUTO, // Use Phaser.AUTO for broader compatibility (WebGL preferred, Canvas fallback)
        parent: 'game',    // ID of the DOM element to inject the canvas into
        width: 800,        // Default game width
        height: 600,       // Default game height
        scene: {
            preload: preload,
            create: create,
            update: update // Make sure to include update if you use it
        }
    };

    // Create a new Phaser game instance
    var game = new Phaser.Game(config);
}

// Preload assets (images, sounds, etc.)
function preload() {
    console.log("Preloading assets...");
    // Load assets here later
}

// Create game objects (sprites, text, etc.)
function create() {
    console.log("Creating game objects...");
    // Initialize game objects here later
    this.add.text(100, 100, 'Hello Phaser!', { fill: '#ffffff' }); // Example text
}

// Update game logic each frame (movement, collisions, etc.)
function update() {
    // Game loop logic goes here later
}

```

Run the live reload server again if it stopped:

```bash
cordova run browser --live-reload
```

Visit the local URL in your browser. You should see a black screen (the Phaser canvas) with the text "Hello Phaser!".

------

## Adding Game Objects

Let's replace the text with a sprite. This project includes a sample sprite sheet. We'll use `sheet.png` and its corresponding atlas data `sheet.json` located in the `www/img` directory.

Modify the `preload` and `create` functions in `www/js/index.js`:

```javascript
// Preload assets (images, sounds, etc.)
function preload() {
    console.log("Preloading assets...");
    // Load the sprite sheet atlas
    // The key 'sheet' will be used to reference images within the atlas
    // 'img/sheet.png' is the path to the image file
    // 'img/sheet.json' is the path to the atlas data file (describes frames)
    this.load.atlas('sheet', 'img/sheet.png', 'img/sheet.json');
}

// Create game objects (sprites, text, etc.)
function create() {
    console.log("Creating game objects...");
    // Add a sprite to the center of the default game area
    // 400, 300 are the x, y coordinates
    // 'sheet' is the key of the loaded texture atlas
    // 'logo.png' is the specific frame name within the atlas (from sheet.json)
    // Note: This project's sheet.json uses 'logo.png' as a frame name.
    // If using the Tappy Plane assets, you'd use frame names like 'planeBlue1.png'.
    this.add.sprite(400, 300, 'sheet', 'logo.png');
}

// Update game logic each frame (movement, collisions, etc.)
function update() {
    // No updates needed yet
}
```

Refresh your browser (or let live-reload do it). You should now see the Cordova logo sprite in the center of the game area.

------

## Animating the Sprite

Static images are fine, but animation brings games to life. If your sprite sheet contains multiple frames of an animation (like the Tappy Plane example mentioned in the original tutorial), you can create an animation.

Let's assume you've added the Tappy Plane assets (`sheet.png`, `sheet.json`) to `www/img` and they contain frames named `planeBlue1.png`, `planeBlue2.png`, `planeBlue3.png`.

Update your `preload` and `create` functions:

```javascript
// Preload assets (images, sounds, etc.)
function preload() {
    console.log("Preloading assets...");
    // Load the Tappy Plane sprite sheet atlas
    this.load.atlas('sheet', 'img/sheet.png', 'img/sheet.json');
}

// Create game objects (sprites, text, etc.)
function create() {
    console.log("Creating game objects...");

    // Define the animation using frames from the atlas
    this.anims.create({
        key: 'fly', // Name of the animation
        // Generate frame names dynamically: planeBlue1.png, planeBlue2.png, planeBlue3.png
        frames: this.anims.generateFrameNames('sheet', {
            prefix: 'planeBlue',
            start: 1,
            end: 3,
            zeroPad: 1, // Assuming names are planeBlue1, planeBlue2, etc. Adjust if needed.
            suffix: '.png'
        }),
        frameRate: 10, // Frames per second
        repeat: -1     // Loop indefinitely
    });

    // Add the plane sprite to the center
    const plane = this.add.sprite(400, 300, 'sheet', 'planeBlue1.png');

    // Play the 'fly' animation on the sprite
    plane.play('fly');
}

// Update game logic each frame (movement, collisions, etc.)
function update() {
    // No updates needed yet
}
```

This code:

1.  **Loads** the sprite sheet atlas (assuming it's the Tappy Plane one).
2.  **Creates an animation** named `'fly'`, using frames `planeBlue1.png` through `planeBlue3.png`.
3.  **Adds a sprite** using the first frame of the animation.
4.  **Plays the animation** on the sprite, making it appear as though the plane is flying.

> **Note:** If you are still using the default project assets, this animation code won't work as `sheet.json` doesn't contain `planeBlue*.png` frames. You would need to adapt the animation code to frames available in your specific sprite sheet or skip this step.

------

## Adding a Background

A background makes the scene more visually appealing.

1.  **Add a background image:** Place an image file (e.g., `background.png`) into your `www/img` directory. (Note: This project doesn't include one by default, you'll need to provide your own).
2.  **Load the image:** Update your `preload` function.
3.  **Add the image to the scene:** Update your `create` function.

```javascript
// Preload assets (images, sounds, etc.)
function preload() {
    console.log("Preloading assets...");
    // Load the sprite sheet atlas
    this.load.atlas('sheet', 'img/sheet.png', 'img/sheet.json');
    // Load the background image
    this.load.image('background', 'img/background.png'); // Make sure img/background.png exists
}

// Create game objects (sprites, text, etc.)
function create() {
    console.log("Creating game objects...");

    // Add the background image first, so it's behind other objects
    // 400, 300 are coordinates for the center of the image relative to the game size (800x600)
    this.add.image(400, 300, 'background');

    // --- Animation code (if using Tappy Plane assets) ---
    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNames('sheet', { prefix: 'planeBlue', start: 1, end: 3, zeroPad: 1, suffix: '.png' }),
        frameRate: 10,
        repeat: -1
    });
    const plane = this.add.sprite(400, 300, 'sheet', 'planeBlue1.png');
    plane.play('fly');
    // --- End Animation code ---

    // If NOT using animation, add the static sprite instead:
    // this.add.sprite(400, 300, 'sheet', 'logo.png');
}

// Update game logic each frame (movement, collisions, etc.)
function update() {
    // No updates needed yet
}
```

Now your game should have a background image behind the sprite.

------

## Scaling the Game

Mobile devices come in many shapes and sizes. Phaser's Scale Manager helps your game adapt. Let's configure it to fit the screen while maintaining the aspect ratio.

Update the `config` object in `www/js/index.js`:

```javascript
// Wait for the device to be ready before initializing Phaser
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Phaser game configuration
    var config = {
        type: Phaser.AUTO,
        parent: 'game',
        // Add the Scale Manager configuration
        scale: {
            mode: Phaser.Scale.FIT, // Fit the game within the available space, maintaining aspect ratio
            autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game canvas horizontally and vertically
            width: 800,  // The base width of your game design
            height: 600, // The base height of your game design
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    // Create a new Phaser game instance
    var game = new Phaser.Game(config);
}

// ... (preload, create, update functions remain the same) ...
```

This configuration ensures your 800x600 game area scales nicely to fill different device screens.

------

## Infinite Scrolling

To create an illusion of movement, like in a side-scrolling game, we can use a `TileSprite` for the background and move its texture position in the `update` loop.

1.  **Modify `create`** to use `add.tileSprite` instead of `add.image`.
2.  **Add logic to `update`** to change the `tilePositionX`.

```javascript
// Declare background variable outside functions to access it in create and update
let background;

// Preload assets (images, sounds, etc.)
function preload() {
    console.log("Preloading assets...");
    this.load.atlas('sheet', 'img/sheet.png', 'img/sheet.json');
    this.load.image('background', 'img/background.png'); // Ensure background image is loaded
}

// Create game objects (sprites, text, etc.)
function create() {
    console.log("Creating game objects...");

    // Create a TileSprite for the background
    // Takes x, y, width, height, texture key
    // Width and height should match your game dimensions for full coverage
    background = this.add.tileSprite(400, 300, 800, 600, 'background');

    // --- Animation code (if using Tappy Plane assets) ---
    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNames('sheet', { prefix: 'planeBlue', start: 1, end: 3, zeroPad: 1, suffix: '.png' }),
        frameRate: 10,
        repeat: -1
    });
    const plane = this.add.sprite(400, 300, 'sheet', 'planeBlue1.png');
    plane.play('fly');
    // --- End Animation code ---

    // If NOT using animation, add the static sprite instead:
    // this.add.sprite(400, 300, 'sheet', 'logo.png');
}

// Update game logic each frame (movement, collisions, etc.)
function update() {
    // Scroll the background texture horizontally
    // Increase the value for faster scrolling
    if (background) {
        background.tilePositionX += 1; // Adjust speed as needed
    }
}
```

Now, the background texture will continuously scroll to the left, giving the impression that the plane (or other game objects) are moving forward.

------

## Building for iOS and Android

Once you're happy with your game in the browser, it's time to build for mobile!

Ensure you have the necessary SDKs installed:
*   **iOS:** Xcode and Command Line Tools (on macOS)
*   **Android:** Android Studio and Android SDK

Add the desired platforms to your project (run from the project root):

```bash
cordova platform add ios
cordova platform add android
```

Then, build your app for each platform (run from the project root):

```bash
cordova build ios
cordova build android
```

The compiled application packages will be located in the `platforms/ios` and `platforms/android` directories. You can open these platform-specific projects in Xcode or Android Studio to run on simulators/emulators or physical devices.

------

## Distributing the Game

To publish your game:

-   **iOS:** Open the project in `platforms/ios/` using Xcode. Follow Apple's procedures to configure signing, archive the build, and upload it to App Store Connect for distribution on the App Store.
-   **Android:** Open the project in `platforms/android/` using Android Studio. Follow Google's procedures to generate a signed APK or App Bundle and upload it to the Google Play Console for distribution on the Google Play Store.

Refer to the official Cordova documentation and the respective platform guidelines for detailed steps on signing, testing, and submitting your app.

------

## Conclusion

In this tutorial, you learned how to:

-   Set up Phaser 3 within an existing Cordova project structure.
-   Load and display sprites using a texture atlas.
-   Create basic sprite animations.
-   Add background images and create an infinite scrolling effect using TileSprites.
-   Configure the Phaser Scale Manager for different device sizes.
-   Build your Cordova project for iOS and Android platforms.

This forms the foundation for building more complex mobile games. Stay tuned for future tutorials where we might explore touch controls, physics, sound integration, and more advanced game mechanics!