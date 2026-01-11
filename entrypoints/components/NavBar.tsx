import React from "react";

const NavBar = () => {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Tab Timer</h1>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">Active</span>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
