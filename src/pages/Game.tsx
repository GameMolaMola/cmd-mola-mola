import React, { useEffect, useState } from "react";
import MolaMolaGame from '@/components/game/MolaMolaGame';
import { useLocation } from 'react-router-dom';

// Простая проверка на открытие в Telegram
function isTelegramBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.toLowerCase().includes("telegram");
}

const Game = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const autoStart = params.get('autostart') === '1';

  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("✅ Game component mounted");
  }, []);

  // Класс для Telegram UI-правок
  const telegramClass = isTelegramBrowser() ? "tg-browser" : "";

  // Заблокируем прокрутку только на странице игры, но разрешим масштабирование
  const containerClass = `no-scroll fixed inset-0 z-0 bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center p-0 ${telegramClass}`;

  if (error) {
    return (
      <div style={{ color: "red", padding: "2rem" }}>Ошибка: {error.message}</div>
    );
  }

  try {
    return (
      <div
        className={containerClass}
        style={{
          touchAction: 'pinch-zoom', // Разрешаем масштабирование двумя пальцами
          WebkitOverflowScrolling: "auto",
        }}
      >
        <MolaMolaGame autoStart={autoStart} />
      </div>
    );
  } catch (err) {
    console.error("❌ Ошибка в MolaMolaGame:", err);
    setError(err instanceof Error ? err : new Error("Unknown error"));
    return null;
  }
};

export default Game;
