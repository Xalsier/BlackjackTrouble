function debugAI(challengerScore, playerStand, round, bestOf, playerWins, challengerWins) {
    console.log('処理を開始します... (Starting process...)');
    const randomFloat = Math.random();
    const talkChance = 0.5;
    const thinkingDelay = 5000;
    const checkIntervalDelay = 1000;
    console.log(`Random float: ${randomFloat}`);
    let checkInterval;
    const startInterval = (resolve, reject) => {
        if (!sessionStorage) {
            console.error('エラーが発生しました: sessionStorageは利用できません (Error occurred: sessionStorage is not available)');
            reject(new Error('sessionStorageは利用できません (sessionStorage is not available)'));
            return;
        }
        checkInterval = setInterval(() => {
            if (sessionStorage.getItem('talkEnd') === 'true') {
                clearInterval(checkInterval);
                let playerScore;
                try {
                    const playerScoreElement = document.querySelector("#player-score");
                    if (!playerScoreElement) {
                        throw new Error('プレーヤーのスコア要素が見つかりませんでした (Player\'s score element not found)');
                    }
                    playerScore = parseInt(playerScoreElement.textContent);
                    if (isNaN(playerScore)) {
                        throw new Error('プレーヤーのスコアが数値ではありません (Player\'s score is not a number)');
                    }
                    console.log('考えています... プレーヤーのスコアは何ですか？ (Thinking... What\'s the player\'s score?)');
                    setTimeout(() => {
                        console.log(`Thinking... The player's score is ${playerScore}.`);
                        if (playerStand && playerScore <= 17) {
                            console.log('Thinking... The player has already stood and their score is 17 or less. I should stand to secure the win.');
                            resolve('stand');
                        } else if (round === bestOf - 1) {
                            if (challengerWins > playerWins) {
                                console.log('Thinking... I can win or lose this. I\'ll still win. I should stand.');
                                resolve('stand');
                            } else if (challengerScore > 21) {
                                console.log('Thinking... I busted... I should stand.');
                                resolve('stand');
                            } else {
                                console.log('Thinking... My score is less than 17. Deciding to hit.');
                                resolve('hit');
                            }
                        } else {
                            if (playerScore > 21) {
                                console.log('Thinking... The player is about to bust. I should stand.');
                                resolve('stand');
                            } else if (challengerScore > 21) {
                                console.log('Thinking... I busted... I should stand.');
                                resolve('stand');
                            } else {
                                const riskFloat = Math.random();
                                if (challengerScore < 17 || (challengerScore <= 19 && playerScore > 19) || riskFloat < 0.4) {
                                    console.log('Thinking... My score is low or the player has an edge or I\'m feeling lucky. Deciding to hit.');
                                    resolve('hit');
                                } else {
                                    console.log('Thinking... My score is decent and the player doesn\'t have a big edge and I\'m not feeling lucky. Deciding to stand.');
                                    resolve('stand');
                                }
                            }
                        }
                    }, thinkingDelay);
                } catch (error) {
                    console.error('エラーが発生しました: ', error);
                    reject(error);
                }
            }
        }, checkIntervalDelay);
    };
    if (randomFloat < talkChance) {
        console.log('会話を開始します (Starting conversation)');
        const talkButton = document.getElementById('talkButton');
        if (!talkButton) {
            console.error('エラーが発生しました: トークボタンが見つかりませんでした (Error occurred: Talk button not found)');
            return;
        }
        talkButton.click();
    } else {
        console.log('会話を開始しません (Not starting conversation)');
    }
    console.log(`チャレンジャーのスコア: ${challengerScore} (Challenger score: ${challengerScore})`);
    return new Promise((resolve, reject) => {
        if (randomFloat < talkChance) {
            startInterval(resolve, reject);
            setTimeout(() => {
                if (sessionStorage.getItem('talkEnd') !== 'true') {
                    console.warn('警告: 会話が長すぎます。チェックインターバルをクリアします (Warning: Conversation is too long. Clearing check interval)');
                    clearInterval(checkInterval);
                    reject(new Error('会話が長すぎます (Conversation is too long)'));
                }
            }, 30000);  // Wait for 30 seconds for the conversation to end before clearing the interval and rejecting the promise
        } else {
            resolve(challengerScore < 17 ? 'hit' : 'stand');
        }
    });
}