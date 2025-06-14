import React, { useRef, useEffect, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { GameEngine } from "./GameEngine";
import { Button } from "@/components/ui/button";
import GameHUD from "./hud/GameHUD";
import GameOverDialog from "./hud/GameOverDialog";

const MolaMolaGame = ({ autoStart = false }: { autoStart?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalStats, setFinalStats] = useState<any>(null);
  const [mobileControlsVisible, setMobileControlsVisible] = useState(false);

  // state for HUD
  const [hud, setHud] = useState({ health: 100, ammo: 10, coins: 0, level: 1 });

  const { playerData } = useGame();

  const onStateUpdate = (updates: any) => {
    setHud((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = new GameEngine(canvas, ctx, {
      onGameEnd: (victory, finalStats) => {
        setGameEnded(true);
        setVictory(victory);
        setFinalStats(finalStats);
      },
      onStateUpdate: onStateUpdate,
      initialState: playerData
    });

    setGameEngine(engine);

    const handleResize = () => {
      canvas.width = 800;
      canvas.height = 480;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
    };
  }, [playerData]);

  useEffect(() => {
    if (autoStart && gameEngine) {
      gameEngine.start();
    }
  }, [autoStart, gameEngine]);

  const handleRestart = () => {
    setGameEnded(false);
    setVictory(false);
    setFinalStats(null);
    if (gameEngine) {
      gameEngine.stop();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const engine = new GameEngine(canvas, ctx, {
        onGameEnd: (victory, finalStats) => {
          setGameEnded(true);
          setVictory(victory);
          setFinalStats(finalStats);
        },
        onStateUpdate: onStateUpdate,
        initialState: playerData
      });
      setGameEngine(engine);
      engine.start();
    }
  };

  const handleControl = (control: string, state: boolean) => {
    gameEngine?.setMobileControlState(control, state);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start">
      <GameHUD
        health={hud.health}
        ammo={hud.ammo}
        coins={hud.coins}
        level={hud.level}
      />
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        className="border-2 border-cyan-400 rounded bg-blue-900 shadow-lg"
      />
      <GameOverDialog
        open={gameEnded}
        victory={victory}
        stats={{
          level: hud.level,
          coins: hud.coins,
          score: hud.coins * 10 + (hud.level * 100),
        }}
        onRestart={handleRestart}
      />
    </div>
  );
};

export default MolaMolaGame;
