export default defineBackground(() => {
    console.log("Background script loaded");

    let activeTimer: {
        tabId: number;
        intervalId: number;
        duration: number;
        remainingTime: number;
    } | null = null;

    const saveTimerState = () => {
        if (activeTimer) {
            browser.storage.local.set({
                timerState: {
                    remainingTime: activeTimer.remainingTime,
                    isRunning: true,
                },
            });
        }
    };

    const clearTimerState = () => {
        browser.storage.local.set({
            timerState: { remainingTime: 0, isRunning: false },
        });
    };

    const startInterval = () => {
        if (!activeTimer) return;

        const tick = () => {
            if (!activeTimer) return;

            activeTimer.remainingTime -= 1;
            saveTimerState();

            console.log("Timer tick:", activeTimer.remainingTime);

            if (activeTimer.remainingTime <= 0) {
                clearInterval(activeTimer.intervalId);
                console.log("Timer completed!");

                browser.tabs
                    .query({ active: true, currentWindow: true })
                    .then((tabs) => {
                        const currentTab = tabs[0];
                        if (currentTab?.id) {
                            browser.tabs
                                .sendMessage(currentTab.id, {
                                    action: "stopFocusMode",
                                })
                                .catch(() => {});
                        }
                    });

                browser.storage.local.set({
                    youtubeFocusMode: false,
                    timerState: { remainingTime: 0, isRunning: false },
                });

                // Timer completed - just stop and clean up
                activeTimer = null;
                console.log("Timer stopped after completion");
            }
        };

        activeTimer.intervalId = setInterval(tick, 1000) as unknown as number;
    };

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Background received:", message.action);

        switch (message.action) {
            case "startTimer": {
                const { duration } = message;

                browser.tabs
                    .query({ active: true, currentWindow: true })
                    .then((tabs) => {
                        const currentTab = tabs[0];
                        if (!currentTab?.id) {
                            console.error("No active tab found");
                            return;
                        }

                        // If timer already exists and is paused, just resume it
                        if (activeTimer && activeTimer.remainingTime > 0) {
                            console.log(
                                "Resuming existing timer with:",
                                activeTimer.remainingTime
                            );
                            activeTimer.tabId = currentTab.id; // Update tab ID in case it changed
                            startInterval();
                        } else {
                            // Create new timer
                            if (activeTimer) {
                                clearInterval(activeTimer.intervalId);
                            }

                            activeTimer = {
                                tabId: currentTab.id,
                                intervalId: 0,
                                duration,
                                remainingTime: duration,
                            };

                            console.log(
                                "Starting new timer with duration:",
                                duration
                            );
                            startInterval();
                        }

                        if (currentTab.url?.includes("youtube.com")) {
                            browser.tabs
                                .sendMessage(currentTab.id, {
                                    action: "startFocusMode",
                                })
                                .catch((err) =>
                                    console.log("Focus mode failed:", err)
                                );
                            browser.storage.local.set({
                                youtubeFocusMode: true,
                            });
                        }
                    });

                sendResponse({ success: true });
                return true;
            }

            case "stopTimer": {
                if (activeTimer) {
                    clearInterval(activeTimer.intervalId);

                    browser.tabs
                        .query({ active: true, currentWindow: true })
                        .then((tabs) => {
                            const currentTab = tabs[0];
                            if (currentTab?.id) {
                                browser.tabs
                                    .sendMessage(currentTab.id, {
                                        action: "stopFocusMode",
                                    })
                                    .catch(() => {});
                            }
                        });

                    activeTimer = null;
                    browser.storage.local.set({
                        youtubeFocusMode: false,
                        timerState: { remainingTime: 0, isRunning: false },
                    });

                    console.log("Timer stopped via puzzle");
                }
                sendResponse({ success: true });
                break;
            }

            case "resetTimer": {
                if (activeTimer) {
                    clearInterval(activeTimer.intervalId);

                    browser.tabs
                        .query({ active: true, currentWindow: true })
                        .then((tabs) => {
                            if (tabs[0]?.id) {
                                browser.tabs
                                    .sendMessage(tabs[0].id, {
                                        action: "stopFocusMode",
                                    })
                                    .catch(() => {});
                            }
                        });

                    activeTimer = null;
                    browser.storage.local.set({
                        youtubeFocusMode: false,
                        timerState: { remainingTime: 0, isRunning: false },
                    });
                    console.log("Timer reset");
                }
                sendResponse({ success: true });
                break;
            }

            case "getTimerState": {
                if (activeTimer) {
                    const isActuallyRunning = activeTimer.intervalId !== 0;

                    console.log("Returning timer state:", {
                        remainingTime: activeTimer.remainingTime,
                        isRunning: isActuallyRunning,
                    });

                    sendResponse({
                        isRunning: isActuallyRunning,
                        timeLeft: activeTimer.remainingTime,
                        totalDuration: activeTimer.duration,
                    });
                } else {
                    sendResponse({
                        isRunning: false,
                        timeLeft: 0,
                        totalDuration: 0,
                    });
                }
                return true;
            }

            case "checkFocusMode": {
                browser.storage.local.get("youtubeFocusMode").then((result) => {
                    sendResponse({
                        focusModeActive: result.youtubeFocusMode || false,
                    });
                });
                return true;
            }

            default:
                console.warn("Unknown action:", message.action);
        }
    });

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (
            activeTimer &&
            changeInfo.status === "complete" &&
            tab.url?.includes("youtube.com")
        ) {
            console.log(
                "Tab refreshed, updating tabId from",
                activeTimer.tabId,
                "to",
                tabId
            );
            activeTimer.tabId = tabId;

            if (activeTimer.remainingTime > 0) {
                browser.storage.local.get("youtubeFocusMode").then((result) => {
                    if (result.youtubeFocusMode) {
                        setTimeout(() => {
                            browser.tabs
                                .sendMessage(tabId, {
                                    action: "startFocusMode",
                                })
                                .catch(() =>
                                    console.log("Could not reapply focus mode")
                                );
                        }, 1000);
                    }
                });
            }
        }
    });
});
