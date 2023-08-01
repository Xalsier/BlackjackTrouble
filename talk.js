// Initially, check if we have a stored challenger.
let challenger = sessionStorage.getItem('challenger') || null;
document.getElementById('debug-button').addEventListener('click', () => { 
    challenger = 'debug'; 
    sessionStorage.setItem('challenger', challenger); // Save to sessionStorage
    console.log(`Challenger set to ${challenger}`);
});

// The rest of your code...


document.getElementById('talkButton').addEventListener('click', () => {
    sessionStorage.setItem('talkEnd', 'false'); // Set talkEnd to 'false' at the start of a new conversation

    // Fetch the dialog data from talk.json
    fetch('talk.json') // Updated file path
        .then(response => response.json())
        .then(data => {
            // Get the player and challenger dialogs
            const playerDialogs = data['Player'][challenger]['dialogs'];
            const challengerDialogs = data['Challenger'][challenger]['dialogs'];

            // Function to get a random dialog ID
            const getRandomDialogId = (dialogs) => {
                return dialogs[Math.floor(Math.random() * dialogs.length)].id;
            };

            // Generate a random dialog ID for the player
            const playerDialogId = getRandomDialogId(playerDialogs);
            
            // Display the player dialog
            displayDialogs(playerDialogs, playerDialogId);

            // Find the challenger dialog with the same ID as the player's selected dialog
            const challengerDialog = challengerDialogs.find(dialog => dialog.id === playerDialogId);

            if (challengerDialog) {
                // Display the challenger dialog after a 2-second delay
                setTimeout(() => {
                    displayDialogs(challengerDialogs, playerDialogId);

                    sessionStorage.setItem('talkEnd', 'true'); // Set talkEnd to 'true' once the dialogs have finished displaying
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error fetching talk.json:', error);
        });
});

const displayDialogs = (dialogs, dialogId) => {
    const modalText = document.getElementById('modal-text');
    const modalImg = document.getElementById('modal-img');
    
    // Find the dialog with the specified ID
    const dialog = dialogs.find(dialog => dialog.id === dialogId);
    if (dialog) {
        modalText.innerText = dialog.text;
        modalImg.src = dialog.img; // Use the img property from the dialog object
        document.getElementById('text-modal').style.display = 'block';
        setTimeout(() => {
            document.getElementById('text-modal').style.display = 'none';
        }, 2000);
    }
};
