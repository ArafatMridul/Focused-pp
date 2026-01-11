import { Pause, Play, RotateCcw } from "lucide-react";

type ControlsProps = {
    setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
    setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
    settings: {
        minutes: number;
        seconds: number;
        newTabUrl: string;
    };
    isRunning: boolean;
    startTimer: () => void; // Add this prop
};

const Controls = ({
    setIsRunning,
    setTimeLeft,
    settings,
    isRunning,
    startTimer, // Receive it here
}: ControlsProps) => {
    const pauseTimer = () => {
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        const totalSeconds = settings.minutes * 60 + settings.seconds;
        setTimeLeft(totalSeconds);
    };

    return (
        <div className="flex justify-center space-x-4 mb-8">
            {!isRunning ? (
                <button
                    onClick={startTimer} // Use the prop here
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <Play className="w-5 h-5 mr-2" />
                    Start
                </button>
            ) : (
                <button
                    onClick={pauseTimer}
                    className="flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                </button>
            )}

            <button
                onClick={resetTimer}
                className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
            </button>
        </div>
    );
};

export default Controls;
