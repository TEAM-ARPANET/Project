/**
 * Background script for the extension
 * 
 * @author Hunter Turner (A00488748)
 * @author Caleb Halverson (A00488146)
 * @author Jim Nguyen (A00488742)
 */

//main backend function that fetches the image url from content.js and sends it
//to the server
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg?.type !== "ANALYZE") return;
    
    (async () => {
        try {
            //grab image url from content file
            const imgRes = await fetch(msg.url);
            if(!imgRes.ok) throw new Error(
                `Failed to fetch image: ${imgRes.status}`);

            //constants for changing file to blob type
            const blobRep = await imgRes.blob();
            const form = new FormData();

            //change image file to blob
            form.append("image", blobRep, "image.jpg");
            const serverResponse = await fetch(
                    "http://map.cs-smu.ca:6502/analyze", {
                method: "POST",
                body: form,
                headers: {
                    language: msg.lang
                }
            });
            
            if(!serverResponse.ok) {
                const txt = await serverResponse.text().catch(() => "");
                throw new Error(
                    `Server failed: ${serverResponse.status} ${txt}`);
            }
            
            const data = await serverResponse.json();

            //send image description back to content.js for final step
            sendResponse({
                ok: true,
                contents: data.contents || "(no description)"
            });
        } catch (err) {
            console.error(err);
            sendResponse({ok: false, error: String(err?.message || err) });
        }
    })();
    return true;
});
