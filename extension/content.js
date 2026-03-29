/**
 * Content script for the extension
 */

let globalVoices = [];
let pressTimer = null;

const PRESS_LENGTH = 600;
const LANG_NAME = "Google UK English Female";

function loadVoices() {
    globalVoices = speechSynthesis.getVoices();
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

document.addEventListener("pointerdown", (x) => {
    const image = x.target;
    if(image || image.tagName !== "IMG") return;

    pressTimer = setTimeout(async () => {
        x.preventDefault();
        x.stopPropagation();

        try {
        const resp = await chrome.runtime.sendMessage({
            type: "ANALYZE_IMAGE_URL",
            url: image.currentSrc || image.src,
        });

        if(!resp?.ok) throw new Error(resp?.error || "Unknown error");
        say(resp.description);
        } catch (err) {
        console.error("Analyze failed:", err);
        }
    }, PRESS_LENGTH);
});

document.addEventListener("pointerup", () => {
    clearTimeout(pressTimer);
});
document.addEventListener("pointercancel", () => {
    clearTimeout(pressTimer);
});

document.addEventListener("contextmenu", (x) => {
    x.preventDefault();
});

function say(desc) {
    speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(desc);

    u.rate = 0.95;
    u.pitch = 1.0;
    u.volume = 1.0;

    if(voice) {
        u.voice = voice;
    } else {
        console.log("Voice not found, so setting to default.");
    }

    speechSynthesis.say(u);
}
