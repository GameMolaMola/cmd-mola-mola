import React, { useRef, useEffect, useState } from "react";
import { GameEngine } from "./GameEngine";
import { useGame } from "@/contexts/GameContext";
import { useGameCanvasResize } from "./useGameCanvasResize";
import { Toaster } from '@/components/ui/toaster'; // Assuming these are from shadcn/ui
import { useToast } from '@/components/ui/use-toast'; // Assuming these are from shadcn/ui
import StartScreen from './StartScreen'; // Import StartScreen
import GameOverScreen from './GameOverScreen'; // Import GameOverScreen
import { useTranslations } from '@/hooks/useTranslations'; // Import useTranslations
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Component for displaying game UI (Moved here for self-containment)
const GameUI: React.FC<{ gameState: GameState; bossHealth: number; maxBossHealth: number; isBossLevel: boolean }> = ({ gameState, bossHealth, maxBossHealth, isBossLevel }) => {
  const { language } = useGame();
  const t = useTranslations(language);

  return (
    <div className="absolute top-4 left-4 bg-black/50 p-4 rounded-lg text-white font-mono text-sm space-y-2 z-10">
      <div>{t.levelText}: <span id="level">{gameState.level}</span></div>
      <div>{t.coinsText}: <span id="coins">{gameState.coins}</span></div>
      <div>{t.ammoText}: <span id="ammo">{gameState.ammo}</span></div>
      <div>{t.healthText}:
        <div className="w-[100px] h-[10px] bg-gray-600 rounded-sm overflow-hidden">
          <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${gameState.health}%` }}></div>
        </div>
      </div>
      {isBossLevel && (
        <div className="mt-4">
          <div className="text-lg font-bold">{t.bossHealthText}:</div>
          <div className="w-[150px] h-[15px] bg-gray-600 rounded-sm overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${(bossHealth / maxBossHealth) * 100}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for displaying active power-ups (Moved here for self-containment)
const PowerUpEffectsUI: React.FC<{ activePowerUps: { speedBoost: boolean; jumpBoost: boolean } }> = ({ activePowerUps }) => {
  const { language } = useGame();
  const t = useTranslations(language);
  return (
    <div className="absolute top-4 right-4 text-right text-white font-mono text-sm space-y-2 z-10">
      {activePowerUps.speedBoost && <div className="animate-pulse text-yellow-400">🚀 {t.speedBoostEffectText}</div>}
      {activePowerUps.jumpBoost && <div className="animate-pulse text-green-400">⬆️ {t.jumpBoostToast}</div>}
    </div>
  );
};

interface GameCanvasProps {
  isMobile?: boolean;
  username?: string;
  isPaused?: boolean;
  gameSessionId?: number;
  collectEngineRef?: (engine: import("./GameEngine").GameEngine | null) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  isMobile,
  username,
  isPaused = false,
  gameSessionId,
  collectEngineRef,
}) => {
  const { containerRef, canvasRef: resizedCanvasRef, scale } = useGameCanvasResize();

  const gameEngineRef = useRef<import('./GameEngine').GameEngine | null>(null);
  const { toast } = useToast();
  const { language, setLanguage } = useGame();
  const t = useTranslations(language);

  const [gameStage, setGameStage] = useState<'start' | 'playing' | 'gameOver' | 'gameWin'>('start');
  const [finalScore, setFinalScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    ammo: 20,
    coins: 0,
    level: 1,
    powerUps: { speedBoost: false, speedBoostTime: 0, jumpBoost: false, jumpBoostTime: 0 },
  });
  const [bossHealth, setBossHealth] = useState(1000);
  const [maxBossHealth, setMaxBossHealth] = useState(1000);
  const BOSS_LEVEL = 10;

  useEffect(() => {
    const canvas = resizedCanvasRef.current;
    if (!canvas) return;

    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
      gameEngineRef.current = null;
    }

    const engine = new (require("./GameEngine").GameEngine)(
      canvas,
      (state: GameState) => setGameState(state),
      (score: number) => {
        setFinalScore(score);
        setGameStage('gameOver');
      },
      (score: number) => {
        setFinalScore(score);
        setGameStage('gameWin');
      },
      (type: 'speed' | 'jump' | 'ammo' | 'health') => {
        const title = t.powerUpTitle;
        let description = "";
        let icon = "";
        if (type === 'speed') {
          description = t.speedBoostToast;
          icon = "🚀";
        } else if (type === 'jump') {
          description = t.jumpBoostToast;
          icon = "⬆️";
        }
        toast({
          title: `${icon} ${title}`,
          description: description,
          duration: 2000,
        });
      },
      (type: 'speed' | 'jump' | 'ammo' | 'health') => {
        const title = t.effectEndedTitle;
        let description = "";
        if (type === 'speed') {
          description = t.speedBoostEndToast;
        } else if (type === 'jump') {
          description = t.jumpBoostEndToast;
        }
        toast({
          title: title,
          description: description,
          duration: 1500,
        });
      },
      (health: number, maxHealth: number) => {
        setBossHealth(health);
        setMaxBossHealth(maxHealth);
      }
    );

    gameEngineRef.current = engine;
    collectEngineRef?.(engine);

    if (gameStage === 'playing' && !isPaused) {
      engine.start();
    }
    return () => {
      engine.stop();
      gameEngineRef.current = null;
    };
  }, [resizedCanvasRef, toast, t, gameStage, isPaused, collectEngineRef]);

  const handleStartGame = () => {
    setGameStage('playing');
    gameEngineRef.current?.start();
  };

  const handleRestartGame = () => {
    gameEngineRef.current?.resetGame();
    setGameStage('playing');
    gameEngineRef.current?.start();
  };

  // Mobile controls (placeholder, include your actual implementation if different)
  const handleMobileMove = (direction: 'left' | 'right' | 'none') => {
    gameEngineRef.current?.handleMobileMove(direction);
  };
  const handleMobileJump = () => {
    gameEngineRef.current?.handleMobileJump(true);
  };
  const handleMobileJumpRelease = () => {
    gameEngineRef.current?.handleMobileJump(false);
  };
  const handleMobileShoot = () => {
    gameEngineRef.current?.handleMobileShoot();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex justify-center items-center overflow-hidden">
      <canvas ref={resizedCanvasRef} width="800" height="450" className="border-4 border-blue-400 rounded-lg shadow-lg"></canvas>
      <div className="absolute top-4 right-4 z-30">
          <Select onValueChange={setLanguage} defaultValue={language}>
              <SelectTrigger className="w-[140px] bg-blue-700 border-blue-400 text-white">
                  <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-blue-800 text-white border-blue-400">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
              </SelectContent>
          </Select>
      </div>
      {gameStage === 'start' && <StartScreen onStart={handleStartGame} />}
      {gameStage === 'playing' && (
        <>
            <GameUI 
                gameState={gameState} 
                bossHealth={bossHealth} 
                maxBossHealth={maxBossHealth} 
                isBossLevel={gameState.level === BOSS_LEVEL}
            />
            <PowerUpEffectsUI activePowerUps={{ speedBoost: gameState.powerUps.speedBoost, jumpBoost: gameState.powerUps.jumpBoost }} />
        </>
      )}
      {(gameStage === 'gameOver' || gameStage === 'gameWin') && (
        <GameOverScreen 
          score={finalScore} 
          onRestart={handleRestartGame} 
          isWin={gameStage === 'gameWin'} 
          gameState={gameState}
        />
      )}
      <Toaster />
    </div>
  );
};

export default GameCanvas;
