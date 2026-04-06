/**
 * Content script for the extension
 * 
 * @author Hunter Turner (A00488748)
 * @author Caleb Halverson (A00488146)
 * @author Jim nguyen (A00488742)
 */

let globalVoices = [];
let pressTimer = null;
let timerFired = false;

const PRESS_LENGTH = 1000;

/**
 * Loads all available voices into globalVoices
 */
function loadVoices() {
    globalVoices = speechSynthesis.getVoices();
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

document.addEventListener("pointerdown", (e) => {
    const image = e.target;
    if(image === null || image.tagName !== "IMG") return;
    
    timerFired = false;
    
    pressTimer = setTimeout(async () => {
        timerFired = true;
        
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const response = await chrome.runtime.sendMessage({
                type: "ANALYZE",
                url: image.currentSrc || image.src,
                lang: navigator.language
            });
            
            if(!response?.ok) throw new Error(response?.error || "Unknown error");
            say(response.contents);
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

document.addEventListener("contextmenu", (e) => {
    if (timerFired) {
        e.preventDefault();
    }
});

/**
 * Convert a string to speech and play it.
 * @param {string} phrase
 */
function say(phrase) {
    speechSynthesis.cancel();
    
    const speechObj = new SpeechSynthesisUtterance(phrase);
    
    speechObj.voice = globalVoices.find(x => x.lang===navigator.language);
    speechObj.rate = 0.95;
    speechObj.pitch = 1;
    speechObj.volume = 1;
    
    // Find nearest match if exact match doesn't work
    if (!speechObj.voice) {
        speechObj.voice = globalVoices.find(x => x.lang.substring(0, 2)===navigator.language.substring(0, 2));
    }
    
    if (!speechObj.voice) {
        console.log("Requested voice not found, using default.");
    }
    
    speechSynthesis.speak(speechObj);
}
