// deviceready listener removed for web deployment

    class GameScene extends Phaser.Scene {
        constructor() {
            super({ key: 'GameScene' });
            this.player = null;
            this.cursors = null;
            this.interactKey = null; // Will be defined in create

            // --- Touch Control Flags/Refs ---
            this.isTouchDevice = false;
            this.dpad = {
                up: null,
                down: null,
                left: null,
                right: null,
                interact: null
            };
            this.touchFlags = {
                up: false,
                down: false,
                left: false,
                right: false,
                interactPressed: false // For single press detection
            };


            // --- Lesson Data ---
            this.lessons = [
                {
                    id: 'lesson0',
                    title: 'What are Sats?',
                    content: 'Sats, short for Satoshis, are the smallest unit of Bitcoin. 1 Bitcoin = 100,000,000 Sats.',
                    reward: 5 // Example reward
                }
                // Add more lessons here
            ];

            // --- NPC Data ---
             this.npcs = [
                { id: 'npc1', type: 'knowledge', dataId: 'lesson0', x: 150, y: 200, spriteKey: 'npc_info', sprite: null }, // Adjusted for 800x600 background, corrected spriteKey
                { id: 'npc2', type: 'quiz', dataId: 'AI_BITCOIN_QUIZ', x: 650, y: 200, spriteKey: 'npc_quiz', sprite: null } // Adjusted for 800x600 background
            ];


            // --- Quiz Data ---
            // Using quiz4 (Bitcoin Basics) as the initial quiz data
            this.quizzes = [
                {
                    id: 'quiz4',
                    topic: 'Bitcoin Basics',
                    cost: 1, // Example cost
                    reward: 1, // Example reward
                    questions: [
                        {
                            q: 'What is the maximum supply of Bitcoin?',
                            a: ['21 million', '100 million', '1 billion', 'Unlimited'],
                            correct: '21 million',
                            duration: 10 // Optional: Time limit per question
                        },
                        {
                            q: 'Who is the pseudonymous creator of Bitcoin?',
                            a: ['Vitalik Buterin', 'Satoshi Nakamoto', 'Elon Musk', 'Craig Wright'],
                            correct: 'Satoshi Nakamoto',
                            duration: 10
                        },
                        {
                            q: 'What is the approximate block time for Bitcoin?',
                            a: ['1 minute', '10 minutes', '1 hour', '1 day'],
                            correct: '10 minutes',
                            duration: 10
                        },
                        {
                            q: 'What consensus mechanism does Bitcoin use?',
                            a: ['Proof of Stake', 'Proof of Authority', 'Proof of Work', 'Proof of Burn'],
                            correct: 'Proof of Work',
                            duration: 10
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
            this.completedLessons = new Set(); // Track completed lessons
            this.feedbackText = null; // For displaying "Correct!" or "Wrong!"

            // --- NPC Interaction State ---
            // this.interactKey is already defined above
            this.closestNpc = null;
            this.interactionPromptText = null;
            this.showingKnowledgeUI = false;
            this.showingQuizPromptUI = false;
            this.currentNpcInteraction = null; // Store the npc object being interacted with
            this.knowledgeContainer = null; // UI Container for knowledge
            this.quizPromptContainer = null; // UI Container for quiz prompt
        }

        preload() {
            // Load player image (using player-small.png as placeholder)
            // this.load.image('player', 'img/player-small.png');
            // Load NPC placeholder images
            // this.load.image('npc_knowledge', 'img/cordova-small.png'); // Placeholder
            // this.load.image('npc_quiz', 'img/cordova-small.png'); // Placeholder
            this.load.spritesheet('player_spritesheet', 'img/characters/RPG_assets.png', { frameWidth: 15, frameHeight: 15 });
            this.load.image('npc_sprite', 'img/characters/dark-ent.png');
            this.load.image('npc_quiz', 'img/characters/coppergolem.png');
            this.load.image('npc_info', 'img/characters/dark-ent.png');
            // Comment out old background image
            this.load.image('newBackground', 'img/mainroom_bg.png');
            // Load new tilemap assets
            // this.load.image('tiles', 'assets/map/spritesheet-extruded.png');
            // this.load.tilemapTiledJSON('map', 'assets/map/map.json');
            // Load interact button image
            this.load.image('interact_button', 'img/icons/target.png'); // Using target.png for interact
        }

        create() {
            // --- Socket.IO Initialization ---
            this.socket = io('https://game-api-c2gn.onrender.com');
            this.otherPlayers = this.physics.add.group();

            // --- Assumed dimensions for the new background ---
            // Dimensions of the background image, confirmed by user.
            const imageWidth = 800;
            const imageHeight = 600;

            // --- Comment out Static Background Image ---
            this.add.image(0, 0, 'newBackground').setOrigin(0, 0);

            // --- Tilemap Setup ---
            // const map = this.make.tilemap({ key: 'map' });
            // // Args: Tiled tileset name, Phaser key for tileset image, tileW, tileH, margin, spacing
            // const tileset = map.addTilesetImage('spritesheet', 'tiles', 16, 16, 0, 0);

            // // --- Create Layers ---
            // // Ensure layer names match those in your Tiled JSON file
            // const groundLayer = map.createLayer('Grass', tileset, 0, 0);
            // const collisionLayer = map.createLayer('Obstacles', tileset, 0, 0);

            // // --- Collision Setup ---
            // // Assumes 'Obstacles' layer has a custom property 'collides: true' in Tiled
            // if (collisionLayer) { // Check if layer exists
            //     collisionLayer.setCollisionByProperty({ collides: true });
            // }


            // --- Adjust World and Camera Bounds to Static Background ---
            this.physics.world.setBounds(0, 0, 800, 600);
            this.cameras.main.setBounds(0, 0, 800, 600);
            this.cameras.main.roundPixels = true; // Helps prevent tile bleeding
            // this.cameras.main.setZoom(1.25); // Ensure zoom is off for static background

            // Optional: Make camera follow player if map is larger than screen
            // this.cameras.main.startFollow(this.player, true, 0.08, 0.08);


            // --- Player (Top-down view) ---
            // Position player within the new background
            this.player = this.physics.add.sprite(400, 450, 'player_spritesheet', 0); // Adjusted for visibility on 800x600, using new spritesheet
            this.player.setScale(2); // Scale up new player sprite
            this.player.setCollideWorldBounds(true); // Player collides with world bounds (now 800x600)
            this.player.body.setSize(20, 20); // Adjust as needed, new sprite is 20x20
            this.player.oldPosition = { x: this.player.x, y: this.player.y }; // Initialize oldPosition

            // --- Add Collider with Tilemap Collision Layer ---
            // if (collisionLayer) { // Check if layer exists
            //     this.physics.add.collider(this.player, collisionLayer); // This would cause an error as collisionLayer is not defined
            // }

            // --- Camera Follow Player ---
            this.cameras.main.startFollow(this.player, true, 0.08, 0.08);


            // --- Spawn NPCs ---
            this.npcs.forEach(npc => {
                const npcSprite = this.physics.add.staticSprite(npc.x, npc.y, npc.spriteKey); // Use specific spriteKey from NPC data
                npc.sprite = npcSprite; // Store sprite reference
                npcSprite.setScale(2); // Scale up new NPC sprite
                npcSprite.body.setSize(20, 20); // Set explicit physics size, new sprite is 20x20
                npcSprite.body.immovable = true; // Make NPC immovable
                // Original NPC collision with player (still needed if NPCs are obstacles)
                this.physics.add.collider(this.player, npcSprite);
            });

            // --- UI Text Elements ---
            this.questionText = this.add.text(400, 80, 'Welcome to hermitONL (Hermit Online)!', {
                fontSize: '24px',
                fill: '#fff',
                align: 'center',
                wordWrap: { width: 750 }
            }).setOrigin(0.5);

            const answerStyle = {
                fontSize: '14px', // Slightly smaller font for better fit
                fill: '#fff',
                align: 'center',
                wordWrap: { width: 90 } // Wrap text within platform width
            };
            // const answerY = 500; // No longer needed, text Y will be relative to platform
            const answerZoneWidth = 100; // Platform width
            const answerZoneHeight = 100; // Platform height
            // const answerZoneY = 450; // No longer needed, platform Y comes from platformPositions

            // Define Answer Platform Positions (top-left corner for 100x100 platforms)
            const platformPositions = [
                { x: 275, y: 175 }, // Platform A (top-left of 2x2 grid)
                { x: 425, y: 175 }, // Platform B (top-right of 2x2 grid)
                { x: 275, y: 325 }, // Platform C (bottom-left of 2x2 grid)
                { x: 425, y: 325 }  // Platform D (bottom-right of 2x2 grid)
            ];

            // Optional: Graphics for visualizing zones
            const graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0x00ff00, alpha: 0.1 } });

            platformPositions.forEach((pos, index) => {
                const zone = new Phaser.Geom.Rectangle(
                    pos.x, // Use platform's top-left x
                    pos.y, // Use platform's top-left y
                    answerZoneWidth,
                    answerZoneHeight
                );
                this.answerZones.push(zone);

                // Draw zone for debugging
                graphics.strokeRectShape(zone);
                graphics.fillRectShape(zone);

                // Calculate text position to be centered on the platform
                const textX = pos.x + answerZoneWidth / 2;
                const textY = pos.y + answerZoneHeight / 2;
                const answerText = this.add.text(textX, textY, String.fromCharCode(65 + index), answerStyle).setOrigin(0.5);
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
            this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

            // --- Touch Controls Setup ---
            this.isTouchDevice = this.sys.game.device.input.touch;

            if (this.isTouchDevice) {
                const controlSize = 64;
                const controlPadding = 10;
                const interactButtonSize = 72;
                const screenWidth = this.cameras.main.width;
                const screenHeight = this.cameras.main.height;

                // D-Pad (bottom-left)
                // Left
                this.dpad.left = this.add.rectangle(controlPadding + controlSize / 2, screenHeight - controlPadding - controlSize * 1.5, controlSize, controlSize, 0x888888, 0.5).setInteractive();
                this.dpad.left.on('pointerdown', () => { this.touchFlags.left = true; });
                this.dpad.left.on('pointerup', () => { this.touchFlags.left = false; });
                this.dpad.left.on('pointerout', () => { this.touchFlags.left = false; }); // Stop if pointer leaves button while pressed

                // Right
                this.dpad.right = this.add.rectangle(controlPadding + controlSize * 2.5, screenHeight - controlPadding - controlSize * 1.5, controlSize, controlSize, 0x888888, 0.5).setInteractive();
                this.dpad.right.on('pointerdown', () => { this.touchFlags.right = true; });
                this.dpad.right.on('pointerup', () => { this.touchFlags.right = false; });
                this.dpad.right.on('pointerout', () => { this.touchFlags.right = false; });

                // Up
                this.dpad.up = this.add.rectangle(controlPadding + controlSize * 1.5, screenHeight - controlPadding - controlSize * 2.5, controlSize, controlSize, 0x888888, 0.5).setInteractive();
                this.dpad.up.on('pointerdown', () => { this.touchFlags.up = true; });
                this.dpad.up.on('pointerup', () => { this.touchFlags.up = false; });
                this.dpad.up.on('pointerout', () => { this.touchFlags.up = false; });

                // Down
                this.dpad.down = this.add.rectangle(controlPadding + controlSize * 1.5, screenHeight - controlPadding - controlSize / 2, controlSize, controlSize, 0x888888, 0.5).setInteractive();
                this.dpad.down.on('pointerdown', () => { this.touchFlags.down = true; });
                this.dpad.down.on('pointerup', () => { this.touchFlags.down = false; });
                this.dpad.down.on('pointerout', () => { this.touchFlags.down = false; });

                // Interact Button (bottom-right)
                this.dpad.interact = this.add.sprite(screenWidth - controlPadding - interactButtonSize / 2, screenHeight - controlPadding - interactButtonSize / 2, 'interact_button').setInteractive();
                this.dpad.interact.setDisplaySize(interactButtonSize, interactButtonSize);
                this.dpad.interact.setAlpha(0.7);
                this.dpad.interact.on('pointerdown', () => {
                    this.touchFlags.interactPressed = true;
                    // Optional: visual feedback
                    this.dpad.interact.setAlpha(1);
                    this.time.delayedCall(100, () => {
                         if(this.dpad.interact) this.dpad.interact.setAlpha(0.7);
                    });
                });
                // No pointerup needed for interactPressed as it's a single-frame flag, reset in update

                // Make controls fixed to camera
                [this.dpad.left, this.dpad.right, this.dpad.up, this.dpad.down, this.dpad.interact].forEach(control => {
                    if (control) control.setScrollFactor(0);
                });
            }

            // --- Interaction Prompt Text ---
            this.interactionPromptText = this.add.text(this.player.x, this.player.y - 30, 'Press E', {
                fontSize: '12px',
                fill: '#fff',
                backgroundColor: 'rgba(0,0,0,0.7)', // Added background for visibility
                padding: { x: 5, y: 2 }
            }).setOrigin(0.5).setVisible(false);

            // --- Knowledge UI Container ---
            const knowledgeBg = this.add.rectangle(400, 300, 500, 300, 0x000033, 0.9).setStrokeStyle(2, 0xffffff);
            const knowledgeTitle = this.add.text(400, 180, 'Lesson Title', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
            const knowledgeContent = this.add.text(400, 280, 'Lesson content goes here.', { fontSize: '16px', fill: '#fff', wordWrap: { width: 480 }, align: 'center' }).setOrigin(0.5);
            const knowledgeClose = this.add.text(400, 420, '[Press E to Close]', { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);
            this.knowledgeContainer = this.add.container(0, 0, [knowledgeBg, knowledgeTitle, knowledgeContent, knowledgeClose]);
            this.knowledgeContainer.setVisible(false);

            // --- Quiz Prompt UI Container ---
            const quizPromptBg = this.add.rectangle(400, 300, 400, 250, 0x330000, 0.9).setStrokeStyle(2, 0xffffff);
            const quizPromptTitle = this.add.text(400, 210, 'Quiz Challenge!', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
            const quizPromptTopic = this.add.text(400, 250, 'Topic: Bitcoin Basics', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
            const quizPromptCost = this.add.text(400, 280, 'Cost: 1 Sats', { fontSize: '16px', fill: '#ffcc00' }).setOrigin(0.5);
            const quizPromptStart = this.add.text(400, 330, '[Press E to Start]', { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);
            const quizPromptClose = this.add.text(400, 360, '[Move Away to Cancel]', { fontSize: '12px', fill: '#aaa' }).setOrigin(0.5); // Added cancel instruction
            this.quizPromptContainer = this.add.container(0, 0, [quizPromptBg, quizPromptTitle, quizPromptTopic, quizPromptCost, quizPromptStart, quizPromptClose]);
            this.quizPromptContainer.setVisible(false);

            // --- Feedback Text ---
            this.feedbackText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', {
                fontSize: '48px',
                fill: '#fff',
                align: 'center',
                stroke: '#000',
                strokeThickness: 6
            }).setOrigin(0.5).setVisible(false).setDepth(10); // High depth to appear on top


            // --- Load Initial Question ---
            // this.loadQuestion(0, 0); // REMOVED - Quiz now starts via NPC interaction

            // --- Socket Event Handlers ---
            this.socket.on('currentPlayers', (players) => {
              console.log('Received currentPlayers:', players);
              Object.keys(players).forEach((id) => {
                if (players[id].id === this.socket.id) {
                  console.log('Skipping local player in currentPlayers:', players[id].id);
                  // Optionally, handle self-data if needed, or add own player to a group
                } else {
                  // Check if player already exists
                  const existingPlayer = this.otherPlayers.getChildren().find(op => op.playerId === players[id].id);
                  console.log('Processing player in currentPlayers:', players[id].id, 'Existing?', !!existingPlayer);

                  if (!existingPlayer) {
                    console.log('Adding new other player from currentPlayers:', players[id].id);
                    // Add sprite for other players
                    const otherPlayer = this.physics.add.sprite(players[id].x, players[id].y, 'player_spritesheet', 0); // Use 'player_spritesheet' or a different key if you want different sprites for others
                    otherPlayer.playerId = players[id].id;
                    otherPlayer.setScale(2); // Apply scaling if needed, consistent with local player
                    this.otherPlayers.add(otherPlayer);
                  } else {
                    console.log('Updating existing other player from currentPlayers:', players[id].id);
                    // Player already exists, update position
                    existingPlayer.setPosition(players[id].x, players[id].y);
                  }
                }
              });
            });

            this.socket.on('newPlayer', (playerInfo) => {
              console.log('Received newPlayer:', playerInfo);
              // Ensure not to add self if server broadcasts own connection as newPlayer
              if (playerInfo.id !== this.socket.id) {
                // Check if player already exists
                const existingPlayer = this.otherPlayers.getChildren().find(op => op.playerId === playerInfo.id);
                console.log('Processing newPlayer:', playerInfo.id, 'Existing?', !!existingPlayer);

                if (!existingPlayer) {
                  console.log('Adding new other player from newPlayer event:', playerInfo.id);
                  const otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player_spritesheet', 0);
                  otherPlayer.playerId = playerInfo.id;
                  otherPlayer.setScale(2); // Apply scaling
                  this.otherPlayers.add(otherPlayer);
                } else {
                  console.log('Updating existing other player from newPlayer event (should be rare):', playerInfo.id);
                  // Player already exists, update position (though newPlayer typically means they weren't there)
                  // This case might be redundant if server logic is perfect, but good for robustness
                  existingPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
              } else {
                console.log('Skipping newPlayer event for local player:', playerInfo.id);
              }
            });

            this.socket.on('playerMoved', (playerInfo) => {
              console.log('Received playerMoved:', playerInfo);
              this.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerInfo.id === otherPlayer.playerId) {
                  console.log('Updating position for moved player:', playerInfo.id);
                  otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                  // Potentially update animation/frame based on movement in future
                }
              });
            });

            this.socket.on('playerDisconnected', (playerId) => {
              this.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerId === otherPlayer.playerId) {
                  otherPlayer.destroy();
                }
              });
            });
        }

        update() {
            const speed = 160;
            const interactionRange = 50; // Max distance to show interaction prompt
            const uiCloseRange = 100; // Max distance before UI closes automatically

            // --- Interaction Logic ---
            let currentClosestNpc = null; // Use a temporary variable for this frame's check

            if (!this.showingKnowledgeUI && !this.showingQuizPromptUI && !this.quizIsActive) { // Only check for new interactions if no UI is open and quiz isn't running
                 let minDist = interactionRange;
                 this.npcs.forEach(npc => {
                    if (npc.sprite) { // Ensure sprite exists
                        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
                        if (distance < minDist) {
                            minDist = distance;
                            currentClosestNpc = npc; // Update temp variable
                        }
                    }
                });
                 // Update the main state variable ONLY if we were actively checking
                 this.closestNpc = currentClosestNpc;
            }
            // If UI is showing or quiz is active, this.closestNpc retains its value from the last valid check


            // Show/Hide Interaction Prompt (Based on the potentially updated this.closestNpc)
            if (this.closestNpc && !this.showingKnowledgeUI && !this.showingQuizPromptUI && !this.quizIsActive) {
                this.interactionPromptText.setPosition(this.player.x, this.player.y - 30).setVisible(true);
            } else {
                this.interactionPromptText.setVisible(false);
            }

            // Handle 'E' Key Press or Touch Interact
            const justPressedE = Phaser.Input.Keyboard.JustDown(this.interactKey);
            const justTouchedInteract = this.touchFlags.interactPressed;

            if (justPressedE || justTouchedInteract) {
                if (this.showingQuizPromptUI && this.currentNpcInteraction) {
                    // Attempt to start the quiz
                    this.startQuiz(this.currentNpcInteraction.dataId);
                } else if (this.showingKnowledgeUI) {
                     // Close knowledge UI
                     this.hideAllNpcUI();
                } else if (this.closestNpc) {
                    // Initiate interaction with the closest NPC
                    this.handleNpcInteraction(this.closestNpc);
                } else {
                    // Optional: Log if E is pressed with no target, if needed for future debugging
                    // console.log("'E' pressed but no interaction target.");
                }
            }

            // --- UI Auto-Close Logic ---
            if ((this.showingKnowledgeUI || this.showingQuizPromptUI) && this.currentNpcInteraction && this.currentNpcInteraction.sprite) {
                 const distanceToCurrentNpc = Phaser.Math.Distance.Between(
                     this.player.x, this.player.y,
                     this.currentNpcInteraction.sprite.x, this.currentNpcInteraction.sprite.y
                 );
                 if (distanceToCurrentNpc > uiCloseRange) {
                     this.hideAllNpcUI();
                 }
            }


            // --- Player Movement ---
            // Player movement is always allowed based on input keys.
            // Quiz logic (checkAnswer) and UI logic handle states where movement might be implicitly stopped or consequences occur.

            // Reset velocity
            this.player.setVelocity(0);

            // Player Movement (4-Directional Top-Down)
            if (this.cursors.left.isDown || this.touchFlags.left) {
                this.player.setVelocityX(-speed);
            } else if (this.cursors.right.isDown || this.touchFlags.right) {
                this.player.setVelocityX(speed);
            }

            if (this.cursors.up.isDown || this.touchFlags.up) {
                this.player.setVelocityY(-speed);
            } else if (this.cursors.down.isDown || this.touchFlags.down) {
                this.player.setVelocityY(speed);
            }

            // Normalize and scale the velocity if moving
            if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
                 this.player.body.velocity.normalize().scale(speed);
            }

            // Reset single-frame touch flags
            if (this.touchFlags.interactPressed) {
                this.touchFlags.interactPressed = false;
            }

            // --- Emit Player Movement ---
            if (this.player && this.socket) { // Ensure player and socket exist
              const x = this.player.x;
              const y = this.player.y;
              // const r = this.player.rotation; // If syncing rotation

              if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y /* || r !== this.player.oldPosition.rotation */)) {
                this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y /*, rotation: this.player.rotation */ });
              }
              // Store old position
              this.player.oldPosition = {
                x: this.player.x,
                y: this.player.y,
                // rotation: this.player.rotation
              };
            }
        }


        // --- Load Question Function ---
        loadQuestion(questionIndex) {
            console.log("[Phaser] loadQuestion called. questionIndex:", questionIndex, "quizIsActive:", this.quizIsActive);
            try {
                console.log("[Phaser] this.currentQuizData at start of loadQuestion:", JSON.parse(JSON.stringify(this.currentQuizData || {})));
            } catch (e) {
                console.log("[Phaser] this.currentQuizData at start of loadQuestion (could not stringify):", this.currentQuizData);
            }

            if (!this.quizIsActive || !this.currentQuizData || !this.currentQuizData.questions || this.currentQuizData.questions.length === 0 || questionIndex < 0 || questionIndex >= this.currentQuizData.questions.length) {
                console.error("[Phaser] loadQuestion: Invalid conditions to load question.");
                console.error("[Phaser] Details - quizIsActive:", this.quizIsActive, "questionIndex:", questionIndex, "currentQuizData exists:", !!this.currentQuizData, "questions array exists:", !!(this.currentQuizData && this.currentQuizData.questions), "questions length:", (this.currentQuizData && this.currentQuizData.questions ? this.currentQuizData.questions.length : 'N/A'));
                
                if (this.quizIsActive) {
                    this.endQuiz("Error: Question data not found or invalid.");
                }
                return;
            }

            this.currentQuestionData = this.currentQuizData.questions[questionIndex]; // Use this.currentQuizData
            console.log("[Phaser] Loading question content:", this.currentQuestionData);
            
            if (!this.currentQuestionData || typeof this.currentQuestionData.q !== 'string' || !Array.isArray(this.currentQuestionData.a)) {
                console.error("[Phaser] Malformed question data:", this.currentQuestionData);
                this.endQuiz("Error: Malformed question data.");
                return;
            }

            this.questionText.setText(this.currentQuestionData.q);
            this.currentCorrectAnswerIndex = this.currentQuestionData.a.indexOf(this.currentQuestionData.correct);

            if (this.currentCorrectAnswerIndex === -1) {
                 console.error(`[Phaser] Correct answer "${this.currentQuestionData.correct}" not found in options:`, this.currentQuestionData.a);
                 this.endQuiz('Error: Invalid question data (correct answer missing).');
                 return;
            }

            this.answerTexts.forEach((textObj, i) => {
                if (this.currentQuestionData.a[i] !== undefined) {
                    textObj.setText(this.currentQuestionData.a[i]);
                    textObj.setVisible(true);
                    textObj.setFill('#fff');
                } else {
                    textObj.setText(''); // Clear if no answer for this option
                    textObj.setVisible(false);
                }
            });

            const duration = this.currentQuestionData.duration || 10;
            this.startQuestionTimer(duration);
            
            this.cameras.main.setBackgroundColor('#000000'); // Reset background
            this.questionText.setVisible(true);
            this.timerText.setVisible(true);
            this.feedbackText.setVisible(false); // Clear previous feedback
            // this.quizIsActive = true; // Already set before calling loadQuestion or should be set by caller
            console.log("[Phaser] Question loaded successfully, quiz should be active.");
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
             // console.log("Timer tick:", this.remainingTime); // Removed debug log

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
        checkAnswer(timedOut = false) { // Parameter indicates if called due to timeout
            if (!this.currentQuestionData) { // Simplified check: if no question data, can't check.
                console.warn("checkAnswer called without currentQuestionData.");
                if (this.quizIsActive) this.endQuiz("Error during quiz."); // End if was active.
                return;
            }
            
            // Stop further interactions for this question immediately
            const wasActive = this.quizIsActive; // Store if it was active before this check
            this.quizIsActive = false;

            if (this.timerEvent) {
                this.timerEvent.remove(false);
                this.timerEvent = null;
            }

            let playerOnCorrectPlatform = false;
            // let chosenAnswerText = null; // Not strictly needed if only using playerOnCorrectPlatform
            const correctAnswer = this.currentQuestionData.correct;

            this.answerZones.forEach((zone, index) => {
                if (this.player && Phaser.Geom.Rectangle.Contains(zone, this.player.x, this.player.y)) {
                    // chosenAnswerText = this.currentQuestionData.a[index];
                    if (index === this.currentCorrectAnswerIndex) {
                        playerOnCorrectPlatform = true;
                    }
                    // Highlight the platform player is on, regardless of correctness for now
                    this.answerTexts[index].setFill('#ffff00');
                }
            });

            if (timedOut) {
                this.feedbackText.setText(`Time's up! Correct: ${correctAnswer}`).setFill('#ff9900').setVisible(true);
            } else if (playerOnCorrectPlatform) {
                this.feedbackText.setText('Correct!').setFill('#00ff00').setVisible(true);
                if (wasActive) { // Only add score if quiz was active when answer was made
                    this.playerScore += (this.currentQuizData.reward || 1);
                }
            } else { // Incorrect choice or didn't land on any platform if not timed out
                this.feedbackText.setText(`Wrong! Correct: ${correctAnswer}`).setFill('#ff0000').setVisible(true);
                
                // Highlight the correct answer in green, and the chosen wrong answer (if any) in a different color.
                this.answerTexts.forEach((textObj, idx) => {
                    if (idx === this.currentCorrectAnswerIndex) {
                        textObj.setFill('#00cc00'); // Correct answer green
                    } else if (textObj.style.fill && typeof textObj.style.fill === 'string' && textObj.style.fill.toLowerCase() === '#ffff00') {
                        // This was the one player selected (marked yellow previously) and it's wrong
                        textObj.setFill('#ff6347'); // Tomato red for selected wrong answer
                    } else {
                        // Other incorrect, unselected options
                        textObj.setFill('#d3d3d3'); // Light gray for other non-correct, non-selected
                    }
                });
            }
            this.scoreText.setText('Sats: ' + this.playerScore);

            this.time.delayedCall(2500, () => {
                this.feedbackText.setVisible(false);
                this.answerTexts.forEach(textObj => textObj.setFill('#fff')); // Reset all answer text colors

                this.currentQuizQuestionIndex++;
                if (this.currentQuizData && this.currentQuizQuestionIndex < this.currentQuizData.questions.length) {
                    this.quizIsActive = true; // Re-activate for the next question
                    this.loadQuestion(this.currentQuizQuestionIndex);
                } else {
                    this.endQuiz();
                }
            });
        }
        // --- NPC Interaction Handling ---
        endQuiz(reasonMessage = null) {
            console.log("Ending quiz. Reason:", reasonMessage || "Normal completion.");
            this.quizIsActive = false;

            if (this.timerEvent) {
                this.timerEvent.remove(false);
                this.timerEvent = null;
            }
            
            const finalScoreDisplay = this.currentQuizData ?
                `Final Score: ${this.playerScore} Sats. (Topic: ${this.currentQuizData.topic})` :
                `Final Sats: ${this.playerScore}`;

            this.feedbackText.setText(reasonMessage || finalScoreDisplay).setFill('#00ffff').setVisible(true);

            if (this.player) this.player.setVisible(true);
            this.npcs.forEach(npc => { if (npc.sprite) npc.sprite.setVisible(true); });
            this.otherPlayers.getChildren().forEach(op => op.setVisible(true));

            this.questionText.setVisible(false);
            this.answerTexts.forEach(text => text.setVisible(false));
            this.timerText.setVisible(false);
            
            // Reset for next potential quiz
            this.currentQuizData = null;
            this.currentQuestionData = null;
            this.currentQuizQuestionIndex = 0;

            this.time.delayedCall(3500, () => { // Longer display for final message
                this.feedbackText.setVisible(false);
                this.currentNpcInteraction = null;
            });
        }
        
        // --- NPC Interaction Handling ---
        handleNpcInteraction(npc) {
            if (this.quizIsActive || this.showingKnowledgeUI || this.showingQuizPromptUI) {
                // If any UI is already active, or quiz is running, don't start a new interaction.
                // This prevents overlapping UI if player mashes E or moves quickly between NPCs.
                return;
            }

            this.currentNpcInteraction = npc;
            this.interactionPromptText.setVisible(false); // Hide "Press E" prompt

            if (npc.type === 'knowledge') {
                this.showKnowledgeUI(npc.dataId);
            } else if (npc.type === 'quiz') {
                // For AI quiz, we directly call startQuiz if that's the dataId
                // Otherwise, show the prompt for regular quizzes.
                if (npc.dataId === 'AI_BITCOIN_QUIZ') {
                    this.startQuiz(npc.dataId); // Directly start the AI quiz
                } else {
                    this.showQuizPromptUI(npc.dataId); // Show prompt for other quizzes
                }
            }
        }

        showKnowledgeUI(lessonId) {
            const lesson = this.lessons.find(l => l.id === lessonId);
            if (!lesson) {
                console.error("Lesson not found:", lessonId);
                return;
            }

            // Update UI elements (assuming container children order: bg, title, content, close)
            this.knowledgeContainer.getAt(1).setText(lesson.title); // Update title
            this.knowledgeContainer.getAt(2).setText(lesson.content); // Update content

            this.knowledgeContainer.setVisible(true);
            this.showingKnowledgeUI = true;

            // Award score/sats if lesson not completed before
            if (!this.completedLessons.has(lessonId)) {
                const reward = lesson.reward || 0;
                this.playerScore += reward;
                this.scoreText.setText('Sats: ' + this.playerScore);
                this.completedLessons.add(lessonId);
                // Optional: Add a temporary text effect for reward
                 const rewardText = this.add.text(this.player.x, this.player.y - 50, `+${reward} Sats!`, { fontSize: '16px', fill: '#00ff00' }).setOrigin(0.5);
                 this.tweens.add({
                     targets: rewardText,
                     y: rewardText.y - 30,
                     alpha: 0,
                     duration: 1500,
                     ease: 'Power1',
                     onComplete: () => { rewardText.destroy(); }
                 });
            } else {
                 // Optional: console.log(`Lesson '${lessonId}' already completed.`);
            }
        }

        showQuizPromptUI(quizId) {
            const quiz = this.quizzes.find(q => q.id === quizId);
            if (!quiz) {
                console.error("Quiz not found for prompt:", quizId); // Keep error logs
                return;
            }

            // Update UI elements (assuming container children order: bg, title, topic, cost, start, close)
            this.quizPromptContainer.getAt(2).setText(`Topic: ${quiz.topic}`); // Update topic
            this.quizPromptContainer.getAt(3).setText(`Cost: ${quiz.cost} Sats`); // Update cost

            this.quizPromptContainer.setVisible(true);
            this.showingQuizPromptUI = true;
        }

        hideAllNpcUI() {
            this.knowledgeContainer.setVisible(false);
            this.quizPromptContainer.setVisible(false);
            this.showingKnowledgeUI = false;
            this.showingQuizPromptUI = false;
            this.currentNpcInteraction = null;
        }

        async startQuiz(quizId) {
            this.hideAllNpcUI(); // Hide any open NPC UI first

            if (quizId === 'AI_BITCOIN_QUIZ') {
                try {
                    this.questionText.setText('Fetching Bitcoin Quiz...').setVisible(true); // Show loading message
                    const apiUrl = '/api/quiz?topic=Bitcoin&count=5';
                    const response = await fetch(apiUrl);
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                        throw new Error(errorData.message || `Failed to fetch AI quiz. Status: ${response.status}`);
                    }
                    const fetchedQuizData = await response.json();

                    if (!fetchedQuizData || !fetchedQuizData.questions || fetchedQuizData.questions.length === 0) {
                        this.feedbackText.setText('AI Bitcoin quiz not available. Try later.').setVisible(true);
                        this.time.delayedCall(2500, () => {
                            this.feedbackText.setVisible(false);
                            this.questionText.setText('').setVisible(false); // Clear loading message
                        });
                        this.currentNpcInteraction = null;
                        return;
                    }

                    const aiQuizCost = 0; // AI quizzes are free
                    // No need to check player score if cost is 0, but good practice if cost might change
                    // this.playerScore -= aiQuizCost; // No deduction if free
                    // this.scoreText.setText('Sats: ' + this.playerScore);

                    this.currentQuizData = {
                        id: fetchedQuizData.id || 'AI_BITCOIN_QUIZ',
                        topic: fetchedQuizData.topic || 'Bitcoin (AI)',
                        questions: fetchedQuizData.questions,
                        cost: aiQuizCost,
                        reward: 1 // Example reward for AI quiz completion
                    };
                    this.quizIsActive = true;
                    this.currentQuizQuestionIndex = 0;
                    
                    // Prepare UI for quiz
                    // Player, NPCs, and other players remain visible during the quiz
                    this.questionText.setVisible(true); // Already visible from loading message
                    this.answerTexts.forEach(text => text.setVisible(true));
                    this.timerText.setVisible(true);
                    // Score text remains visible

                    console.log("[Phaser] In startQuiz (AI), about to call loadQuestion. currentQuizQuestionIndex:", this.currentQuizQuestionIndex);
                    console.log("[Phaser] In startQuiz (AI), this.currentQuizData:", JSON.parse(JSON.stringify(this.currentQuizData || {})));
                    this.loadQuestion(this.currentQuizQuestionIndex);

                } catch (error) {
                    console.error('Error starting AI quiz:', error);
                    this.questionText.setText('').setVisible(false); // Clear loading message
                    this.feedbackText.setText(`Error: ${error.message || 'Could not load AI quiz.'}`).setVisible(true);
                    this.time.delayedCall(3000, () => this.feedbackText.setVisible(false));
                    this.currentNpcInteraction = null;
                }
            } else {
                // Existing logic for predefined quizzes from this.quizzes
                const selectedQuiz = this.quizzes.find(q => q.id === quizId);
                if (!selectedQuiz) {
                    console.error("Quiz data not found for starting:", quizId);
                    this.showQuizPromptUI(quizId); // Re-show prompt if quiz is not found
                    return;
                }

                const cost = selectedQuiz.cost || 0;
                if (this.playerScore >= cost) {
                    this.playerScore -= cost;
                    this.scoreText.setText('Sats: ' + this.playerScore);

                    this.currentQuizData = selectedQuiz; // Set currentQuizData for loadQuestion
                    this.quizIsActive = true;
                    this.currentQuizQuestionIndex = 0;

                    // Prepare UI for quiz
                    // Player, NPCs, and other players remain visible during the quiz
                    this.questionText.setVisible(true);
                    this.answerTexts.forEach(text => text.setVisible(true));
                    this.timerText.setVisible(true);
                    // Score text remains visible

                    console.log("[Phaser] In startQuiz (predefined), about to call loadQuestion. currentQuizQuestionIndex:", this.currentQuizQuestionIndex);
                    console.log("[Phaser] In startQuiz (predefined), this.currentQuizData:", JSON.parse(JSON.stringify(this.currentQuizData || {})));
                    this.loadQuestion(this.currentQuizQuestionIndex);

                } else {
                    this.feedbackText.setText(`Not enough Sats! Need ${cost}.`).setVisible(true);
                    this.time.delayedCall(2000, () => {
                        this.feedbackText.setVisible(false);
                        this.showQuizPromptUI(quizId); // Re-show prompt if they can't afford
                    });
                }
            }
        }
    }

    // --- Game Configuration ---
    var config = {
        type: Phaser.WEBGL,
        width: 800,
        height: 600,
        parent: 'game',
        render: {
            pixelArt: true
        },
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

// deviceready listener and fallback removed for web deployment