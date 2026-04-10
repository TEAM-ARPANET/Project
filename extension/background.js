/**
 * Background script for the extension
 * 
 * @author Hunter Turner (A00488748)
 * @author Caleb Halverson (A00488146)
 * @author Jim Nguyen (A00488742)
 */

// GLOBAL CONSTANTS
//const SERVER_HOST = "http://localhost:6502";
const SERVER_HOST = "http://mapd.cs-smu.ca:6502";
//const SERVER_HOST = "https://mapd.cs-smu.ca:6503";

const AUTH_TOKEN = "PhZGiTzfSVEAduG50SgbVViPSdzd1qg9";

// Main backend function that fetches the image url from content.js and sends it
// to the server.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg?.type !== "ANALYZE") return;
    
    // Create async funtion for talking to the server and call it immediately
    (async () => {
        try {
            // Grab image url from content file
            const imgRes = await fetch(msg.url);
            if(!imgRes.ok) throw new Error(
                `Failed to fetch image: ${imgRes.status}`);

            // Get the blob fmro the file
            const blobRep = await imgRes.blob();
            
            // New form to put files
            const form = new FormData();

            // Put the image blob into the form
            form.append("image", blobRep, "image.jpg");
            
            // Send the 
            const serverResponse = await fetch(
                    SERVER_HOST+"/analyze", {
                method: "POST",
                body: form,
                headers: {
                    language: msg.lang,
                    detailed: msg.detailed,
                    auth_token: AUTH_TOKEN
                }
            });
            
            // Error handling
            if(!serverResponse.ok) {
                const txt = await serverResponse.text().catch(() => "");
                throw new Error(
                    `Server failed: ${serverResponse.status} ${txt}`);
            }
            
            // Get the json data response from the server
            const data = await serverResponse.json();
            
            // Send image description back to the content script
            sendResponse({
                ok: true,
                contents: data.contents || "(no description)"
            });
        } catch (err) {
            // Catch error and send it to the content script
            console.error(err);
            sendResponse({ok: false, error: String(err?.message || err) });
        }
    })();
    return true;
});
