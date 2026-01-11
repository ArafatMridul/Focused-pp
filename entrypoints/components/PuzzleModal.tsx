import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PuzzleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSolve: () => void;
}

function PuzzleModal({ isOpen, onClose, onSolve }: PuzzleModalProps) {
    const [board, setBoard] = useState<string[]>(Array(9).fill(""));
    const [playerTurn, setPlayerTurn] = useState<"X" | "O">("X");
    const [winner, setWinner] = useState<string | null>(null);
    const [isComputerThinking, setIsComputerThinking] = useState(false);

    useEffect(() => {
        if (isOpen) {
            resetGame();
        }
    }, [isOpen]);

    useEffect(() => {
        if (playerTurn === "O" && !winner && isOpen) {
            setIsComputerThinking(true);
            const timer = setTimeout(() => {
                makeComputerMove();
                setIsComputerThinking(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [playerTurn, winner, isOpen, board]);

    const resetGame = () => {
        setBoard(Array(9).fill(""));
        setPlayerTurn("X");
        setWinner(null);
        setIsComputerThinking(false);
    };

    const checkWinner = (b: string[]) => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (const [a, bIdx, c] of lines) {
            if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
                return b[a];
            }
        }
        if (b.every((cell) => cell)) return "Draw";
        return null;
    };

    const findBestMove = (b: string[]) => {
        const availableMoves = b
            .map((cell, idx) => (cell === "" ? idx : null))
            .filter((idx) => idx !== null) as number[];

        // 40% chance to make a random move (to make it beatable)
        if (Math.random() < 0.4) {
            return availableMoves[
                Math.floor(Math.random() * availableMoves.length)
            ];
        }

        // Block player from winning (priority)
        for (const move of availableMoves) {
            const testBoard = [...b];
            testBoard[move] = "X";
            if (checkWinner(testBoard) === "X") return move;
        }

        // Take center if available
        if (availableMoves.includes(4)) return 4;

        // Take corners
        const corners = [0, 2, 6, 8].filter((i) => availableMoves.includes(i));
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }

        // Take any available move
        return availableMoves[
            Math.floor(Math.random() * availableMoves.length)
        ];
    };

    const makeComputerMove = () => {
        const move = findBestMove(board);
        const newBoard = [...board];
        newBoard[move] = "O";
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result);
        } else {
            setPlayerTurn("X");
        }
    };

    const handleClick = (index: number) => {
        if (board[index] || winner || playerTurn !== "X" || isComputerThinking)
            return;

        const newBoard = [...board];
        newBoard[index] = "X";
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result);
            if (result === "X") {
                onSolve();
            }
        } else {
            setPlayerTurn("O");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-blue-500/30 rounded-2xl w-full max-w-md p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            Tic-Tac-Toe Challenge
                        </h2>
                        <p className="text-sm text-blue-400">
                            {isComputerThinking
                                ? "Computer is thinking..."
                                : playerTurn === "X"
                                ? "Your turn (X)"
                                : "Computer's turn (O)"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-950/50 p-4 rounded-xl">
                    {board.map((cell, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleClick(idx)}
                            disabled={isComputerThinking}
                            className={`aspect-square bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-4xl font-bold rounded-xl flex items-center justify-center transition-all transform hover:scale-105 border-2 ${
                                cell === "X"
                                    ? "border-blue-500 text-blue-400"
                                    : cell === "O"
                                    ? "border-red-500 text-red-400"
                                    : "border-gray-700"
                            } ${
                                isComputerThinking
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer"
                            } disabled:hover:scale-100`}
                        >
                            {cell}
                        </button>
                    ))}
                </div>

                {winner && (
                    <div
                        className={`p-4 rounded-xl text-center border-2 ${
                            winner === "X"
                                ? "bg-green-900/30 border-green-500"
                                : winner === "Draw"
                                ? "bg-yellow-900/30 border-yellow-500"
                                : "bg-red-900/30 border-red-500"
                        }`}
                    >
                        <p
                            className={`text-xl font-bold mb-3 ${
                                winner === "X"
                                    ? "text-green-300"
                                    : winner === "Draw"
                                    ? "text-yellow-300"
                                    : "text-red-300"
                            }`}
                        >
                            {winner === "Draw"
                                ? "It's a Draw! 🤝"
                                : winner === "X"
                                ? "You Won! 🎉"
                                : "Computer Won! 🤖"}
                        </p>
                        {winner === "X" && (
                            <p className="text-green-200 text-sm mb-3">
                                Timer stopped!
                            </p>
                        )}
                        <button
                            onClick={resetGame}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
                        >
                            Play Again
                        </button>
                    </div>
                )}

                {!winner && (
                    <div className="text-center p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-sm font-medium">
                            Beat the computer to stop the timer! 🎯
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PuzzleModal;
