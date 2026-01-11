type DisplayTimeProps = {
    timeLeft: number;
    settings: {
        minutes: number;
        seconds: number;
        newTabUrl: string;
    };
    isRunning: boolean;
};

const DisplayTime = ({ timeLeft, settings, isRunning }: DisplayTimeProps) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const progressPercentage =
        (timeLeft / (settings.minutes * 60 + settings.seconds)) * 100;

    return (
        <>
            <div className="text-center mb-8">
                <div className="relative inline-block">
                    <div className="text-6xl font-mono font-bold tracking-wider mb-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        {formatTime(timeLeft)}
                    </div>

                    {/* Progress Ring */}
                    <div>
                        <svg
                            className="w-full h-full transform -rotate-90"
                            viewBox="0 0 100 100"
                        >
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="4"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset={
                                    283 - (283 * progressPercentage) / 100
                                }
                                className="transition-all duration-1000"
                            />
                        </svg>
                    </div>
                </div>

                <div className="text-gray-400 text-sm mt-2">
                    {isRunning ? "Timer is running..." : "Timer paused"}
                </div>
            </div>
        </>
    );
};

export default DisplayTime;
