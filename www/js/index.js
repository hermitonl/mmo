document.addEventListener('deviceready', function() {

    class GameScene extends Phaser.Scene {
        constructor() {
            super({ key: 'GameScene' });
            this.player = null;
            this.platforms = null;
            this.cursors = null;
        }

        preload() {
            // Load player image (using logo.png as placeholder)
            this.load.image('player', 'img/logo.png');
            // No specific platform image needed for now, using physics rectangles
        }

        create() {
            // --- Platforms ---
            this.platforms = this.physics.add.staticGroup();

            // Ground platform (wider)
            // Note: Using null texture, setSize defines the rectangle shape
            // Origin is 0.5, 0.5 by default for physics bodies
            this.platforms.create(400, 580, null).setSize(800, 40).refreshBody();

            // Answer platforms (adjust positions as needed)
            this.platforms.create(150, 400, null).setSize(100, 30).refreshBody();
            this.platforms.create(350, 400, null).setSize(100, 30).refreshBody();
            this.platforms.create(550, 400, null).setSize(100, 30).refreshBody();
            this.platforms.create(750, 400, null).setSize(100, 30).refreshBody();


            // --- Player ---
            this.player = this.physics.add.sprite(100, 450, 'player');

            // Player physics properties. Give the little guy a slight bounce.
            this.player.setBounce(0.2);
            this.player.setCollideWorldBounds(true); // Prevent falling off sides
            this.player.setGravityY(300); // Apply gravity

            // --- Collisions ---
            this.physics.add.collider(this.player, this.platforms);

            // --- Controls ---
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        update() {
            // --- Player Movement ---
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                // Optional: Add running animation here
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
                // Optional: Add running animation here
            } else {
                this.player.setVelocityX(0);
                // Optional: Add idle animation here
            }

            // Simple jump mechanic
            if (this.cursors.up.isDown && this.player.body.touching.down) {
                this.player.setVelocityY(-330);
            }
        }
    }

    // --- Game Configuration ---
    var config = {
        type: Phaser.WEBGL, // Use WebGL if available, fallback to Canvas
        width: 800,
        height: 600,       // Adjusted height
        parent: 'game',    // ID of the div to contain the game canvas
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }, // Global gravity (player has its own)
                debug: false       // Set to true for physics debugging visuals
            }
        },
        scale: {
            mode: Phaser.Scale.FIT, // Scale to fit the container
            autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas
        },
        scene: [GameScene] // Add the scene to the game
    };

    // --- Initialize Game ---
    var game = new Phaser.Game(config);

    // No need for manual resize listener from the old code, Phaser's scale manager handles it.

}, false);

// Fallback for running in browser without Cordova
if (!window.cordova) {
    // Manually trigger deviceready event for browser testing
    const event = new Event('deviceready');
    document.dispatchEvent(event);
}