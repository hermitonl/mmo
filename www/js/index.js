document.addEventListener('deviceready', function() {

    class GameScene extends Phaser.Scene {
        constructor() {
            super({ key: 'GameScene' });
            this.player = null;
            this.cursors = null;

            // --- Quiz Data ---
            // Using quiz4 (Bitcoin Basics) as the initial quiz data
            this.quizzes = [
                {
                    id: 'quiz4',
                    topic: 'Bitcoin Basics',
                    cost: 10, // Example cost
                    reward: 50, // Example reward
                    questions: [
                        {
                            q: 'What is the maximum supply of Bitcoin?',
                            a: ['21 million', '100 million', '1 billion', 'Unlimited'],
                            correct: '21 million',
                            duration: 15 // Optional: Time limit per question
                        },
                        {
                            q: 'Who is the pseudonymous creator of Bitcoin?',
                            a: ['Vitalik Buterin', 'Satoshi Nakamoto', 'Elon Musk', 'Craig Wright'],
                            correct: 'Satoshi Nakamoto',
                            duration: 15
                        },
                        {
                            q: 'What is the approximate block time for Bitcoin?',
                            a: ['1 minute', '10 minutes', '1 hour', '1 day'],
                            correct: '10 minutes',
                            duration: 15
                        },
                        {
                            q: 'What consensus mechanism does Bitcoin use?',
                            a: ['Proof of Stake', 'Proof of Authority', 'Proof of Work', 'Proof of Burn'],
                            correct: 'Proof of Work',
                            duration: 15
                        }
                    ]
                }
                // Add more quizzes here if needed
            ];

            // --- Quiz State Variables ---
            this.quizIsActive = false;
            this.currentQuestionData = null; // Will hold { q: '...', a: [...], correct: '...' }
            this.currentCorrectAnswerIndex = -1; // Index (0-3) of the correct answer
            this.currentQuizQuestionIndex = 0; // Index of the current question within the selected quiz
            this.timerEvent = null; // To hold the Phaser TimerEvent
            this.remainingTime = 0;
            this.answerZones = []; // To hold Phaser.Geom.Rectangle objects
            this.answerTexts = []; // To hold answer text objects
            this.questionText = null; // To hold question text object
            this.timerText = null; // To hold timer text object
            this.playerScore = 0; // To track player's score
            this.scoreText = null; // To hold score text object
        }

        preload() {
            // Load player image (using logo.png as placeholder)
            this.load.image('player', 'img/logo.png');
        }

        create() {
            // --- Player (Top-down view) ---
            this.player = this.physics.add.sprite(400, 300, 'player');
            this.player.setCollideWorldBounds(true);
            this.player.body.setSize(28, 32); // Adjust as needed

            // --- UI Text Elements ---
            this.questionText = this.add.text(400, 50, 'Loading question...', {
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
            });


            this.timerText = this.add.text(750, 20, 'Time: 0', {
                fontSize: '20px',
                fill: '#fff'
            }).setOrigin(1, 0); // Origin top-right

            // --- Score Display ---
            this.scoreText = this.add.text(20, 20, 'Sats: ' + this.playerScore, {
                fontSize: '20px',
                fill: '#fff'
            }).setOrigin(0, 0); // Origin top-left


            // --- Controls ---
            this.cursors = this.input.keyboard.createCursorKeys();

            // --- Load Initial Question ---
            this.loadQuestion(0, 0); // Load the first question of the first quiz
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

        // --- Load Question Function ---
        loadQuestion(quizIndex, questionIndex) {
            console.log(`Loading quiz ${quizIndex}, question ${questionIndex}`);
            // Select the quiz data
            const quiz = this.quizzes[quizIndex];
            if (!quiz) {
                console.error(`Quiz with index ${quizIndex} not found.`);
                this.questionText.setText('Error: Quiz not found.');
                this.quizIsActive = false;
                return;
            }

            // Get the specific question data
            const questionData = quiz.questions[questionIndex];
            if (!questionData) {
                console.error(`Question with index ${questionIndex} not found in quiz ${quizIndex}.`);
                this.questionText.setText('Error: Question not found.');
                this.quizIsActive = false;
                return;
            }

            // Store current question data and correct answer index
            this.currentQuestionData = questionData;
            this.currentCorrectAnswerIndex = questionData.a.indexOf(questionData.correct);
            if (this.currentCorrectAnswerIndex === -1) {
                 console.error(`Correct answer "${questionData.correct}" not found in options:`, questionData.a);
                 // Handle error appropriately, maybe skip question or show an error message
                 this.questionText.setText('Error: Invalid question data.');
                 this.quizIsActive = false;
                 return;
            }

            // Update UI
            this.questionText.setText(questionData.q);
            this.answerTexts.forEach((text, index) => {
                if (questionData.a[index] !== undefined) {
                    text.setText(`${String.fromCharCode(65 + index)}: ${questionData.a[index]}`);
                } else {
                    text.setText(`${String.fromCharCode(65 + index)}: -`); // Handle cases with fewer than 4 answers
                }
            });

            // Reset background color and start timer
            this.cameras.main.setBackgroundColor('#000000');
            this.startQuestionTimer(questionData.duration || 15); // Use question duration or default to 15s

            // Set quiz active state
            this.quizIsActive = true;
            console.log("Question loaded, quiz active.");
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
                this.checkAnswer(); // Check answer when time runs out
            }
        }

        // --- Answer Checking Function ---
        checkAnswer() {
            console.log("Checking answer...");
            this.quizIsActive = false; // Stop movement, end the round temporarily

            // Stop the timer if it's still running (e.g., player moved into zone before time expired)
            if (this.timerEvent) {
                this.timerEvent.remove(false);
                this.timerEvent = null;
                console.log("Timer stopped manually during checkAnswer.");
            }


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

            // If time expired, playerZoneIndex might still be -1 if they weren't in a zone
            if (this.remainingTime <= 0 && playerZoneIndex === -1) {
                 console.log("Time expired, player not in any zone.");
                 // Treat as incorrect if time runs out and player isn't in a zone
            }


            const isCorrect = playerZoneIndex === this.currentCorrectAnswerIndex;

            if (isCorrect) {
                // --- Update Score ---
                const reward = this.quizzes[0].reward || 10; // Get reward, default 10
                this.playerScore += reward;
                console.log('Correct! Score:', this.playerScore);
                this.scoreText.setText('Sats: ' + this.playerScore); // Update score display
            }

            console.log('Player was in zone:', playerZoneIndex, 'Correct zone:', this.currentCorrectAnswerIndex, 'Result:', isCorrect ? 'CORRECT' : 'INCORRECT');

            // Show feedback
             this.cameras.main.setBackgroundColor(isCorrect ? '#008000' : '#800000'); // Green for correct, Red for incorrect

             // After a delay, load the next question or end the quiz
             this.time.delayedCall(2000, () => {
                 this.cameras.main.setBackgroundColor('#000000'); // Reset background

                 this.currentQuizQuestionIndex++; // Move to the next question index

                 // Check if there are more questions in the current quiz (assuming quiz index 0 for now)
                 const currentQuiz = this.quizzes[0]; // Assuming we are always on the first quiz for now
                 if (this.currentQuizQuestionIndex < currentQuiz.questions.length) {
                     // Load the next question
                     this.loadQuestion(0, this.currentQuizQuestionIndex);
                 } else {
                     // Quiz finished
                     console.log("Quiz finished!");
                     this.questionText.setText('Quiz Finished!');
                     this.answerTexts.forEach(text => text.setText('')); // Clear answer texts
                     this.timerText.setText(''); // Clear timer text
                     this.quizIsActive = false; // Keep quiz inactive
                     // TODO: Add logic for what happens after the quiz (e.g., return to map, show score)
                 }
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