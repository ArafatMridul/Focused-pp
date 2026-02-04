console.log("Background script loaded");

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "SEND_VIDEO_DATA") {
        console.log("Background: Received video data request");
        console.log("Data:", request.data);

        fetch("http://localhost:4000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request.data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Background: Backend responded:", data);
                sendResponse({ ok: true, data: data });
            })
            .catch((error) => {
                console.error("Background: Error calling backend:", error);
                sendResponse({ ok: false, error: error.message });
            });

        return true; // Keep message channel open for async response
    }
});
