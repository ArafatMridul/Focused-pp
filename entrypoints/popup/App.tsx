import React, { useState, useEffect, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";
import Controls from "../components/Controls";
import NavBar from "../components/NavBar";
import DisplayTime from "../components/DisplayTime";
import TimeSetter from "../components/TimeSetter";
import PuzzleModal from "../components/PuzzleModal";

interface TimerSettings {
    minutes: number;
    seconds: number;
}

interface TimerState {
    isRunning: boolean;
    timeLeft: number;
    totalDuration: number;
    startTime?: number;
}

function App() {
    const [settings, setSettings] = useState<TimerSettings>({
        minutes: 0,
        seconds: 30,
    });

    const [timeLeft, setTimeLeft] = useState(
        settings.minutes * 60 + settings.seconds
    );

    const [isRunning, setIsRunning] = useState(false);
    const [isYouTubeTab, setIsYouTubeTab] = useState(false);
    const [focusModeActive, setFocusModeActive] = useState(false);
    const [debugInfo, setDebugInfo] = useState("");
    const [showPuzzleModal, setShowPuzzleModal] = useState(false);

    // Load timer state from storage on mount
    useEffect(() => {
        const loadTimerState = async () => {
            try {
                const response = await browser.runtime.sendMessage({
                    action: "getTimerState",
                });

                setDebugInfo(`Loaded: ${JSON.stringify(response)}`);

                if (response && response.isRunning && response.timeLeft > 0) {
                    setTimeLeft(response.timeLeft);
                    setIsRunning(true);
                } else {
                    const storedData = await browser.storage.local.get(
                        "timerState"
                    );
                    console.log("POPUP: Storage data:", storedData);

                    if (storedData.timerState) {
                        const state = storedData.timerState;
                        const savedTime = state.remainingTime ?? state.timeLeft;

                        if (typeof savedTime === "number" && savedTime > 0) {
                            setTimeLeft(savedTime);
                            setIsRunning(false);
                        } else {
                            initializeFromSettings();
                        }
                    } else {
                        initializeFromSettings();
                    }
                }
            } catch (error) {
                console.error("POPUP: Error loading timer state:", error);
                setDebugInfo(`Error: ${error}`);
                initializeFromSettings();
            }
        };

        const initializeFromSettings = () => {
            const totalSeconds = settings.minutes * 60 + settings.seconds;
            setTimeLeft(totalSeconds);
        };

        loadTimerState();
    }, []);

    // Sync with background script when timer is running
    useEffect(() => {
        if (!isRunning) {
            return;
        }

        const syncInterval = setInterval(async () => {
            try {
                const response = await browser.runtime.sendMessage({
                    action: "getTimerState",
                });

                setDebugInfo(`Sync: ${response?.timeLeft}s`);

                if (response && response.isRunning && response.timeLeft > 0) {
                    setTimeLeft(response.timeLeft);
                } else {
                    setIsRunning(false);
                    if (response && response.timeLeft === 0) {
                        setTimeLeft(0);
                    } else if (response && response.timeLeft > 0) {
                        setTimeLeft(response.timeLeft);
                    }
                }
            } catch (error) {
                console.error("POPUP: Error syncing timer:", error);
                setDebugInfo(`Sync error: ${error}`);
            }
        }, 100);

        return () => {
            clearInterval(syncInterval);
        };
    }, [isRunning]);

    // Update timeLeft when settings change (only if not running)
    useEffect(() => {
        if (!isRunning) {
            const totalSeconds = settings.minutes * 60 + settings.seconds;
            setTimeLeft(totalSeconds);
        }
    }, [settings.minutes, settings.seconds, isRunning]);

    // Check if current tab is YouTube
    useEffect(() => {
        const checkCurrentTab = async () => {
            try {
                const tabs = await browser.tabs.query({
                    active: true,
                    currentWindow: true,
                });
                const currentTab = tabs[0];
                const isYT = currentTab.url?.includes("youtube.com") || false;
                setIsYouTubeTab(isYT);

                if (isYT) {
                    const response = await browser.runtime.sendMessage({
                        action: "checkFocusMode",
                    });
                    setFocusModeActive(response?.focusModeActive || false);
                }
            } catch (error) {
                console.error("Error checking current tab:", error);
            }
        };

        checkCurrentTab();
    }, []);

    const handleSettingsChange = useCallback(
        (key: keyof TimerSettings, value: string | number) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const startTimer = useCallback(() => {
        setIsRunning(true);

        browser.runtime
            .sendMessage({
                action: "startTimer",
                duration: timeLeft,
            })
            .then((response) => {
                console.log("POPUP: Start timer response:", response);
            });

        if (isYouTubeTab) {
            browser.tabs
                .query({ active: true, currentWindow: true })
                .then((tabs) => {
                    if (tabs[0]?.id) {
                        return browser.tabs.sendMessage(tabs[0].id, {
                            action: "startFocusMode",
                        });
                    }
                })
                .then(() => {
                    setFocusModeActive(true);
                })
                .catch(() => {});
        }
    }, [timeLeft, isYouTubeTab]);

    const requestStopTimer = useCallback(() => {
        setShowPuzzleModal(true);
    }, []);

    const handlePuzzleSolve = useCallback(() => {
        console.log("POPUP: Puzzle solved, stopping timer");

        browser.runtime
            .sendMessage({
                action: "getTimerState",
            })
            .then((response) => {
                if (response) {
                    const currentTime = response.timeLeft || 0;

                    return browser.runtime.sendMessage({
                        action: "stopTimer",
                        currentTimeLeft: currentTime,
                    });
                }
            })
            .then(() => {
                setIsRunning(false);

                if (focusModeActive) {
                    browser.tabs
                        .query({ active: true, currentWindow: true })
                        .then((tabs) => {
                            if (tabs[0]?.id) {
                                return browser.tabs.sendMessage(tabs[0].id, {
                                    action: "stopFocusMode",
                                });
                            }
                        })
                        .then(() => {
                            setFocusModeActive(false);
                        })
                        .catch(() => {});
                }
            })
            .catch((error) => {
                console.error("Error stopping timer:", error);
                setIsRunning(false);
            });
    }, [focusModeActive]);

    const resetTimer = useCallback(() => {
        console.log("POPUP: Resetting timer");
        setIsRunning(false);
        const totalSeconds = settings.minutes * 60 + settings.seconds;
        setTimeLeft(totalSeconds);

        browser.runtime.sendMessage({ action: "resetTimer" });

        if (focusModeActive) {
            browser.tabs
                .query({ active: true, currentWindow: true })
                .then((tabs) => {
                    if (tabs[0]?.id) {
                        browser.tabs
                            .sendMessage(tabs[0].id, {
                                action: "stopFocusMode",
                            })
                            .then(() => {
                                setFocusModeActive(false);
                            })
                            .catch(() => {});
                    }
                });
        }
    }, [settings.minutes, settings.seconds, focusModeActive]);

    const renderYouTubeStatus = () => {
        if (!isYouTubeTab) return null;

        return (
            <div
                className={`mb-4 p-3 rounded-lg ${
                    focusModeActive
                        ? "bg-green-900/30 border border-green-700"
                        : "bg-yellow-900/30 border border-yellow-700"
                }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                                focusModeActive
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-yellow-500"
                            }`}
                        ></div>
                        <span className="font-medium">
                            YouTube{" "}
                            {focusModeActive ? "Focus Mode" : "Detected"}
                        </span>
                    </div>
                    <span className="text-sm opacity-80">
                        {focusModeActive
                            ? "🎯 Distractions hidden"
                            : "Ready for focus mode"}
                    </span>
                </div>
                {!focusModeActive && isRunning && (
                    <p className="text-xs mt-2 text-yellow-300">
                        Focus mode will activate when timer starts
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="w-100 p-6 bg-linear-to-br from-gray-900 to-black text-white">
            <NavBar />
            {renderYouTubeStatus()}
            <DisplayTime
                timeLeft={timeLeft}
                settings={settings}
                isRunning={isRunning}
            />
            <Controls
                setIsRunning={setIsRunning}
                setTimeLeft={setTimeLeft}
                settings={settings}
                isRunning={isRunning}
                startTimer={startTimer}
                stopTimer={requestStopTimer}
                resetTimer={resetTimer}
            />
            <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-4">
                        Timer Settings
                    </h2>
                    <TimeSetter
                        settings={settings}
                        handleSettingsChange={handleSettingsChange}
                        isRunning={isRunning}
                    />
                </div>
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-300 mb-2">
                        How it works
                    </h3>
                    <p className="text-sm text-blue-200/80">
                        Set a timer to focus. When timer is running, YouTube
                        distractions are hidden. To stop the timer early, solve
                        a quick puzzle to ensure you're making a conscious
                        decision.
                    </p>
                </div>
            </div>

            <PuzzleModal
                isOpen={showPuzzleModal}
                onClose={() => setShowPuzzleModal(false)}
                onSolve={handlePuzzleSolve}
            />
        </div>
    );
}

export default App;
