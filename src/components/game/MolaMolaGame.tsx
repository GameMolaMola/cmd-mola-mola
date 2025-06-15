import React from "react";
import { useGame } from "@/contexts/GameContext";
import { useTranslations } from "@/hooks/useTranslations";
import { useFreeBrasilena } from "./useFreeBrasilena";
import { useMobileControls } from "./useMobileControls";
import { useMolaMolaGameCore } from "./useMolaMolaGameCore";
import MolaMolaHUDWrapper from "./MolaMolaHUDWrapper";
import GameCanvas from "./GameCanvas";
import MolaMolaGameEndDialog from "./MolaMolaGameEndDialog";
import PauseOverlay from "./PauseOverlay";
import MolaMolaMobileControlsWrapper from "./MolaMolaMobileControlsWrapper";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}
function isTelegramBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.toLowerCase().includes("telegram");
}

const MolaMolaGame = ({ autoStart = false }: { autoStart?: boolean }) => {
  const { playerData, language } = useGame();
  const freeBrasilena = useFreeBrasilena();
  const t = useTranslations(language);

  const username =
    typeof playerData?.nickname === "string"
      ? playerData.nickname
      : typeof playerData?.email === "string"
      ? playerData.email
      : undefined;

  // Подключаем выносимую бизнес-логику
  const {
    hud, initialGameState, gameSessionId,
    gameEnded, victory, isPaused, onPause,
    onStateUpdate, handleGameEnd, handleRestart, collectEngineRef, handleControl,
  } = useMolaMolaGameCore({
    playerData,
    freeBrasilena,
    username,
  });

  // Мобильные контролы
  const showMobileControls = useMobileControls(gameEnded);

  React.useEffect(() => {
    if (showMobileControls) {
      console.log("Mobile controls are enabled: управление осуществляется с мобильного устройства или Telegram браузера.");
    } else {
      console.log("Desktop controls: управление осуществляется с ПК/ноутбука.");
    }
  }, [showMobileControls]);

  return (
    <div
      className="w-screen bg-[#011b2e] relative flex flex-col overflow-hidden"
      style={{
        height: '100svh',
      }}
      tabIndex={-1}
    >
      <div 
        className="z-10 shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <MolaMolaHUDWrapper
          gameState={hud}
          isMobile={showMobileControls}
          onPause={onPause}
        />
      </div>
      <div className="relative flex-1">
        <GameCanvas
          key={gameSessionId}
          gameState={initialGameState}
          onGameEnd={handleGameEnd}
          onStateUpdate={onStateUpdate}
          isMobile={showMobileControls}
          username={username}
          isPaused={isPaused || gameEnded}
          gameSessionId={gameSessionId}
          collectEngineRef={collectEngineRef}
        />
      </div>
      <div 
        className="z-10 shrink-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <MolaMolaMobileControlsWrapper show={showMobileControls} onControl={handleControl} />
      </div>
      <MolaMolaGameEndDialog
        open={gameEnded}
        victory={victory}
        stats={{
          level: hud.level,
          coins: hud.coins
        }}
        onRestart={handleRestart}
      />
      <PauseOverlay visible={isPaused && !gameEnded} />
    </div>
  );
};

export default MolaMolaGame;
