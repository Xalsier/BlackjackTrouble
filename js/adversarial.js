export default function adversarialAI() {
    return new Promise((resolve, reject) => {
        try {
            const challengerDistractionTextMap = {
                'debug': ['デバッグ', 'エラー', '修正'],
                'default': ['不明な', '???', '!!!']
            }

            let challenger = sessionStorage.getItem('challenger');
            let distractionTexts = challengerDistractionTextMap[challenger] || challengerDistractionTextMap['default'];

            let modal = document.createElement('div');
            modal.id = 'adversarial-modal';
            modal.style.overflow = 'hidden'; // Add this line to hide overflow
            document.body.appendChild(modal);

            let focusText = document.createElement('p');
            focusText.textContent = "Focus.";
            modal.appendChild(focusText);

            let instructionText = document.createElement('p');
            instructionText.textContent = "Tap to ignore distractions.";
            modal.appendChild(instructionText);

            let progressBarContainer = document.createElement('div');
            progressBarContainer.id = 'progress-bar-container';
            modal.appendChild(progressBarContainer);

            let progressBar = document.createElement('div');
            progressBar.id = 'adversarial-progress-bar';
            progressBarContainer.appendChild(progressBar);

            let afterImageBar = document.createElement('div');
            afterImageBar.id = 'after-image-bar';
            progressBarContainer.appendChild(afterImageBar);

            let spacebar = document.createElement('div');
            spacebar.id = 'spacebar';
            modal.appendChild(spacebar);

            let progress = 50;
            progressBar.style.width = `${progress}%`;

            function setUpDistractionAnimation(distraction) {
                let angle = Math.random() * 2 * Math.PI;
                let endX = 100 * Math.cos(angle);
                let endY = 100 * Math.sin(angle);
                distraction.style.setProperty('--x', `${endX}vw`);
                distraction.style.setProperty('--y', `${endY}vh`);
                distraction.style.animation = `fly 5s linear infinite`;
            }

            for (let i = 0; i < 10; i++) {
                let distraction = document.createElement('p');
                distraction.textContent = distractionTexts[Math.floor(Math.random() * distractionTexts.length)];
                distraction.style.position = 'absolute';
                distraction.style.left = '50%';
                distraction.style.top = '50%';
                distraction.style.color = 'white';
                distraction.style.opacity = progress / 100;
                distraction.style.transform = 'translate(-50%, -50%)';
                distraction.addEventListener('animationiteration', () => {
                    distraction.style.left = '50%';
                    distraction.style.top = '50%';
                    distraction.style.animation = '';
                    setUpDistractionAnimation(distraction);
                });
                setUpDistractionAnimation(distraction);
                modal.appendChild(distraction);
            }

            const PROGRESS_INCREASE = 7;
            const PROGRESS_INTERVAL_MS = 600;
            const CLICK_REDUCTION = 5;

            let progressIncrease = setInterval(() => {
                progress += PROGRESS_INCREASE;
                progressBar.style.width = `${progress}%`;
                afterImageBar.style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(progressIncrease);
                    document.removeEventListener('click', clickListener);
                    document.body.removeChild(modal);
                    resolve(true);
                }
            }, PROGRESS_INTERVAL_MS);

            let clickListener = () => {
                progress -= CLICK_REDUCTION;
                progressBar.style.width = `${progress}%`;
                if (progress <= 0) {
                    clearInterval(progressIncrease);
                    document.removeEventListener('click', clickListener);
                    if (modal.parentNode) {
                        document.body.removeChild(modal);
                    }
                    resolve(false);
                }
                spacebar.style.transform = 'translateY(3px)'; // Move the spacebar down
                spacebar.style.backgroundColor = 'lightgray';  // Change the color
                setTimeout(() => {
                    spacebar.style.transform = 'none';         // Move the spacebar back up
                    spacebar.style.backgroundColor = '';       // Reset the color
                }, 200);
            };
            document.addEventListener('click', clickListener);
        } catch (エラー) { // Error
            console.error('エラー発生 (An error occurred) in the adversarialAI function: ', エラー);
            reject(エラー);
        }
    });
}