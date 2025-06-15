
import React from "react";

const GameTitle: React.FC = () => (
  <h1
    className="
      w-full max-w-full text-center
      text-[7vw] xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl
      font-bold text-yellow-300 
      drop-shadow-lg
      whitespace-pre-line break-words
      px-1 py-0.5 mx-0 
      overflow-hidden overflow-ellipsis
      bg-gradient-to-r from-blue-800/60 via-transparent to-blue-900/60
      rounded-lg
      game-font
      "
    style={{
      letterSpacing: ".04em",
      lineHeight: 1.15,
      textOverflow: "ellipsis",
      fontFamily: "inherit"
    }}
    title="COMMANDER MOLA MOLA"
  >
    🐟 COMMANDER MOLA MOLA 🐟
  </h1>
);

export default GameTitle;
