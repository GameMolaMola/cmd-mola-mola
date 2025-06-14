
import React, { useEffect, useState } from "react";
import MolaMolaGame from '@/components/game/MolaMolaGame';
import { useLocation } from 'react-router-dom';
import RotateOverlay from "@/components/game/RotateOverlay";

// Простая проверка на открытие в Telegram
function isTelegramBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.toLowerCase().includes("telegram");
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function isPortrait() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(orientation: portrait)").matches;
}

const Game = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const autoStart = params.get('autostart') === '1';

  const [showRotate, setShowRotate] = useState(false);

  // Определяем когда показывать overlay: мобила + портрет
  useEffect(() => {
    function checkNeedOverlay() {
      setShowRotate(isMobileDevice() && isPortrait());
    }
    checkNeedOverlay();
    window.addEventListener("orientationchange", checkNeedOverlay);
    window.addEventListener("resize", checkNeedOverlay);
    return () => {
      window.removeEventListener("orientationchange", checkNeedOverlay);
      window.removeEventListener("resize", checkNeedOverlay);
    };
  }, []);

  // Класс для Telegram UI-правок
  const telegramClass = isTelegramBrowser() ? "tg-browser" : "";

  // Обеспечиваем отсутствие скроллов вообще (на многих Android/iOS/Telegram 100dvh иногда не хватает — дублируем всем что можно)
  return (
    <div
      className={`fixed inset-0 z-0 bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center p-0 ${telegramClass}`}
      style={{
        touchAction: 'none',
        overflow: 'hidden',
        minHeight: '100dvh',
        minWidth: '100vw',
        maxHeight: '100dvh',
        maxWidth: '100vw',
        height: '100dvh',
        width: '100vw',
        WebkitOverflowScrolling: "auto",
      }}
    >
      <RotateOverlay visible={showRotate} />
      {/* Показываем саму игру только если overlay неактивен */}
      {!showRotate && <MolaMolaGame autoStart={autoStart} />}
    </div>
  );
};

export default Game;
