
import React from "react";

/**
 * Overlay для поворота экрана — стилизованная копия из второго фото, на итальянском.
 */
interface RotateOverlayProps {
  visible: boolean;
}

const RotateOverlay: React.FC<RotateOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{
        background: "#111827ee",
        pointerEvents: "auto",
        touchAction: "pinch-zoom",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        minHeight: "100svh",
      }}
    >
      <div className="flex flex-col items-center max-w-sm mx-auto px-4 pb-1">
        {/* Телефон со стрелкой */}
        <div className="mb-7 relative flex items-center justify-center">
          {/* Телефон */}
          <div
            className="rounded-3xl border-[5px] border-yellow-400"
            style={{
              width: 90,
              height: 140,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="rounded-xl"
              style={{ width: 56, height: 95, background: "#3b82f6" }}
            ></div>
          </div>
          {/* Стрелка */}
          <svg
            width="47"
            height="47"
            viewBox="0 0 50 50"
            fill="none"
            className="absolute"
            style={{
              right: -52,
              top: "50%",
              transform: "translateY(-60%)",
            }}
          >
            <g>
              {/* Жёлтая стрелка */}
              <path
                d="M 14 25 H 44"
                stroke="#FFD600"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <polygon
                points="44,25 35,20 35,30"
                fill="#FFD600"
              />
              {/* Красная дуга */}
              <path
                d="M35 14 C50 16 49 34 35 36"
                stroke="#e11d48"
                strokeWidth="3"
                fill="none"
              />
            </g>
          </svg>
        </div>

        {/* Жёлтый жирный заголовок */}
        <span className="text-yellow-300 font-extrabold text-2xl text-center mb-3 drop-shadow-lg font-mono"
          style={{ letterSpacing: 1.5 }}>
          Ruota il dispositivo
        </span>

        {/* Подзаголовок — белый, моно */}
        <span className="text-white font-mono text-base text-center leading-relaxed mb-3"
          style={{ lineHeight: 1.35 }}>
          Per un'esperienza di gioco ottimale,<br />
          ruota il telefono in posizione orizzontale
        </span>

        {/* Подсказка о масштабировании */}
        <span className="text-gray-200 text-md mt-2 block text-center font-mono">
          <span role="img" aria-label="smartphone">📱</span> Usa due dita per ingrandire/rimpicciolire
        </span>
      </div>
    </div>
  );
};

export default RotateOverlay;
