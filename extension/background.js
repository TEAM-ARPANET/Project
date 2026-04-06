/**
 * Background script for the extension
 * 
 * @author Hunter Turner (A00488748)
 * @author Caleb Halverson (A00488146)
 * @author Jim nguyen (A00488742)
 */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg?.type !== "ANALYZE") return;
    
    (async () => {
        try {
            const imgRes = await fetch(msg.url);
            if(!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
            
            const blobRep = await imgRes.blob();
            const form = new FormData();
            
            form.append("image", blobRep, "image.jpg");
            const serverResponse = await fetch("http://localhost:6502/analyze", {
                method: "POST",
                body: form,
                headers: {
                    language: msg.lang
                }
            });
            
            if(!serverResponse.ok) {
                const txt = await serverResponse.text().catch(() => "");
                throw new Error(`Server failed: ${serverResponse.status} ${txt}`);
            }
            
            const data = await serverResponse.json();
            
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