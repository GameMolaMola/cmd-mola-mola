
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameState } from './types';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

const GameOverScreen = ({ gameState, onRestart }: GameOverScreenProps) => {
  const { language, playerData } = useGame();
  const t = useTranslations(language);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uniqueCode, setUniqueCode] = useState('');
  const [emailSent, setEmailSent] = useState<"pending" | "sent" | "error" | null>(null);

  const handleSubmit = async () => {
    if (!playerData) return;
    
    // Генерируем уникальный код
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setUniqueCode(code);
    setIsSubmitted(true);

    // Отправляем на Supabase Edge Function для email уведомления
    setEmailSent("pending");
    try {
      const res = await fetch(
        "https://smdjmmefqherrlxcqfhp.supabase.co/functions/v1/send-new-player-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname: playerData.nickname,
            email: playerData.email,
            score: gameState.score,
            code,
            language: playerData.language,
          }),
        }
      );
      if (res.ok) {
        setEmailSent("sent");
      } else {
        setEmailSent("error");
      }
    } catch (e) {
      setEmailSent("error");
    }

    // ... логируем для отладки
    console.log("Player registered & email sent (attempted):", { 
      nickname: playerData.nickname, 
      email: playerData.email, 
      score: gameState.score, 
      code,
      language: playerData.language 
    });
  };

  if (isSubmitted) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black flex flex-col items-center justify-center text-white font-mono p-8">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-yellow-400">
            {gameState.isVictory ? t.victory : t.gameOver}
          </h1>
          
          <div className="bg-black/70 p-6 rounded-lg border-2 border-green-400">
            <h2 className="text-xl text-green-400 mb-4">{t.registrationCompleted}</h2>
            <div className="space-y-2 text-sm">
              <p>{t.uniqueCode}</p>
              <div className="text-2xl font-bold text-yellow-400 bg-black/50 p-3 rounded border">
                {uniqueCode}
              </div>
              {emailSent === "pending" && (<div className="text-cyan-300 text-xs">{t.sendingEmail || "Отправка сообщения..."}</div>)}
              {emailSent === "sent" && (<div className="text-green-300 text-xs">{t.emailSentSuccess || "Уведомление администратору отправлено!"}</div>)}
              {emailSent === "error" && (<div className="text-red-400 text-xs">{t.emailSentError || "Ошибка отправки уведомления админу."}</div>)}
              <p className="text-cyan-300 text-xs">
                {t.saveCode}
              </p>
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-lg border border-cyan-400">
            <div className="space-y-1 text-sm">
              <p>{t.player}: {playerData?.nickname}</p>
              <p>{t.finalScore}: {gameState.score}</p>
              <p>{t.level}: {gameState.level}</p>
              <p>{t.coins}: {gameState.coins}</p>
            </div>
          </div>

          <Button 
            onClick={onRestart}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3"
          >
            {t.playAgain}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black flex flex-col items-center justify-center text-white font-mono p-8">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-3xl font-bold text-yellow-400">
          {gameState.isVictory ? t.victory : t.gameOver}
        </h1>
        
        <div className="bg-black/50 p-4 rounded-lg border border-cyan-400">
          <div className="space-y-1 text-sm">
            <p>{t.finalScore}: {gameState.score}</p>
            <p>{t.level}: {gameState.level}</p>
            <p>{t.coins}: {gameState.coins}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3"
          >
            {t.registerAndPlay}
          </Button>
          
          <Button 
            onClick={onRestart}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3"
          >
            {t.playAgain}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
