export type TimerSettings = {
    minutes: number;
    seconds: number;
    newTabUrl: string;
};

type TimeSetterProps = {
    settings: TimerSettings;
    handleSettingsChange: <K extends keyof TimerSettings>(
        field: K,
        value: TimerSettings[K]
    ) => void;
    isRunning: boolean;
};

const TimeSetter = ({
    settings,
    handleSettingsChange,
    isRunning,
}: TimeSetterProps) => {
    return (
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm text-gray-400 mb-2">
                    Minutes
                </label>
                <input
                    type="number"
                    min="0"
                    max="60"
                    value={settings.minutes}
                    onChange={(e) =>
                        handleSettingsChange(
                            "minutes",
                            parseInt(e.target.value) || 0
                        )
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isRunning}
                />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-2">
                    Seconds
                </label>
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
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isRunning}
                />
            </div>
        </div>
    );
};

export default TimeSetter;
