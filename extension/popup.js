// Retrieve saved press length settings (in milliseconds) from Chrome storage
// and update the UI inputs/sliders and displayed values (converted to seconds)
chrome.storage.sync.get(['shortLength', 'longLength'], (result) => {
    if (result.shortLength) {
        const shortSec = result.shortLength / 1000;
        document.getElementById('short-press-lengths').value = shortSec;
        document.getElementById('short-press-value').textContent = shortSec +
            's';
    }
    if (result.longLength) {
        const longSec = result.longLength / 1000;
        document.getElementById('long-press-lengths').value = longSec;
        document.getElementById('long-press-value').textContent = longSec + 's';
    }
});

// Update displayed short press time dynamically as the user adjusts the input
document.getElementById('short-press-lengths').addEventListener('input',
        function () {
    document.getElementById('short-press-value').textContent = this.value + 's';
    saveSettings();
});
// Update displayed long press time dynamically as the user adjusts the input
document.getElementById('long-press-lengths').addEventListener('input', 
        function () {
    document.getElementById('long-press-value').textContent = this.value + 's';
    saveSettings();
});

// Add click event to the "Help" button to speak instructions using current
// values
document.getElementById('help-btn').addEventListener('click', () => {
    const short = document.getElementById('short-press-lengths').value;
    const long = document.getElementById('long-press-lengths').value;
    // Speak guidance to the user about how long to hold for each description
    // type
    say("Hold an image for " + short + " seconds for a short description, or " + 
        long + " seconds for a detailed description.");
});

// Save the current settings (converted to milliseconds) into Chrome storage
function saveSettings() {
    const settings = {
        shortLength: Math.round(parseFloat(
            document.getElementById('short-press-lengths').value) * 1000),
        longLength: Math.round(parseFloat(
            document.getElementById('long-press-lengths').value) * 1000),
    };
    // Store settings and provide visual feedback to the user
    chrome.storage.sync.set(settings, () => {
        const btn = document.querySelector('.save-btn');
        btn.textContent = 'Saved!';
        setTimeout(() => btn.textContent = 'Save settings', 1500);
    });
}

/**
 * Convert a string to speech and play it.
 * @param {string} phrase
 */
function say(phrase) {
    // Cancel any current phrases before speaking a new phrase
    speechSynthesis.cancel();

    const speechObj = new SpeechSynthesisUtterance(phrase);

    // Set voice's parameters for when it plays
    speechObj.voice = globalVoices.find(x => x.lang === navigator.language);
    speechObj.rate = 0.95;
    speechObj.pitch = 1;
    speechObj.volume = 1;

    // Find nearest match if exact match doesn't work
    if (!speechObj.voice) {
        speechObj.voice = globalVoices.find(x =>
            x.lang.substring(0, 2) === navigator.language.substring(0, 2)
        );
    }

    if (!speechObj.voice) {
        console.log("Requested voice not found, using default.");
    }

    speechSynthesis.speak(speechObj);
}

/**
 * Load all available voices into globalVoices
 */
function loadVoices() {
    globalVoices = speechSynthesis.getVoices();
}

// Trigger load voices in case the voices were loaded before setting the event
// listener
loadVoices();
