import { ExternalLink } from "lucide-react";

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

const RedirectURL = ({
    settings,
    handleSettingsChange,
    isRunning,
}: TimeSetterProps) => {
    return (
        <div>
            <div>
                <label className="block text-sm text-gray-400 mb-2">
                    New Tab URL
                </label>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={settings.newTabUrl}
                        onChange={(e) =>
                            handleSettingsChange("newTabUrl", e.target.value)
                        }
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="https://example.com"
                        disabled={isRunning}
                    />
                    <button
                        onClick={() =>
                            window.open(settings.newTabUrl, "_blank")
                        }
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                        title="Test URL"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RedirectURL;
