
import { useMemo } from "react";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function isTelegramBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.toLowerCase().includes("telegram");
}

/**
 * Hook, возвращающий true если требуется показывать мобильные контролы (мобильный или браузер Telegram)
 */
export function useMobileControls(gameEnded: boolean) {
  return useMemo(() => {
    return (isMobileDevice() || isTelegramBrowser()) && !gameEnded;
  }, [gameEnded]);
}
