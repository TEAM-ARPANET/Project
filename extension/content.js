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

function speak(desc) {
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

  speechSynthesis.speak(u);
}
