

document.querySelectorAll('.menu-button')[0].addEventListener('click', function() {
    const opponentSelect = document.getElementById('opponent-select');
    fadeOutAndTransition(document.getElementById('main-menu'), opponentSelect);
});

document.getElementById('opponent-return-button').addEventListener('click', function() {
    returnToMainMenu(document.getElementById('opponent-select'));
});

document.getElementById('cheats-button').addEventListener('click', toggleCheatsMenu);

document.getElementById('return-button').addEventListener('click', function() {
    returnToMainMenu(document.getElementById('cheats-menu'));
});

document.getElementById('unlock-all-cutscenes').addEventListener('change', function() {
    const isUnlocked = this.checked;
    console.log(`Unlock all cutscenes toggled: ${isUnlocked}`);
    // Show or hide cutscene buttons A001 through A012
    for (let i = 1; i <= 12; i++) {
        let cutsceneId = `A${String(i).padStart(3, '0')}`; // pad with zeros to get A001, A002, etc.
        document.getElementById(cutsceneId).classList.toggle('hidden', !isUnlocked);
    }
});


document.getElementById('achievements-button').addEventListener('click', toggleAchievementsMenu);

document.getElementById('achievements-return-button').addEventListener('click', function() {
    returnToMainMenu(document.getElementById('achievements-menu'));
});

document.getElementById('unlock-debug-mode').addEventListener('change', function() {
    const debugButton = document.getElementById('debug-button');
    const debugCutsceneButton = document.getElementById('A009');
    
    if (this.checked) {
        debugButton.classList.remove('hidden');
        debugCutsceneButton.classList.remove('hidden');
        console.log('Debug mode unlocked');
    } else {
        debugButton.classList.add('hidden');
        debugCutsceneButton.classList.add('hidden');
        console.log('Debug mode locked');
    }
});