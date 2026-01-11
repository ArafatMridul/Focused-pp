import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, ExternalLink } from "lucide-react";
import Controls from "../components/Controls";
import NavBar from "../components/NavBar";
import DisplayTime from "../components/DisplayTime";
import TimeSetter from "../components/TimeSetter";
import RedirectURL from "../components/RedirectURL";

interface TimerSettings {
    minutes: number;
    seconds: number;
    newTabUrl: string;
}

function App() {
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [settings, setSettings] = useState<TimerSettings>({
        minutes: 0,
        seconds: 3,
        newTabUrl: "https://www.google.com",
    });

    // Initialize timer
    useEffect(() => {
        const totalSeconds = settings.minutes * 60 + settings.seconds;
        setTimeLeft(totalSeconds);
    }, [settings.minutes, settings.seconds]);

    // Timer logic
    useEffect(() => {
        let intervalId: number | undefined;
        let timerFinished = false; // Flag to prevent double execution

        if (isRunning && timeLeft > 0) {
            intervalId = window.setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1 && !timerFinished) {
                        timerFinished = true; // Set flag to prevent re-execution
                        setIsRunning(false);

                        // Use setTimeout to ensure state updates complete
                        setTimeout(() => {
                            browser.tabs.query(
                                { active: true, currentWindow: true },
                                (tabs) => {
                                    const currentTabId = tabs[0]?.id;
                                    if (!currentTabId) return;

                                    console.log(
                                        "Timer finished. Closing tab:",
                                        currentTabId
                                    );

                                    // Open new tab first, then close current
                                    browser.tabs.create(
                                        {
                                            url: settings.newTabUrl,
                                            active: true, // Keep new tab active
                                        },
                                        (newTab) => {
                                            console.log(
                                                "New tab created:",
                                                newTab.id
                                            );
                                            // Small delay before closing original tab
                                            setTimeout(() => {
                                                browser.tabs.remove(
                                                    currentTabId
                                                );
                                            }, 100);
                                        }
                                    );
                                }
                            );
                        }, 100);

                        return 0;
                    }

                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
            }
        };
    }, [isRunning, timeLeft, settings.newTabUrl]);

    const startTimer = useCallback(() => {
        setIsRunning(true);
        const totalSeconds = settings.minutes * 60 + settings.seconds;

        // Start timer in background script
        browser.runtime.sendMessage({
            action: "startTimer",
            duration: totalSeconds,
            newTabUrl: settings.newTabUrl,
        });
    }, [settings.minutes, settings.seconds, settings.newTabUrl]);

    const handleSettingsChange = useCallback(
        (key: keyof TimerSettings, value: string | number) => {
            setSettings((prev) => ({
                ...prev,
                [key]: value,
            }));
        },
        []
    );

    return (
        <div className="w-80 p-6 bg-linear-to-br from-gray-900 to-black text-white">
            {/* Navbar */}
            <NavBar />
            {/* Timer Display */}
            <DisplayTime
                timeLeft={timeLeft}
                settings={settings}
                isRunning={isRunning}
            />
            {/* Controls */}
            <Controls
                setIsRunning={setIsRunning}
                setTimeLeft={setTimeLeft}
                settings={settings}
                isRunning={isRunning}
                startTimer={startTimer}
            />
            {/* Settings */}
            <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-4">
                        Timer Settings
                    </h2>
                    {/* Time setter */}
                    <TimeSetter
                        settings={settings}
                        handleSettingsChange={handleSettingsChange}
                        isRunning={isRunning}
                    />

                    {/* Redirect URL */}
                    <RedirectURL
                        settings={settings}
                        handleSettingsChange={handleSettingsChange}
                        isRunning={isRunning}
                    />
                </div>

                {/* Info */}
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-300 mb-2">
                        How it works
                    </h3>
                    <p className="text-sm text-blue-200/80">
                        When the timer reaches zero, the current tab will
                        automatically close and a new tab will open with your
                        specified URL.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
