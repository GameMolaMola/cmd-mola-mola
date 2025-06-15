
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameState } from './types';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  isWin: boolean;
  gameState: GameState;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, isWin, gameState }) => {
  const { language, playerData } = useGame();
  const t = useTranslations(language);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uniqueCode, setUniqueCode] = useState('');
  const [emailSent, setEmailSent] = useState<"pending" | "sent" | "error" | null>(null);

  const title = isWin ? t.gameWinTitle : t.gameOverTitle;
  const message = isWin ? t.winFinalScoreMessage(score) : t.finalScoreMessage(score);
  const buttonText = isWin ? t.playAgainButton : t.restartButton;

  const handleSubmit = async () => {
    if (!playerData) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setUniqueCode(code);
    setIsSubmitted(true);

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
            code,
            language: playerData.language,
            level: gameState.level,
            coins: gameState.coins
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

    console.log("Player registered & email sent (attempted):", { 
      nickname: playerData.nickname, 
      email: playerData.email, 
      code,
      language: playerData.language,
      level: gameState.level,
      coins: gameState.coins
    });
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white font-mono z-20">
      <h1 className="text-5xl font-bold text-red-500 mb-6 animate-bounce">{title}</h1>
      <p className="text-xl mb-8">{message}</p>
      
      {playerData && playerData.nickname && playerData.email && !isSubmitted && (
        <Button onClick={handleSubmit} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-xl">
          Submit Score
        </Button>
      )}
      {isSubmitted && (
        <div className="mt-4 text-center">
          <p className="text-lg">Your unique code: <span className="font-bold text-yellow-400">{uniqueCode}</span></p>
          {emailSent === "pending" && <p className="text-sm mt-2">Sending email...</p>}
          {emailSent === "sent" && <p className="text-sm mt-2 text-green-400">Email sent successfully!</p>}
          {emailSent === "error" && <p className="text-sm mt-2 text-red-400">Failed to send email. Please try again later.</p>}
        </div>
      )}

      <Button 
        onClick={onRestart}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-xl"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default GameOverScreen;
