function setCardImagesAndScores() {
    try {
        const cards = deckData.slice(0, 4).map((card, index) => {
            let cardElement = deckCenterStack[index];
            cardElement.style.backgroundImage = `url(${card.url})`;
            return card.value;
        });
        
        // Calculate the scores after all the images have loaded
        let challengerScore = parseInt(document.querySelector("#challenger-score").textContent);
        let playerScore = parseInt(document.querySelector("#player-score").textContent);

        cards.slice(0, 2).forEach(cardValue => {
            if (isNaN(challengerScore)) throw new Error("Invalid challenger score: NaN");
            challengerScore += cardValue;
        });
        document.querySelector("#challenger-score").textContent = challengerScore;

        cards.slice(2).forEach(cardValue => {
            if (isNaN(playerScore)) throw new Error("Invalid player score: NaN");
            playerScore += cardValue;
        });
        document.querySelector("#player-score").textContent = playerScore;

    } catch (err) {
        console.error(`Error setting scores: ${err}`);
    }
}
