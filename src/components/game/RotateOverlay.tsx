
import React from "react";

interface RotateOverlayProps {
  visible: boolean;
}

const RotateOverlay: React.FC<RotateOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center select-none" style={{ pointerEvents: "auto" }}>
      <div className="flex flex-col items-center">
        <svg width="84" height="84" viewBox="0 0 92 92" fill="none" className="mb-4">
          <rect x="10" y="18" width="72" height="56" rx="16" fill="#fbbf24" stroke="#ef4444" strokeWidth="7"/>
          <path d="M74 32L84 46L74 60" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-yellow-300 font-bold text-lg sm:text-2xl text-center mb-2 drop-shadow">
          Поверните устройство
        </span>
        <span className="text-white text-md sm:text-lg text-center">
          Для комфортной игры переведите телефон в горизонтальное положение
        </span>
      </div>
    </div>
  );
};

export default RotateOverlay;
