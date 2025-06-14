
import React from "react";

interface MobileControlsProps {
  onControl: (control: "left" | "right" | "jump" | "fire", state: boolean) => void;
}

export default function MobileControls({ onControl }: MobileControlsProps) {
  return (
    <div
      className="absolute z-30 left-0 right-0 bottom-0 flex justify-between px-4 pb-3 pointer-events-none select-none"
      style={{
        // Безопасные отступы для тапа
        maxWidth: 580,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Левая панель */}
      <div className="flex gap-3 pointer-events-auto">
        {/* Кнопки влево/вправо */}
        <button
          className="rounded-full bg-black/80 text-white w-16 h-16 text-4xl flex items-center justify-center border-2 border-cyan-400 active:bg-cyan-800 touch-manipulation"
          style={{ touchAction: "none", marginLeft: 4 }}
          tabIndex={-1}
          onTouchStart={e => { e.preventDefault(); onControl("left", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("left", false); }}
          onMouseDown={() => onControl("left", true)}
          onMouseUp={() => onControl("left", false)}
        >
          ◀️
        </button>
        <button
          className="rounded-full bg-black/80 text-white w-16 h-16 text-4xl flex items-center justify-center border-2 border-yellow-400 active:bg-yellow-800 touch-manipulation"
          style={{ touchAction: "none" }}
          tabIndex={-1}
          onTouchStart={e => { e.preventDefault(); onControl("right", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("right", false); }}
          onMouseDown={() => onControl("right", true)}
          onMouseUp={() => onControl("right", false)}
        >
          ▶️
        </button>
      </div>
      {/* Правая панель */}
      <div className="flex gap-3 pointer-events-auto">
        {/* Прыжок */}
        <button 
          className="rounded-full bg-black/80 text-yellow-200 w-16 h-16 text-4xl flex items-center justify-center border-2 border-yellow-400 active:bg-cyan-800 touch-manipulation"
          style={{ touchAction: "none" }}
          tabIndex={-1}
          onTouchStart={e => { e.preventDefault(); onControl("jump", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("jump", false); }}
          onMouseDown={() => onControl("jump", true)}
          onMouseUp={() => onControl("jump", false)}
        >
          ⬆️
        </button>
        {/* Огонь */}
        <button
          className="rounded-full bg-black/80 text-red-400 w-16 h-16 text-4xl flex items-center justify-center border-2 border-red-400 active:bg-yellow-800 touch-manipulation"
          style={{ touchAction: "none", marginRight: 4 }}
          tabIndex={-1}
          onTouchStart={e => { e.preventDefault(); onControl("fire", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("fire", false); }}
          onMouseDown={() => onControl("fire", true)}
          onMouseUp={() => onControl("fire", false)}
        >
          🔥
        </button>
      </div>
    </div>
  );
}
