import React from "react";
import { Play, RotateCcw, AlertTriangle } from "lucide-react";

interface ControlsProps {
    isRunning: boolean;
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
    setIsRunning: (running: boolean) => void;
    setTimeLeft: (time: number) => void;
    settings: {
        minutes: number;
        seconds: number;
    };
}

function Controls({
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
}: ControlsProps) {
    return (
        <div className="flex justify-center space-x-4 mb-8">
            {!isRunning ? (
                <button
                    onClick={startTimer}
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                    <Play size={20} className="mr-2" />
                    Start Timer
                </button>
            ) : (
                <>
                    <button
                        onClick={stopTimer}
                        className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <AlertTriangle size={20} className="mr-2" />
                        Stop Timer
                    </button>
                </>
            )}
        </div>
    );
}

export default Controls;
