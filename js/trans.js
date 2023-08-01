let gameConditions;

fetch('../json/cond.json')
    .then(response => response.json())
    .then(data => {
        gameConditions = data;
    });

function fadeOutAndTransition(fromElement, toElement) {
    let fadeOutElement = document.getElementById('fade-out');
    fadeOutElement.classList.add('active');
    setTimeout(function() {
        fromElement.style.display = 'none';
        toElement.style.display = 'flex';
        fadeOutElement.classList.remove('active');
    }, 500);
}

function toggleBlackjackDiv() {
    const blackjackDiv = document.getElementById('blackjack-div');
    const opponentSelect = document.getElementById('opponent-select');
    fadeOutAndTransition(opponentSelect, blackjackDiv);
}

function toggleCheatsMenu() {
    const cheatsMenu = document.getElementById('cheats-menu');
    const mainMenu = document.getElementById('main-menu');
    fadeOutAndTransition(mainMenu, cheatsMenu);
}

function toggleAchievementsMenu() {
    const achievementsMenu = document.getElementById('achievements-menu');
    const mainMenu = document.getElementById('main-menu');
    fadeOutAndTransition(mainMenu, achievementsMenu);
}

function toggleCutsceneReplayMenu() {
    const cutsceneReplay = document.getElementById('cutscene-replay');
    const mainMenu = document.getElementById('main-menu');
    fadeOutAndTransition(mainMenu, cutsceneReplay);
}

function returnToMainMenu(fromElement) {
    const mainMenu = document.getElementById('main-menu');
    fadeOutAndTransition(fromElement, mainMenu);
}

document.getElementById('stopButton').addEventListener('click', function() {
    setTimeout(function() {
        const blackjackDiv = document.getElementById('blackjack-div');
        const mainMenu = document.getElementById('main-menu');
        fadeOutAndTransition(blackjackDiv, mainMenu);
    }, 6000); // Wait for 6 seconds before transitioning
});


// Event listener for cutscene replay menu
document.getElementById("cutscenes-button").addEventListener('click', toggleCutsceneReplayMenu);


// Event listener for "Challenge Debug" button
document.getElementById("debug-button").addEventListener('click', toggleBlackjackDiv);

// Event listener for return button in cutscene replay menu
document.getElementById("cutscene-replay-return-button").addEventListener('click', () => returnToMainMenu(document.getElementById('cutscene-replay')));
