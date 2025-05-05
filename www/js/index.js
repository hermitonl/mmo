document.addEventListener('deviceready', function() {

    class GameScene extends Phaser.Scene {
        constructor() {
            super({ key: 'GameScene' });
            this.player = null;
            // Removed platforms as it's not used in top-down
            this.cursors = null;

            // --- Quiz State Variables ---
            this.quizIsActive = false;
            this.currentQuestionData = null; // Will hold { q: '...', a: [...], correct: '...' }
            this.currentCorrectAnswerIndex = -1; // Index (0-3) of the correct answer
            this.timerEvent = null; // To hold the Phaser TimerEvent
            this.remainingTime = 0;
            this.answerZones = []; // To hold Phaser.Geom.Rectangle objects
            this.answerTexts = []; // To hold answer text objects
            this.questionText = null; // To hold question text object
            this.timerText = null; // To hold timer text object
        }

        preload() {
            // Load player image (using logo.png as placeholder)
            this.load.image('player', 'img/logo.png');
            // No specific platform image needed for now
        }

        create() {
            // --- Player (Top-down view) ---
            this.player = this.physics.add.sprite(400, 300, 'player');
            this.player.setCollideWorldBounds(true);
            this.player.body.setSize(28, 32); // Adjust as needed

            // --- UI Text Elements ---
            this.questionText = this.add.text(400, 50, 'Question text will appear here', {
                fontSize: '24px',
                fill: '#fff',
                align: 'center',
                wordWrap: { width: 750 }
            }).setOrigin(0.5);

            const answerStyle = { fontSize: '18px', fill: '#fff' };
            const answerY = 500; // Lowered Y position for zones below
            const answerZoneWidth = 100;
            const answerZoneHeight = 100;
            const answerZoneY = 450; // Y position for the top of the zones

            // Define Answer Zones (Rectangles) and Text
            const zonePositions = [
                { x: 100, textX: 150 }, // Zone A
                { x: 300, textX: 350 }, // Zone B
                { x: 500, textX: 550 }, // Zone C
                { x: 700, textX: 750 }  // Zone D
            ];

            // Optional: Graphics for visualizing zones
            const graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0x00ff00, alpha: 0.1 } });

            zonePositions.forEach((pos, index) => {
                const zone = new Phaser.Geom.Rectangle(
                    pos.x,
                    answerZoneY,
                    answerZoneWidth,
                    answerZoneHeight
                );
                this.answerZones.push(zone);

                // Draw zone for debugging
                graphics.strokeRectShape(zone);
                graphics.fillRectShape(zone);


                const answerText = this.add.text(pos.textX, answerY, String.fromCharCode(65 + index), answerStyle).setOrigin(0.5);
                this.answerTexts.push(answerText);
                // Explicitly disable physics for text if needed (usually not necessary unless added to physics group)
                // if (answerText.body) { answerText.body.setEnable(false); }
            });


            this.timerText = this.add.text(750, 20, 'Time: 0', {
                fontSize: '20px',
                fill: '#fff'
            }).setOrigin(1, 0); // Origin top-right

            // --- Controls ---
            this.cursors = this.input.keyboard.createCursorKeys();

            // --- Placeholder Quiz Start ---
            this.currentQuestionData = { q: 'What is the capital of France?', a: ['London', 'Paris', 'Berlin', 'Madrid'], correct: 'Paris' };
            this.currentCorrectAnswerIndex = this.currentQuestionData.a.indexOf(this.currentQuestionData.correct); // Should be 1

            // Update UI with placeholder data
            this.questionText.setText(this.currentQuestionData.q);
            this.answerTexts.forEach((text, index) => {
                text.setText(`${String.fromCharCode(65 + index)}: ${this.currentQuestionData.a[index]}`);
            });

            this.startQuestionTimer(15); // Start a 15-second timer
            this.quizIsActive = true;
            // --- End Placeholder ---
        }

        update() {
            const speed = 160;

            // Only allow movement if the quiz is active
            if (this.quizIsActive) {
                // Reset velocity
                this.player.setVelocity(0);

                // Player Movement (4-Directional Top-Down)
                if (this.cursors.left.isDown) {
                    this.player.setVelocityX(-speed);
                } else if (this.cursors.right.isDown) {
                    this.player.setVelocityX(speed);
                }

                if (this.cursors.up.isDown) {
                    this.player.setVelocityY(-speed);
                } else if (this.cursors.down.isDown) {
                    this.player.setVelocityY(speed);
                }

                // Normalize and scale the velocity
                this.player.body.velocity.normalize().scale(speed);
            } else {
                 // Stop player if quiz is not active
                 this.player.setVelocity(0);
            }
        }

        // --- Quiz Timer Functions ---
        startQuestionTimer(durationSeconds) {
            this.remainingTime = durationSeconds;
            this.timerText.setText('Time: ' + this.remainingTime);

            // Remove any existing timer to prevent duplicates
            if (this.timerEvent) {
                this.timerEvent.remove(false);
            }

            // Create a new timer event
            this.timerEvent = this.time.addEvent({
                delay: 1000, // 1 second
                callback: this.tickTimer,
                callbackScope: this,
                loop: true
            });
             console.log("Timer started with duration:", durationSeconds);
        }

        tickTimer() {
            this.remainingTime--;
            this.timerText.setText('Time: ' + this.remainingTime);
             console.log("Timer tick:", this.remainingTime);

            if (this.remainingTime <= 0) {
                console.log("Timer expired!");
                if (this.timerEvent) {
                     this.timerEvent.remove(false); // Stop the timer event
                     this.timerEvent = null; // Clear the reference
                }
                this.checkAnswer();
            }
        }

        // --- Answer Checking Function ---
        checkAnswer() {
            console.log("Checking answer...");
            this.quizIsActive = false; // Stop movement, end the round temporarily

            const playerX = this.player.x;
            const playerY = this.player.y;
            let playerZoneIndex = -1; // Default to -1 (no zone)

            // Find which zone the player is in
            for (let i = 0; i < this.answerZones.length; i++) {
                if (Phaser.Geom.Rectangle.Contains(this.answerZones[i], playerX, playerY)) {
                    playerZoneIndex = i;
                    break; // Found the zone, no need to check others
                }
            }

            const isCorrect = playerZoneIndex === this.currentCorrectAnswerIndex;

            console.log('Player was in zone:', playerZoneIndex, 'Correct zone:', this.currentCorrectAnswerIndex, 'Result:', isCorrect ? 'CORRECT' : 'INCORRECT');

            // TODO: Add logic for what happens next (e.g., show result, load next question)
            // For now, just log and stop. Maybe change background color?
             this.cameras.main.setBackgroundColor(isCorrect ? '#008000' : '#800000'); // Green for correct, Red for incorrect
             // After a delay, maybe reset or start next question
             this.time.delayedCall(2000, () => {
                 this.cameras.main.setBackgroundColor('#000000'); // Reset background
                 // Potentially start a new question here in the future
                 console.log("Ready for next question (not implemented yet)");
                 // For now, keep quiz inactive
                 // this.quizIsActive = true; // Re-enable movement if needed for next round
             });
        }
    }

    // --- Game Configuration ---
    var config = {
        type: Phaser.WEBGL,
        width: 800,
        height: 600,
        parent: 'game',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false // Set true to see physics bodies and zones
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [GameScene]
    };

    // --- Initialize Game ---
    var game = new Phaser.Game(config);

}, false);

// Fallback for running in browser without Cordova
if (!window.cordova) {
    const event = new Event('deviceready');
    document.dispatchEvent(event);
}