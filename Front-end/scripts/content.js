console.log("Content script loaded..............");

const videoData = {
    currentlyPlaying: { title: "" },
    recommendedVideos: []
};

let collectedTitles = new Set(); // Use Set to automatically handle duplicates
let skipvideoarr = [];
let hasSentData = false;

// Get current video title
function getYouTubeVideoTitle() {
    const metaTitle =
        document.querySelector('meta[name="title"]') ||
        document.querySelector('meta[property="og:title"]');
    const title = metaTitle ? metaTitle.content : document.title || null;
    console.log("Video title found:", title);
    return title;
}

// Get channel name (optional, for future use)
function getChannelName() {
    const channelName =
        document.querySelector("ytd-channel-name a")?.innerText ||
        document.querySelector("#channel-name a")?.innerText ||
        null;
    console.log("Channel name found:", channelName);
    return channelName;
}

// Get suggested video titles with deduplication
function getVideoTitles() {
    const titlesMap = new Map(); // Use Map to track unique titles by element
    
    // Try multiple selectors for better compatibility
    const selectors = [
        "a#video-title",
        "a.yt-lockup-metadata-view-model__title span",
        "yt-formatted-string#video-title"
    ];
    
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el) => {
            const text = el.innerText?.trim();
            if (text && text.length > 0) {
                // Use element reference as key to avoid duplicates from same element
                titlesMap.set(text, true);
            }
        });
    });
    
    const uniqueTitles = Array.from(titlesMap.keys());
    console.log("Found", uniqueTitles.length, "unique video titles");
    return uniqueTitles;
}

// Send data to backend at localhost:4000/chat
async function sendToBackend() {
    if (hasSentData) {
        console.log("Data already sent, skipping...");
        return;
    }
    
    const videoTitle = getYouTubeVideoTitle();
    
    console.log("=== Preparing to send data ===");
    console.log("Current video:", videoTitle);
    console.log("Collected unique titles:", collectedTitles.size);
    
    if (!videoTitle) {
        console.warn("❌ Missing video title - aborting send");
        return;
    }
    
    if (collectedTitles.size === 0) {
        console.warn("❌ No recommended videos collected - aborting send");
        return;
    }
    
    // Convert Set to Array and prepare data
    const uniqueTitlesArray = Array.from(collectedTitles);
    
    videoData.currentlyPlaying = { title: videoTitle };
    videoData.recommendedVideos = uniqueTitlesArray
        .slice(0, 20)
        .map(title => ({ title }));
    
    console.log("✅ Sending to backend:", videoData);
    console.log("Unique videos count:", videoData.recommendedVideos.length);
    
    try {
        const response = await fetch("http://localhost:4000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(videoData),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("✅ Backend response:", result);
        
        // Store which videos to skip
        if (result && Array.isArray(result)) {
            skipvideoarr = result;
            console.log("Videos to skip:", skipvideoarr);
            blurThumbnails();
        }
        
        hasSentData = true;
        
    } catch (error) {
        console.error("❌ Error sending to backend:", error);
        
        // Fallback: try via background script if direct fetch fails (CORS)
        console.log("Trying via background script...");
        chrome.runtime.sendMessage(
            {
                type: "SEND_VIDEO_DATA",
                data: videoData,
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("❌ Chrome runtime error:", chrome.runtime.lastError.message);
                    return;
                }
                
                if (response && response.ok) {
                    console.log("✅ Response via background:", response.data);
                    if (response.data && Array.isArray(response.data)) {
                        skipvideoarr = response.data;
                        blurThumbnails();
                    }
                    hasSentData = true;
                } else {
                    console.error("❌ Error via background:", response?.error);
                }
            }
        );
    }
}

// Blur thumbnails for videos to skip
function blurThumbnails() {
    console.log("Blurring thumbnails...");
    
    const thumbnails = document.querySelectorAll(".ytThumbnailViewModelImage img");
    
    for (let i = 0; i < thumbnails.length; i++) {
        if (!skipvideoarr.includes(i)) {
            console.log("Blurring thumbnail:", i);
            const img = thumbnails[i];
            img.src = chrome.runtime.getURL("images/stop.jpg");
        }
    }
}

// Collect titles and add to Set (automatic deduplication)
function collectTitles() {
    const newTitles = getVideoTitles();
    const previousSize = collectedTitles.size;
    
    newTitles.forEach(title => {
        collectedTitles.add(title); // Set automatically prevents duplicates
    });
    
    const addedCount = collectedTitles.size - previousSize;
    if (addedCount > 0) {
        console.log(`Added ${addedCount} new unique titles. Total: ${collectedTitles.size}`);
    }
    
    return collectedTitles.size;
}

// Initialize: collect titles already on page
function initialize() {
    console.log("=== YouTube Monitor Initialized ===");
    
    setTimeout(() => {
        const count = collectTitles();
        console.log("Initial titles collected:", count);
        
        if (count >= 20) {
            console.log("Already have 20+ titles, sending now");
            observer.disconnect();
            sendToBackend();
        }
    }, 2000);
}

// Observe mutations to collect titles dynamically
const observer = new MutationObserver(() => {
    const count = collectTitles();
    
    if (count >= 20 && !hasSentData) {
        console.log("✅ Collected 20+ unique videos. Stopping observer.");
        observer.disconnect();
        sendToBackend();
    }
});

// Start observing
if (document.body) {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
    initialize();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        initialize();
    });
}

// Fallback timeout
setTimeout(() => {
    console.log("=== Timeout reached after 8 seconds ===");
    observer.disconnect();
    
    // Final collection attempt
    const finalCount = collectTitles();
    
    console.log("Final collected unique titles:", finalCount);
    
    if (finalCount > 0 && !hasSentData) {
        sendToBackend();
    } else if (hasSentData) {
        console.log("✅ Data already sent");
    } else {
        console.warn("⚠️ No titles collected");
    }
}, 8000);