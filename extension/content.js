/**
 * Content script for the extension
 * 
 * @author Hunter Turner (A00488748)
 * @author Caleb Halverson (A00488146)
 * @author Jim Nguyen (A00488742)
 */

// GLOBAL CONSTANTS
const SHORT_LENGTH = 900;
const LONG_LENGTH = 2300;

// GLOBAL VARIABLES
let globalVoices = [];
let shortTimer = null;
let longTimer = null;
let shortTimerFired = false;
let longTimerFired = false;

let targetImage = null;

//------------------------------------------------------------------------------
// Script functions

/**
 * Load all available voices into globalVoices
 */
function loadVoices() {
    globalVoices = speechSynthesis.getVoices();
}

/**
 * Ananlyze the current target image. Grabs the url to the image and sends it to
 * the background script.
 */
async function analyzeImage(detailed) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: "ANALYZE",
            url: targetImage.currentSrc || targetImage.src,
            lang: navigator.language,
            detailed: detailed
        });
        
        if(!response?.ok) throw new Error(response?.error ||
            "Unknown error");
        say(response.contents);
    } catch (err) {
        console.error("Analyze failed:", err);
    }
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
    speechObj.voice = globalVoices.find(x => x.lang===navigator.language);
    speechObj.rate = 0.95;
    speechObj.pitch = 1;
    speechObj.volume = 1;
    
    // Find nearest match if exact match doesn't work
    if (!speechObj.voice) {
        speechObj.voice = globalVoices.find(x => 
            x.lang.substring(0, 2)===navigator.language.substring(0, 2)
        );
    }
    
    if (!speechObj.voice) {
        console.log("Requested voice not found, using default.");
    }
    
    speechSynthesis.speak(speechObj);
}

//------------------------------------------------------------------------------
// Event listeners for different pointer actions

document.addEventListener("pointerdown", (e) => {
    // If not a left click, ignore
    if(e.button !== 0){
        return;
    }
    
    targetImage = e.target;
    
    // If the target is not an image, find the image the mouse is hovering over
    if(targetImage === null || targetImage.tagName !== "IMG") {
        
        let mousex = e.clientX;
        let mousey = e.clientY;
        targetImage = null;

        // elemArray is the array of all elements currently on the page
        let elemArray = document.getElementsByTagName("*");
        let arrLength = elemArray.length;

        for (let i = 0; i < arrLength; i++) {
            // If the array element is an image then compare distances
            if(elemArray[i].tagName === "IMG"){

                // Get the x and y for the current element
                let compCoords = elemArray[i].getBoundingClientRect();

                if(mousex > compCoords.left &&
                        mousex < compCoords.right &&
                        mousey > compCoords.top &&
                        mousey < compCoords.bottom){
                    targetImage = elemArray[i];
                    break;
                }
            }
        }
        
        // If no image was found, return
        if (targetImage === null) {
            return;
        }
    }
    
    timerFired = false;
    
    // Setup the short timer
    shortTimer = setTimeout(async () => {
        shortTimerFired = true;
        
        say("Short");
        e.preventDefault();
        e.stopPropagation();
        
        console.log("Short");
    }, SHORT_LENGTH);
    
    // Setup the long timer
    longTimer = setTimeout(async () => {
        longTimerFired = true;
        say("Long")
        
        e.preventDefault();
        e.stopPropagation();
        
        console.log("Long");
    }, LONG_LENGTH);
});

document.addEventListener("pointerup", (e) => {
    // Stop the timers right away, this is so the short/long "fired" variables
    // do not change while waiting for a response from the server
    clearTimeout(shortTimer);
    clearTimeout(longTimer);
    
    if (shortTimerFired) {
        // Add temporary event listener to stop the event from clicking
        e.target.addEventListener("click", (e) => 
            e.preventDefault(), {once: true}
        );
        
        // Analyze the image, detailed will be set to true if the long timer
        // also fired
        analyzeImage(longTimerFired);
    }
    
    // Clear the "fired" variables
    shortTimerFired = false;
    longTimerFired = false;
});

document.addEventListener("pointercancel", () => {
    clearTimeout(shortTimer);
    clearTimeout(longTimer);
    shortTimerFired = false;
    longTimerFired = false;
});

//------------------------------------------------------------------------------
// Event listener to remove context menu from popping up from a long click

document.addEventListener("contextmenu", (e) => {
    if (shortTimerFired) {
        e.preventDefault();
    }
});

// Event listener that immediately activates when globalVoices variable is ready
speechSynthesis.onvoiceschanged = loadVoices;

//------------------------------------------------------------------------------
// Setup code

// Trigger load voices in case the voices were loaded before setting the event
// listener
loadVoices();
