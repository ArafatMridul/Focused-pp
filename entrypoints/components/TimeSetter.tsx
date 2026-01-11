import React from "react";
import { Clock } from "lucide-react";

interface TimeSetterProps {
    settings: {
        minutes: number;
        seconds: number;
    };
    handleSettingsChange: (key: keyof TimerSettings, value: number) => void;
    isRunning: boolean;
}

interface TimerSettings {
    minutes: number;
    seconds: number;
}

function TimeSetter({
    settings,
    handleSettingsChange,
    isRunning,
}: TimeSetterProps) {
    const quickPresets = [
        { label: "25 min", minutes: 25, seconds: 0 },
        { label: "50 min", minutes: 50, seconds: 0 },
        { label: "90 min", minutes: 90, seconds: 0 },
        { label: "120 min", minutes: 120, seconds: 0 },
        { label: "150 min", minutes: 150, seconds: 0 },
        { label: "180 min", minutes: 180, seconds: 0 },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
                <Clock size={18} className="text-gray-400" />
                <h3 className="font-medium text-gray-300">
                    Set Timer Duration
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Minutes
                    </label>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() =>
                                handleSettingsChange(
                                    "minutes",
                                    Math.max(0, settings.minutes - 1)
                                )
                            }
                            disabled={isRunning}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={settings.minutes}
                            onChange={(e) =>
                                handleSettingsChange(
                                    "minutes",
                                    parseInt(e.target.value) || 0
                                )
                            }
                            disabled={isRunning}
                            className="w-full py-2 bg-gray-800 border border-gray-700 rounded-lg text-center font-mono disabled:opacity-50"
                        />
                        <button
                            onClick={() =>
                                handleSettingsChange(
                                    "minutes",
                                    Math.min(59, settings.minutes + 1)
                                )
                            }
                            disabled={isRunning}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Seconds
                    </label>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() =>
                                handleSettingsChange(
                                    "seconds",
                                    Math.max(0, settings.seconds - 5)
                                )
                            }
                            disabled={isRunning}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                        >
                            -5
                        </button>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={settings.seconds}
                            onChange={(e) =>
                                handleSettingsChange(
                                    "seconds",
                                    parseInt(e.target.value) || 0
                                )
                            }
                            disabled={isRunning}
                            className="w-full py-2 bg-gray-800 border border-gray-700 rounded-lg text-center font-mono disabled:opacity-50"
                        />
                        <button
                            onClick={() =>
                                handleSettingsChange(
                                    "seconds",
                                    Math.min(59, settings.seconds + 5)
                                )
                            }
                            disabled={isRunning}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                        >
                            +5
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    Quick Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {quickPresets.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => {
                                handleSettingsChange("minutes", preset.minutes);
                                handleSettingsChange("seconds", preset.seconds);
                            }}
                            disabled={isRunning}
                            className="py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-700/50">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                        Total Duration:
                    </span>
                    <span className="font-mono font-medium">
                        {String(settings.minutes).padStart(2, "0")}:
                        {String(settings.seconds).padStart(2, "0")}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default TimeSetter;
