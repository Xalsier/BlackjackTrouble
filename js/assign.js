let currentChallenger = sessionStorage.getItem('challenger');

document.addEventListener('DOMContentLoaded', function() {
    updateChallengerData();
});

setInterval(function() {
    const newChallenger = sessionStorage.getItem('challenger');
    if (newChallenger !== currentChallenger) {
        currentChallenger = newChallenger;
        updateChallengerData();
    }
}, 1000); // Check every second

function updateChallengerData() {
    // If there is no challenger, stop execution
    if (!currentChallenger) return;

    // Fetch the data from assign.json
    fetch('./json/assign.json')
        .then(response => response.json())
        .then(data => {
            const challengerData = data[currentChallenger];

            // If there's no data for the current challenger, stop execution
            if (!challengerData) return;

            // Iterate over all updates
            for (let elementId in challengerData.updates) {
                // Get the element to update
                const element = document.getElementById(elementId);

                // If the element does not exist, skip this update
                if (!element) continue;

                // Get the property to update and the new value
                const { property, value } = challengerData.updates[elementId];

                // Update the property
                element[property] = value;
            }
        })
        .catch(error => {
            console.error('Error fetching assign.json:', error);
        });
}
