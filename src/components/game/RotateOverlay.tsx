
import React from "react";

interface RotateOverlayProps {
  visible: boolean;
}

const RotateOverlay: React.FC<RotateOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center select-none" 
      style={{ 
        pointerEvents: "auto",
        touchAction: "pinch-zoom" // Разрешаем масштабирование двумя пальцами
      }}
    >
      <div className="flex flex-col items-center max-w-sm mx-auto px-4">
        {/* Более понятная иконка поворота телефона */}
        <div className="mb-6 relative">
          <div className="w-20 h-32 bg-white rounded-2xl border-4 border-yellow-400 flex items-center justify-center relative shadow-lg">
            <div className="w-12 h-20 bg-blue-500 rounded-lg"></div>
          </div>
          {/* Стрелка поворота */}
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="animate-pulse">
              <path 
                d="M30 15 L45 30 L30 45 M15 30 L42 30" 
                stroke="#fbbf24" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M35 8 C42 8 48 14 48 21" 
                stroke="#ef4444" 
                strokeWidth="3" 
                strokeLinecap="round" 
                fill="none"
              />
            </svg>
          </div>
        </div>
        
        <span className="text-yellow-300 font-bold text-xl sm:text-2xl text-center mb-3 drop-shadow-lg">
          Ruota il dispositivo
        </span>
        <span className="text-white text-base sm:text-lg text-center leading-relaxed">
          Per un'esperienza di gioco ottimale, ruota il telefono in posizione orizzontale
        </span>
        
        {/* Дополнительная информация о масштабировании */}
        <div className="mt-4 text-center">
          <span className="text-gray-300 text-sm">
            📱 Usa due dita per ingrandire/rimpicciolire
          </span>
        </div>
      </div>
    </div>
  );
};

export default RotateOverlay;
