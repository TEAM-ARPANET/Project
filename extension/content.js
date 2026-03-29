/**
 * Content script for the extension
 */

let globalVoices = [];
let pressTimer = null;
let timerFired = true;

const PRESS_LENGTH = 1000;
const LANG_NAME = "Google UK English Female";

function loadVoices() {
    globalVoices = speechSynthesis.getVoices();
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

document.addEventListener("pointerdown", (x) => {
    const image = x.target;
    if(image === null || image.tagName !== "IMG") return;
    
    timerFired = false;
    
    pressTimer = setTimeout(async () => {
        timerFired = true;
        
        x.preventDefault();
        x.stopPropagation();
        
        try {
            const resp = await chrome.runtime.sendMessage({
                type: "ANALYZE",
                url: image.currentSrc || image.src
            });
            
            if(!resp?.ok) throw new Error(resp?.error || "Unknown error");
            say(resp.contents);
        } catch (err) {
            console.error("Analyze failed:", err);
        }
    }, PRESS_LENGTH);
});

document.addEventListener("pointerup", (e) => {
    if (timerFired) {
        // Add temporary event listener to stop the event from clicking
        e.target.addEventListener("click", (e) => e.preventDefault(), {once: true});
        timerFired = false;
    }
    clearTimeout(pressTimer);
});

document.addEventListener("pointercancel", () => {
    timerFired = false;
    clearTimeout(pressTimer);
});

document.addEventListener("contextmenu", (x) => {
    x.preventDefault();
});

/**
 * Convert a string to speech and play it.
 * @param {string} phrase
 */
function say(phrase) {
    speechSynthesis.cancel();
    
    const speechObj = new SpeechSynthesisUtterance(phrase);
    
    speechObj.voice = globalVoices.find(x => x.name===LANG_NAME);
    speechObj.rate = 0.95;
    speechObj.pitch = 1;
    speechObj.volume = 1;
    
    if (!speechObj.voice) {
        console.log("Requested voice not found, using default.");
    }
    
    speechSynthesis.speak(speechObj);
}
