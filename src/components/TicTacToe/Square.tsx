import React from "react";

interface SquareProps {
  value: string | null;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ value, onClick }) => {
  return (
    <button
      className="h-16 w-16 border border-purple-700/50 bg-purple-950/60 text-3xl font-bold text-center flex items-center justify-center hover:bg-purple-800/50 transition-colors text-foreground"
      onClick={onClick}
    >
      {value}
    </button>
  );
};

export default Square;