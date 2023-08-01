import debugAI from './challenger/debug.js';
import adversarialAI from './adversarial.js'; // Added this line to import adversarialAI
let gameActive = false;
let playerStand = false;
let opponentButtonClicked = false;
let challengerStand = false;
let rounds = 0; // Initialize rounds counter
let gameEndTimeout = null;
let gameStopped = false;
let turn = "player";
let aiActionPending = false;
let bestOf = 3;  // Can only be an odd number
let deck = [], deckData = [], deckCenterStack = [];  // Combining similar variables
let playerCards = [], challengerCards = [], playerCardPositions = [], challengerCardPositions = [];  // Combining similar variables
let playerCardCount = 2, challengerCardCount = 2; // Combining similar variables
let playerWins = 0, challengerWins = 0; // Combining similar variables
let challengerAIs = {debug: debugAI};
const generateFanOutPositions = count => Array.from({length: count}, (_, i) => ({x: (1 - i) * 30, y: 250, rotate: (1 - i) * 5}));
const loadDeck = async () => deckData = await (await fetch('./json/shoe.json')).json();
const shuffleDeck = (deck) => {
    if (!Array.isArray(deck)) {
      console.error('Invalid input: deck should be an array');
      return;
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    };
    console.log("Shuffled Deck: ", deck);
    return deck;
};
const playerTurnAdversarialCheck = () => {
    console.log("Deciding whether or not to send in adversarial minigame");
    if (Math.random() < 1.0) {
        console.log("Decided to send in adversarial");
        adversarialAI().then((hitAgain) => {
            if (hitAgain) {
                hit(deckData);
            }
        }).catch((error) => {
            console.error(`Failed to handle action for adversarial AI: ${error}`);
        });
    } else {
        console.log("Decided not to send in adversarial");
    }
};
const updateTurns = () => {
    if(!gameActive) {
        console.log("Game is not active");
        return; 
    }
    console.log(`Turn before update: ${turn}`);
    turn = turn === "player" ? "challenger" : "player"; 
    console.log(`Turn after update: ${turn}`);
    if(turn === "player") {
        console.log("Player's turn");
        playerTurnAdversarialCheck();
    } else if(turn === "challenger") { 
        console.log("Challenger's turn");
        challengerTurn(); 
    } 
    console.log(`Final turn: ${turn}`);
};
function hit() {
    return new Promise((resolve, reject) => {
        try {
            console.log(`[${turn}] [attempt hit]`);
            if (!gameActive || deckCenterStack.length === 0) throw new Error("Cannot hit: Game not active or deck is empty");
            const newCard = deckCenterStack.pop();
            const newCardData = deckData[deckCenterStack.length];
            let challenger = sessionStorage.getItem('challenger');
            newCard.style.backgroundImage = `url(${newCardData.url})`;
            updateScore(newCardData.value, turn === "player");
            if (turn === "player") {
                playerCards.push(newCard);
                playerCardCount++;
                playerCardPositions = generateFanOutPositions(playerCards.length);
                console.log(`[Player] [hit]`);
            } else {
                challengerCards.push(newCard);
                challengerCardCount++;
                challengerCardPositions = generateFanOutPositions(challengerCards.length);
                console.log(`[${challenger}] [hit]`);
            }
            fanOutCards();
            let playerScore = parseInt(document.querySelector("#player-score").textContent);
            if (turn === "player" && playerScore > 21) {
                console.log(`[${turn}] [forced stand]`);
                stand().then(resolve);  // Wait for the stand promise to resolve before resolving this promise
            } else {
                updateTurns();
                resolve();
            }
        } catch (err) {
            console.error(`Failed to hit: ${err}`);
            reject(err);
        }
    });
}
function stand() {
    return new Promise((resolve, reject) => {
        try {
            if (!gameActive) throw new Error("Cannot stand: Game not active");
            if (turn === "player") {
                playerStand = true;
                turn = "challenger";
                console.log(`[${challenger}] [stand]`);
            } else if (turn === "challenger") {
                challengerStand = true;
                turn = "player";
                console.log(`[Player] [stand]`);
                updateTurns();
                resolve();
            }
            if (playerStand && challengerStand) {
                gameEnd();
            } else if(turn === "challenger") {
                challengerTurn().then(resolve);  // Wait for the challengerTurn promise to resolve before resolving this promise
            } else {
                resolve();
            }
        } catch (err) {
            console.error(`Failed to stand: ${err}`);
            reject(err);
        }
    });
}
async function challengerTurn(round, bestOf, playerWins, challengerWins) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!gameActive || turn !== "challenger" || aiActionPending) {
                console.log(`[challengerTurn] [action pending or game not active, skipping turn]`);
                return resolve();
            }
            const scoreElement = document.querySelector("#challenger-score");
            if (!scoreElement) {
                throw new Error('エラーが発生しました: チャレンジャーのスコア要素が見つかりませんでした (Error occurred: Challenger\'s score element not found)');
            }
            let score = parseInt(scoreElement.textContent);
            let challenger = sessionStorage.getItem('challenger');
            if (!challenger) {
                throw new Error('エラーが発生しました: チャレンジャーがsessionStorageに見つかりませんでした (Error occurred: Challenger not found in sessionStorage)');
            }
            const aiFunction = challengerAIs[challenger];
            if (!aiFunction) {
                throw new Error(`エラーが発生しました: ${challenger}に対応するAI関数が見つかりませんでした (Error occurred: No AI function found for ${challenger})`);
            }
            console.log(`[${challenger}] [start turn] Score: ${score}`);
            aiActionPending = true;
            setTimeout(async () => {
                let action;
                try {
                    action = await Promise.race([
                        aiFunction(score, round, bestOf, playerWins, challengerWins),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('AI decision timeout')), 60000))
                    ]);
                } catch (error) {
                    console.log(`[challengerTurn] [${challenger}] AI decision timeout, falling back to default AI`);
                    action = score < 17 ? 'hit' : 'stand';  // Fallback AI
                }
                console.log(`[${challenger}] [action]: ${action}`);
                aiActionPending = false;
                if (action === 'hit') {
                    // Check if it's the player's turn
                    if (Math.random() < 0.5 && turn === 'player') {
                        // Launch the adversarial AI
                        adversarialAI().then((hitAgain) => {
                            // If the player failed to suppress the impulse, they hit again
                            if (hitAgain) {
                                hit(deckData).then(resolve).catch(reject);
                            } else {
                                resolve();
                            }
                        }).catch(reject);
                    } else {
                        hit(deckData).then(resolve).catch(reject);
                    }
                } else if (action === 'stand') {
                    stand().then(resolve).catch(reject);
                } else {
                    throw new Error(`Invalid action: ${action}`);
                }
            }, 1000);
        } catch (err) {
            console.error(`Failed to handle action for Challenger: ${err}`);
            aiActionPending = false;
            reject(err);
        }
    });
}

function simulateClick(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.click();
        console.log(`Button with id ${buttonId} clicked`);
    } else {
        console.log(`Button with id ${buttonId} does not exist`);
    }
}
function stopGame() {
    let challenger = sessionStorage.getItem('challenger');
    const keyMappings = {
        'debug': { win: 'A001', loss: 'A002' },
    };
    if (playerWins > challengerWins) {
        console.log(`Player has won against ${challenger}`);
        sessionStorage.setItem(keyMappings[challenger].win, 'true');
        console.log(`Key '${keyMappings[challenger].win}' set to true`);
        unlockAndClickButton(keyMappings[challenger].win);
    } else {
        console.log(`Player has lost against ${challenger}`);
        sessionStorage.setItem(keyMappings[challenger].loss, 'true');
        console.log(`Key '${keyMappings[challenger].loss}' set to true`);
        unlockAndClickButton(keyMappings[challenger].loss);
    }
    if (gameEndTimeout !== null) {
        clearTimeout(gameEndTimeout);
        console.log('Game end timeout cleared');
    }
    simulateClick('stopButton');
    opponentButtonClicked = false;
    playerWins = 0;
    challengerWins = 0;
    gameActive = false;
    gameStopped = true;
    console.log('Game stopped');
    rounds = 0; // Reset the rounds count
}
function unlockAndClickButton(key) {
    let button = document.getElementById(key);
    if (button) {
        button.classList.remove('hidden');
        console.log(`Button '${key}' has been unlocked`);
        button.click();
        console.log(`Button '${key}' has been clicked`);
    } else {
        console.error(`Button '${key}' not found`);
    }
}
const waitForOpponentButtonClick = () => {
    return new Promise((resolve) => {
        let checkInterval = setInterval(() => {
            if (opponentButtonClicked) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 1000);  // Check every second
    });
};
const startGame = async () => {
    console.log('startGame running...');
    gameStopped = false;
    await waitForOpponentButtonClick();
    let challenger = sessionStorage.getItem('challenger');
    if (challenger == null) {
        console.log('Challenger not set, game not starting');
        return;
    }
    if (sessionStorage.getItem('cutActive') === 'true') {
        console.log('Cutscene active, waiting to start game...');
        let cutActiveCheckInterval = setInterval(() => {
            if (sessionStorage.getItem('cutActive') === 'false') {
                console.log('Cutscene ended, starting game...');
                clearInterval(cutActiveCheckInterval);
                beginGame(challenger);
            }
        }, 1000);  // Check every second
    } else {beginGame(challenger);}
};
function beginGame(challenger) {
    console.log(`Starting game with ${challenger}...`);
    gameActive = true; 
    turn = "player"; 
    deckData = shuffleDeck(deckData); 
    setCardImagesAndScores(); 
    playerCardPositions = generateFanOutPositions(playerCards.length); 
    challengerCardPositions = generateFanOutPositions(challengerCards.length); 
    fanOutCards();
    playerTurnAdversarialCheck();
}
async function restartGame() {
    console.log('Restarting game...');
    let gameEndDiv = document.getElementById('gameEnd');
    gameEndDiv.style.animation = '';
    gameEndDiv.style.visibility = 'hidden';
    gameActive = false;
    playerStand = false;
    challengerStand = false;
    turn = "player";
    deckCenterStack = [];
    playerCards = [];
    challengerCards = [];
    playerCardCount = 2;
    challengerCardCount = 2;
    playerCardPositions = [];
    challengerCardPositions = [];
    document.querySelector("#player-score").textContent = "0";
    document.querySelector("#challenger-score").textContent = "0";
    const centerStack = document.querySelector('.center-stack');
    while (centerStack.firstChild) {
        centerStack.removeChild(centerStack.firstChild);
    }
    try {
        await createCards();
    } catch (err) {
        console.error(`Failed to create cards: ${err}`);
        return;
    }
    if(gameStopped) {
        console.log('Game was stopped, not restarting');
        gameStopped = false;
        return;
    }
    setButtonListeners();
    playerCardPositions = generateFanOutPositions(playerCards.length);
    challengerCardPositions = generateFanOutPositions(challengerCards.length);
    setTimeout(startGame, 5200);
    console.log('Game restart process completed.');
}

function createCards() {
    const centerStack = document.querySelector('.center-stack');
    for (let i = 1; i <= 52; i++) {
        let card = document.createElement('div');
        card.classList.add('card');
        card.id = `card-${i}`;
        centerStack.appendChild(card);
        deckCenterStack.push(card); // Add the card to the deck array
    }
}
function applyTransform(cards, positions, yMultiplier) {
    cards.forEach((card, i) => {
        let pos = positions[i];
        card.style.transform = `translate(${pos.x}px, ${yMultiplier * pos.y}px) rotate(${pos.rotate}deg)`;
    });
}
function fanOutCards() {
    applyTransform(playerCards, playerCardPositions, 1);
    applyTransform(challengerCards, challengerCardPositions, -1);
}
function setCardImagesAndScores() {
    try {
        const cards = deckData.slice(0, 4).map((card, index) => {
            let cardElement = deckCenterStack[index];
            cardElement.style.backgroundImage = `url(${card.url})`;

            // Adding onerror event to handle image loading failure
            cardElement.onerror = function () {
                cardElement.textContent = card.face; // Replace with face text
                cardElement.style.backgroundColor = "lightgray"; // Optional: Set a background color
            };

            if (index < 2) {
                challengerCards.push(cardElement);
                let score = parseInt(document.querySelector("#challenger-score").textContent);
                if (isNaN(score)) throw new Error("Invalid challenger score: NaN");
                score += card.value;
                document.querySelector("#challenger-score").textContent = score;
            } else {
                playerCards.push(cardElement);
                let score = parseInt(document.querySelector("#player-score").textContent);
                if (isNaN(score)) throw new Error("Invalid player score: NaN");
                score += card.value;
                document.querySelector("#player-score").textContent = score;
            }
            return card.value;
        });
        const [challengerScore1, challengerScore2, playerScore1, playerScore2] = cards;
    } catch (err) {
        console.error(`Error setting scores: ${err}`);
    }
}

function updateScore(value, isPlayer) {
    const scoreElement = document.querySelector(isPlayer ? "#player-score" : "#challenger-score");
    const score = parseInt(scoreElement.textContent) + value;
    scoreElement.textContent = score;
    console.log(`${isPlayer ? "Player" : "Challenger"} drew a card: ${value}`);
    console.log(`${isPlayer ? "Player's" : "Challenger's"} new score: ${score}`);
}
function gameEnd() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Ending game...');
            let playerScore = parseInt(document.querySelector("#player-score").textContent);
            let challengerScore = parseInt(document.querySelector("#challenger-score").textContent);
            let challenger = sessionStorage.getItem('challenger');
            let gameEndDiv = document.getElementById('gameEnd');
            let endStateP = document.getElementById('endState');
            let endRatioP = document.getElementById('endRatio');
            if (playerScore > 21 && challengerScore > 21) {
                console.log(`[Game] [tie]`);
                endStateP.textContent = "Tie!";
            } else if (playerScore > 21) {
                console.log(`[Player] [bust]`);
                endStateP.textContent = "Bust!";
                challengerWins += 1;
                rounds++; // Increment the rounds counter here
            } else if (challengerScore > 21) {
                console.log(`[${challenger}] [bust]`);
                endStateP.textContent = `Bust!`;
                playerWins += 1;
                rounds++; // And here
            } else if (playerScore === challengerScore) {
                console.log(`[Game] [tie]`);
                endStateP.textContent = "Tie!";
            } else if (playerScore > challengerScore) {
                console.log(`[Player] [win]`);
                endStateP.textContent = "Player won!";
                playerWins += 1;
                rounds++; // And here
            } else {
                console.log(`[${challenger}] [win]`);
                endStateP.textContent = `${challenger} won!`;
                challengerWins += 1;
                rounds++; // And here
            }
            console.log(`Round ${rounds} has started`); // Log the round number
            endRatioP.textContent = `${playerWins} : ${challengerWins}`;
            gameEndDiv.style.animation = 'zoomIn 2s forwards';
            gameEndDiv.style.visibility = 'visible';
            if (rounds === bestOf) {
                stopGame();
            }
            gameEndTimeout = setTimeout(() => {
                gameEndDiv.style.animation = 'zoomOut 2s forwards';
                const restartGameHandler = () => {

                    if (rounds < bestOf) {
                        gameEndDiv.style.visibility = 'hidden';
                        setTimeout(restartGame, 1000);
                    }
                    gameEndDiv.removeEventListener('animationend', restartGameHandler);
                    resolve();
                };                
                gameEndDiv.removeEventListener('animationend', restartGameHandler);
                gameEndDiv.addEventListener('animationend', restartGameHandler);
            }, 5000);
        } catch (err) {
            console.error(`Failed to end game: ${err}`);
            reject(err);
        }
    });
}
function setButtonListeners() {
    const buttons = {"hitButton": () => hit(deckData),"standButton": stand,};
    for (const id in buttons) {
        document.getElementById(id).addEventListener('click', function() {
            if (turn !== "player") return;
            buttons[id]();
        });
    }
}
document.querySelectorAll('.opponent-button').forEach((button) => {
    button.addEventListener('click', async () => {
        console.log('Opponent button clicked (対戦者のボタンがクリックされました - Taisen-sha no botan ga kurikku sa remashita)');
        opponentButtonClicked = true;
        console.log('Creating cards (カードを作成中 - Kādo o sakusei-chū)');
        createCards();
        console.log('Loading deck (デッキをロード中 - Dekki o rōdo-chū)');
        await loadDeck();
        console.log('Setting button listeners (ボタンリスナーを設定中 - Botan risunā o settei-chū)');
        setButtonListeners();
        console.log('Generating player card positions (プレイヤーカードの位置を生成中 - Pureiyā kādo no ichi o seisei-chū)');
        playerCardPositions = generateFanOutPositions(playerCardCount);
        console.log('Generating challenger card positions (チャレンジャーカードの位置を生成中 - Charenjā kādo no ichi o seisei-chū)');
        challengerCardPositions = generateFanOutPositions(challengerCardCount);
        console.log('Starting game (ゲームを開始中 - Gēmu o kaishi-chū)');
        startGame();
    });
});