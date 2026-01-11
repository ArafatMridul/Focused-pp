// src/entrypoints/content.ts
export default defineContentScript({
    matches: ["*://*.youtube.com/*"],
    runAt: "document_end",
    async main() {
        console.log("YouTube Focus Mode content script loaded");

        // Store original styles
        let originalStyles: { [key: string]: string } = {};
        let observer: MutationObserver | null = null;

        // Listen for messages
        browser.runtime.onMessage.addListener((message) => {
            console.log("Content script received:", message.action);

            if (message.action === "startFocusMode") {
                enableFocusMode();
            } else if (message.action === "stopFocusMode") {
                disableFocusMode();
            }
        });

        // Check storage on load
        const result = await browser.storage.local.get("youtubeFocusMode");
        if (result.youtubeFocusMode) {
            setTimeout(() => enableFocusMode(), 1000);
        }

        function enableFocusMode() {
            console.log("Enabling YouTube focus mode");
            hideDistractions();
            startObserving();
            addFocusStyles();

            // Store state
            browser.storage.local.set({ youtubeFocusMode: true });
        }

        function disableFocusMode() {
            console.log("Disabling YouTube focus mode");
            stopObserving();
            restoreDistractions();
            removeFocusStyles();

            // Clear state
            browser.storage.local.set({ youtubeFocusMode: false });
        }

        function hideDistractions() {
            const selectors = [
                "#secondary",
                "#comments",
                "ytd-watch-next-secondary-results-renderer",
                "#related",
                "#guide-inner-content",
                "ytd-merch-shelf-renderer",
                "#masthead-container",
                ".ytp-ce-element",
                "ytd-item-section-renderer:not(:first-of-type)",
            ];

            selectors.forEach((selector) => {
                document.querySelectorAll(selector).forEach((el: Element) => {
                    const htmlEl = el as HTMLElement;
                    if (htmlEl.style.display !== "none") {
                        originalStyles[selector] = htmlEl.style.display;
                        htmlEl.style.display = "none";
                    }
                });
            });

            // Make video larger
            const videoContainer = document.querySelector("#primary");
            if (videoContainer) {
                (videoContainer as HTMLElement).style.width = "100%";
            }
        }

        function restoreDistractions() {
            Object.keys(originalStyles).forEach((selector) => {
                document.querySelectorAll(selector).forEach((el: Element) => {
                    const htmlEl = el as HTMLElement;
                    htmlEl.style.display = originalStyles[selector] || "";
                });
            });
            originalStyles = {};
        }

        function addFocusStyles() {
            // Remove existing
            const existingStyle = document.getElementById(
                "youtube-focus-styles"
            );
            if (existingStyle) existingStyle.remove();

            // Create new
            const style = document.createElement("style");
            style.id = "youtube-focus-styles";
            style.textContent = `
        ytd-watch-flexy[theater] #player-theater-container {
          max-width: 100% !important;
        }
        .focus-mode-indicator {
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 9999;
        }
      `;
            document.head.appendChild(style);

            // Add indicator
            const indicator = document.getElementById("focus-indicator");
            if (!indicator) {
                const newIndicator = document.createElement("div");
                newIndicator.className = "focus-mode-indicator";
                newIndicator.textContent = "🎯 Focus Mode Active";
                newIndicator.id = "focus-indicator";
                document.body.appendChild(newIndicator);
            }
        }

        function removeFocusStyles() {
            const style = document.getElementById("youtube-focus-styles");
            if (style) style.remove();

            const indicator = document.getElementById("focus-indicator");
            if (indicator) indicator.remove();
        }

        function trySetTheaterMode() {
            const theaterButton = document.querySelector(
                ".ytp-size-button"
            ) as HTMLButtonElement;
            if (theaterButton) {
                theaterButton.click();
            }
        }

        function startObserving() {
            if (observer) return;

            observer = new MutationObserver(() => {
                hideDistractions();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }

        function stopObserving() {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }
    },
});
