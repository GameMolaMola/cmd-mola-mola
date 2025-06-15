
import React from "react";
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

  // Класс для Telegram UI-правок
  const telegramClass = isTelegramBrowser() ? "tg-browser" : "";

  // Заблокируем прокрутку только на странице игры, но разрешим масштабирование
  const containerClass = `no-scroll fixed inset-0 z-0 bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center p-0 ${telegramClass}`;

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
};

export default Game;
