
import React from "react";

// Путь к изображению монеты
const MOLA_COIN_IMG = "/lovable-uploads/84eff824-67c6-4d5d-a334-63ed4014cc36.png";

interface Feature {
  type?: string;
  label: string;
}

// Размер иконки
const ICON_SIZE = 22;

export default function FeatureList({ features }: { features: Feature[] }) {
  const iconMap: Record<string, React.ReactNode> = {
    pixel: (
      <span
        className="inline-block align-middle mr-2"
        style={{ width: ICON_SIZE, minWidth: ICON_SIZE, textAlign: "center" }}
      >
        <span
          role="img"
          aria-label="gamepad"
          style={{ fontSize: ICON_SIZE, display: "inline-block", lineHeight: 1 }}
        >
          🎮
        </span>
      </span>
    ),
    adventure: (
      <span
        className="inline-block align-middle mr-2"
        style={{ width: ICON_SIZE, minWidth: ICON_SIZE, textAlign: "center" }}
      >
        <span
          role="img"
          aria-label="waves"
          style={{ fontSize: ICON_SIZE, display: "inline-block", lineHeight: 1 }}
        >
          🌊
        </span>
      </span>
    ),
    molamola_coin: (
      <span
        className="inline-block align-middle mr-2"
        style={{ width: ICON_SIZE, minWidth: ICON_SIZE, textAlign: "center" }}
      >
        <img
          src={MOLA_COIN_IMG}
          alt="Mola Mola Coin"
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            display: "inline-block",
            objectFit: "contain",
            verticalAlign: "middle"
          }}
          className="align-middle"
        />
      </span>
    ),
    powerup: (
      <span
        className="inline-block align-middle mr-2"
        style={{ width: ICON_SIZE, minWidth: ICON_SIZE, textAlign: "center" }}
      >
        <span
          role="img"
          aria-label="pizza"
          style={{ fontSize: ICON_SIZE, display: "inline-block", lineHeight: 1 }}
        >
          🍕
        </span>
      </span>
    ),
    boss: (
      <span
        className="inline-block align-middle mr-2"
        style={{ width: ICON_SIZE, minWidth: ICON_SIZE, textAlign: "center" }}
      >
        <span
          role="img"
          aria-label="rocket"
          style={{ fontSize: ICON_SIZE, display: "inline-block", lineHeight: 1 }}
        >
          🚀
        </span>
      </span>
    ),
  };

  return (
    <ul className="list-none pl-0 flex flex-col gap-1 select-none font-[Georgia,serif] text-[1.12rem] leading-relaxed">
      {features.map((f, idx) => {
        // Первый пункт: особый стиль
        if (idx === 0) {
          return (
            <li
              key={idx}
              className="flex items-center whitespace-nowrap flex-row"
              style={{ fontSize: "1.08rem", minHeight: 32 }}
            >
              <span
                className="text-cyan-200 font-bold mr-2"
                style={{
                  fontSize: 22,
                  lineHeight: 1,
                  minWidth: 16,
                  display: "inline-block",
                  textAlign: "center"
                }}
              >
                •
              </span>
              {iconMap[f.type ?? ""]}
              <span className="relative flex items-center">
                {/* Надпись ver.1.0 компактно слева */}
                <span
                  className="text-[0.71em] text-cyan-400 font-bold mr-2 ml-[-4px] mt-[-6px]"
                  style={{
                    position: "relative",
                    top: 0,
                    left: 0,
                    letterSpacing: "0.01em",
                    minWidth: 44
                  }}
                >
                  ver.1.0
                </span>
                <span
                  className="text-[#1dcaff]/[0.92] font-normal"
                  style={{ fontFamily: "inherit", whiteSpace: "nowrap" }}
                >
                  {f.label}
                </span>
              </span>
            </li>
          );
        }

        // Остальные пункты — стандартно
        return (
          <li key={idx} className="flex items-center">
            <span
              className="text-cyan-200 font-bold mr-2"
              style={{
                fontSize: 22,
                lineHeight: 1,
                minWidth: 16,
                display: "inline-block",
                textAlign: "center"
              }}
            >
              •
            </span>
            {iconMap[f.type ?? ""]}
            <span
              className="text-[#1dcaff]/[0.92] font-normal"
              style={{
                fontFamily: "inherit"
              }}
            >
              {f.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
