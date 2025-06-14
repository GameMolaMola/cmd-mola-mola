
import React from "react";

// Данный путь изображению монеты загружается через Lovable
const MOLA_COIN_IMG = "/lovable-uploads/84eff824-67c6-4d5d-a334-63ed4014cc36.png";

interface Feature {
  type?: string;
  label: string;
}

export default function FeatureList({ features }: { features: Feature[] }) {
  // Сопоставление emoji для каждого типа feature
  const icons: Record<string, React.ReactNode> = {
    pixel: <span className="inline-block w-5 mr-2 align-middle" role="img" aria-label="gamepad">🎮</span>,
    adventure: <span className="inline-block w-5 mr-2 align-middle" role="img" aria-label="waves">🌊</span>,
    molamola_coin: (
      <img
        src={MOLA_COIN_IMG}
        alt="Mola Mola Coin"
        className="inline-block align-middle"
        style={{
          width: "18px",
          height: "18px",
          minWidth: "18px",
          minHeight: "18px",
          objectFit: "contain",
          marginRight: "8px"
        }}
      />
    ),
    powerup: <span className="inline-block w-5 mr-2 align-middle" role="img" aria-label="pizza">🍕</span>,
    boss: <span className="inline-block w-5 mr-2 align-middle" role="img" aria-label="rocket">🚀</span>
  };
  return (
    <ul className="list-none pl-0 flex flex-col gap-1">
      {features.map((f, idx) => (
        <li className="flex items-center" key={idx}>
          {/* general bullet for all but the coin */}
          {f.type !== "molamola_coin" && <span className="text-cyan-200 mr-2 font-bold select-none text-lg" style={{ lineHeight: 1 }}>•</span>}
          {/* special layout for coin */}
          {f.type === "molamola_coin" ? (
            <span className="flex items-center ml-1">
              {icons.molamola_coin}
              <span className="mx-1 text-cyan-200 font-bold select-none text-base" style={{lineHeight:1.1}}>.</span>
              <span>{f.label}</span>
            </span>
          ) : (
            <>
              {icons[f.type ?? ""] ?? <span className="inline-block w-5 mr-2" />}
              <span>{f.label}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
