
import React from "react";

/**
 * Итальянский overlay-поворот в точности как на референсе пользователя.
 */
interface RotateOverlayProps {
  visible: boolean;
}

const PHONE_WIDTH = 120;
const PHONE_HEIGHT = 170;

const RotateOverlay: React.FC<RotateOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center select-none bg-[#121b2e] p-0"
      style={{
        minHeight: "100svh",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center rounded-2xl p-2">
        {/* Телефон + стрелка */}
        <div className="relative w-full flex justify-center items-center mt-0">
          {/* Телефон */}
          <svg
            width={PHONE_WIDTH}
            height={PHONE_HEIGHT}
            viewBox={`0 0 ${PHONE_WIDTH} ${PHONE_HEIGHT}`}
            className="block"
          >
            <rect
              x="5"
              y="8"
              width={PHONE_WIDTH - 10}
              height={PHONE_HEIGHT - 16}
              rx="38"
              fill="#fff"
              stroke="#FFD600"
              strokeWidth="8"
            />
            <rect
              x={27}
              y={30}
              width={PHONE_WIDTH - 54}
              height={PHONE_HEIGHT - 60}
              rx="20"
              fill="#3b82f6"
            />
          </svg>
          {/* Стрелка "поворот" справа от телефона */}
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            className="absolute"
            style={{
              left: PHONE_WIDTH + 9,
              top: "45%",
              transform: "translateY(-42%)"
            }}
          >
            <g>
              {/* Жёлтая прямая стрелка */}
              <line
                x1="8"
                y1="25"
                x2="40"
                y2="25"
                stroke="#FFD600"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Красная дуга для "поворота" */}
              <path
                d="M40 17 A9 9 0 0 1 40 33"
                fill="none"
                stroke="#e11d48"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <polygon
                points="41,25 35,22 35,28"
                fill="#FFD600"
              />
            </g>
          </svg>
        </div>

        {/* Текст */}
        <div className="w-full mt-4 flex flex-col items-center px-2 text-center">
          <div
            className="text-yellow-300 font-black text-3xl mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.8 }}
          >
            Ruota il dispositivo
          </div>
          <div
            className="text-white text-md md:text-lg font-mono leading-tight mb-2"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              lineHeight: 1.38
            }}
          >
            Per un'esperienza di gioco ottimale,<br />
            ruota il telefono in posizione orizzontale
          </div>
          <div
            className="text-gray-200 text-base mt-3 mb-1 font-mono flex items-center justify-center gap-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <span className="text-[19px]" role="img" aria-label="phone">
              🖼️
            </span>
            <span>
              Usa due dita per ingrandire/rimpicciolire
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotateOverlay;
