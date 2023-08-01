class CutsceneController {
    static MODAL_IMG_ID = "modal-img";
    static MODAL_TEXT_ID = "modal-text";
    static TEXT_MODAL_ID = "text-modal";
    static CONTINUE_BUTTON_ID = "continue-button";
    static CUTSCENE_DIV_ID = "cutscene-div";
    static SKIP_BUTTON_ID = "skip-button";
    static BACK_BUTTON_ID = "back-button";
    constructor() {
        this.originalCutsceneData = null;
        this.cutsceneData = null;
        this.conditionsData = null;
        this.currentDialogIndex = 0;
        this.typingInterval = null;
    }
    async initCutscene() {
        try {
            let response = await fetch('./json/cut.json');
            this.originalCutsceneData = await response.json();
            let condResponse = await fetch('./json/cut_var.json');
            this.conditionsData = await condResponse.json();
        } catch(error) {
            console.error("Failed to initialize cutscene:", error);
        }
    }
    handleCutscene(event) {
        const buttonId = event.target.id;
        for (const condition of this.conditionsData) {
            if (condition.variables.includes(buttonId)) {
                this.currentDialogIndex = 0;
                this.cutsceneData = this.originalCutsceneData[condition.cutscene];
                this.updateCutscene();
                document.getElementById(CutsceneController.CUTSCENE_DIV_ID).style.display = "block";
                sessionStorage.setItem('cutActive', 'true'); // Cutscene active
                console.log('Cutscene started');
                break;
            }
        }
    }
    updateCutscene() {
        const cutsceneDialog = this.cutsceneData[this.currentDialogIndex];
        const modalImg = document.getElementById(CutsceneController.MODAL_IMG_ID);
        const modalText = document.getElementById(CutsceneController.MODAL_TEXT_ID);
        const textModal = document.getElementById(CutsceneController.TEXT_MODAL_ID);
        const continueButton = document.getElementById(CutsceneController.CONTINUE_BUTTON_ID);
        if(this.typingInterval) {
            clearInterval(this.typingInterval);
        }
        modalImg.src = cutsceneDialog.img;
        modalText.textContent = '';
        textModal.style.display = "block";
        continueButton.disabled = true;
        this.animateTyping(cutsceneDialog.text, modalText, continueButton);
        if (cutsceneDialog.bg) {
            document.getElementById(CutsceneController.CUTSCENE_DIV_ID).style.backgroundImage = `url(${cutsceneDialog.bg})`;
        }
    }
    animateTyping(text, modalText, continueButton) {
        const typingDelay = 25;
        let typingIndex = 0;
        this.typingInterval = setInterval(() => {
            modalText.textContent += text[typingIndex];
            typingIndex++;
            if (typingIndex >= text.length) {
                clearInterval(this.typingInterval);
                continueButton.disabled = false;
            }
        }, typingDelay);
    }
    nextDialog() {
        this.currentDialogIndex++;
        if (this.currentDialogIndex < this.cutsceneData.length) {
            this.updateCutscene();
        } else {
            this.skipCutscene();
        }
    }
    prevDialog() {
        if (this.currentDialogIndex > 0) {
            this.currentDialogIndex--;
            this.updateCutscene();
        }
    }
    skipCutscene() {
        document.getElementById(CutsceneController.CUTSCENE_DIV_ID).style.display = "none";
        document.getElementById(CutsceneController.TEXT_MODAL_ID).style.display = "none";
        document.getElementById(CutsceneController.CUTSCENE_DIV_ID).style.backgroundImage = '';
        this.currentDialogIndex = 0;
        sessionStorage.setItem('cutActive', 'false'); // Cutscene ended
        console.log('Cutscene ended');
    }
}

document.addEventListener('DOMContentLoaded', async (event) => {
    const controller = new CutsceneController();
    await controller.initCutscene();
    for (const condition of controller.conditionsData) {
        for (const variable of condition.variables) {
            const buttonElement = document.getElementById(variable);
            if (buttonElement) {
                buttonElement.addEventListener('click', controller.handleCutscene.bind(controller));
            } else {
                console.log(`Button with ID ${variable} does not exist.`);
            }
        }
    }
    document.getElementById(CutsceneController.CONTINUE_BUTTON_ID).addEventListener('click', controller.nextDialog.bind(controller));
    document.getElementById(CutsceneController.SKIP_BUTTON_ID).addEventListener('click', controller.skipCutscene.bind(controller));
    document.getElementById(CutsceneController.BACK_BUTTON_ID).addEventListener('click', controller.prevDialog.bind(controller));
});