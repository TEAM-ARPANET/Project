/**
 * Backend script for the extension
 */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg?.type !== "ANALYZE") return;
    
    (async () => {
        try {
            const imgRes = await fetch(msg.url);
            if(!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
            
            const blobRep = await imgRes.blob();
            const form = new FormData();
            
            form.append("image", blobRep, "image.jpg");
            const serverRes = await fetch("http://localhost:6502/analyze", {
                method: "POST",
                body: form
            });
            
            if(!serverRes.ok) {
                const txt = await serverRes.text().catch(() => "");
                throw new Error(`Server failed: ${serverRes.status} ${txt}`);
            }
            
            const data = await serverRes.json();
            
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