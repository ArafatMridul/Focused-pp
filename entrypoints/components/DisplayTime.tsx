import React from "react";

interface DisplayTimeProps {
    timeLeft: number; // seconds remaining
    settings: {
        minutes: number;
        seconds: number;
    };
    isRunning: boolean;
}

function DisplayTime({ timeLeft, settings, isRunning }: DisplayTimeProps) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Total duration in seconds
    const totalSeconds = settings.minutes * 60 + settings.seconds;

    // Calculate progress percentage
    const progressPercentage =
        totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;

    return (
        <div className="text-center mb-8">
            <div className="relative inline-block">
                <div className="text-6xl font-bold mb-4 font-mono absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                </div>

                {/* Progress ring */}
                <div className="flex items-center justify-center">
                    <svg className="w-64 h-64 -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={isRunning ? "#10B981" : "#3B82F6"}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 45} // 283
                            strokeDashoffset={
                                2 *
                                Math.PI *
                                45 *
                                (1 - progressPercentage / 100)
                            }
                            className="transition-all duration-1000"
                        />
                    </svg>
                </div>
            </div>

            <div className="mt-2">
                <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        isRunning
                            ? "bg-green-900/30 text-green-400 animate-pulse"
                            : "bg-blue-900/30 text-blue-400"
                    }`}
                >
                    {isRunning ? "Timer Running" : "Timer Ready"}
                </span>
            </div>

            {timeLeft === 0 && isRunning && (
                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-300 font-medium">Time's up! 🎉</p>
                    <p className="text-sm text-yellow-200/80 mt-1">
                        Focus session completed successfully!
                    </p>
                </div>
            )}
        </div>
    );
}

export default DisplayTime;
