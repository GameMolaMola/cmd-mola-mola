import React from "react";

interface MobileControlsProps {
  onControl: (control: "left" | "right" | "jump" | "fire", state: boolean) => void;
}

export default function MobileControls({ onControl }: MobileControlsProps) {
  return (
    <div
      className="w-full max-w-[900px] mx-auto flex justify-between gap-2 pb-2 pt-2"
      style={{ userSelect: "none", WebkitUserSelect: "none", pointerEvents: "none" }}
    >
      {/* Левая панель */}
      <div className="flex gap-2">
        <button
          className="rounded-full bg-black/80 text-white w-20 h-20 text-5xl md:w-14 md:h-14 md:text-3xl flex items-center justify-center border-2 border-cyan-400 active:bg-cyan-800 transition duration-75"
          style={{ touchAction: "none", marginLeft: 4, pointerEvents: "auto" }}
          tabIndex={-1}
          onPointerDown={e => { e.preventDefault(); onControl("left", true); }}
          onPointerUp={e => { e.preventDefault(); onControl("left", false); }}
          onTouchStart={e => { e.preventDefault(); onControl("left", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("left", false); }}
          onMouseDown={() => onControl("left", true)}
          onMouseUp={() => onControl("left", false)}
        >
          ◀️
        </button>

        <button
          className="rounded-full bg-black/80 text-white w-20 h-20 text-5xl md:w-14 md:h-14 md:text-3xl flex items-center justify-center border-2 border-yellow-400 active:bg-yellow-800 transition duration-75"
          style={{ touchAction: "none", pointerEvents: "auto" }}
          tabIndex={-1}
          onPointerDown={e => { e.preventDefault(); onControl("right", true); }}
          onPointerUp={e => { e.preventDefault(); onControl("right", false); }}
          onTouchStart={e => { e.preventDefault(); onControl("right", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("right", false); }}
          onMouseDown={() => onControl("right", true)}
          onMouseUp={() => onControl("right", false)}
        >
          ▶️
        </button>
      </div>

      {/* Правая панель */}
      <div className="flex gap-2">
        <button
          className="rounded-full bg-black/80 text-yellow-200 w-20 h-20 text-5xl md:w-14 md:h-14 md:text-3xl flex items-center justify-center border-2 border-yellow-400 active:bg-cyan-800 transition duration-75"
          style={{ touchAction: "none", pointerEvents: "auto" }}
          tabIndex={-1}
          onPointerDown={e => { e.preventDefault(); onControl("jump", true); }}
          onPointerUp={e => { e.preventDefault(); onControl("jump", false); }}
          onTouchStart={e => { e.preventDefault(); onControl("jump", true); }}
          onTouchEnd={e => { e.preventDefault(); onControl("jump", false); }}
          onMouseDown={() => onControl("jump", true)}
          onMouseUp={() => onControl("jump", false)}
        >
          ⬆️
        </button>

        <button
          className="rounded-full bg-black/80 text-red-400 w-20 h-20 text-5xl md:w-14 md:h-14 md:text-3xl flex items-center justify-center border-2 border-red-400 active:bg-yellow-800 transition duration-75"
          style={{ touchAction: "none", marginRight: 4, pointerEvents: "auto" }}
          tabIndex={-1}
          onPointerDown={e => { e.preventDefault(); onControl("fire", true); }}
          onPointerUp={e => { e.preventDefault(); onControl("fire", false); }}
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
