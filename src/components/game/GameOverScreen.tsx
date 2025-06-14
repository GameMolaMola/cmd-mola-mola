
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GameState } from './MolaMolaGame';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

const GameOverScreen = ({ gameState, onRestart }: GameOverScreenProps) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uniqueCode, setUniqueCode] = useState('');

  const handleSubmit = async () => {
    if (!nickname.trim() || !email.trim()) return;
    
    // Generate unique code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setUniqueCode(code);
    setIsSubmitted(true);
    
    // Here we would save to Supabase when tables are created
    console.log('Player registered:', { nickname, email, score: gameState.score, code });
  };

  if (isSubmitted) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black flex flex-col items-center justify-center text-white font-mono p-8">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-yellow-400">
            {gameState.isVictory ? '🎉 ПОБЕДА!' : '💀 ИГРА ОКОНЧЕНА'}
          </h1>
          
          <div className="bg-black/70 p-6 rounded-lg border-2 border-green-400">
            <h2 className="text-xl text-green-400 mb-4">Регистрация завершена!</h2>
            <div className="space-y-2 text-sm">
              <p>Ваш уникальный код:</p>
              <div className="text-2xl font-bold text-yellow-400 bg-black/50 p-3 rounded border">
                {uniqueCode}
              </div>
              <p className="text-cyan-300 text-xs">
                Сохраните этот код! Отправьте его на @commandermolamola для получения приза.
              </p>
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-lg border border-cyan-400">
            <div className="space-y-1 text-sm">
              <p>Игрок: {nickname}</p>
              <p>Финальный счет: {gameState.score}</p>
              <p>Уровень: {gameState.level}</p>
              <p>Монеты: {gameState.coins}</p>
            </div>
          </div>

          <Button 
            onClick={onRestart}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3"
          >
            Играть снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black flex flex-col items-center justify-center text-white font-mono p-8">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-3xl font-bold text-yellow-400">
          {gameState.isVictory ? '🎉 ПОБЕДА!' : '💀 ИГРА ОКОНЧЕНА'}
        </h1>
        
        <div className="bg-black/50 p-4 rounded-lg border border-cyan-400">
          <div className="space-y-1 text-sm">
            <p>Финальный счет: {gameState.score}</p>
            <p>Уровень: {gameState.level}</p>
            <p>Собрано монет: {gameState.coins}</p>
          </div>
        </div>

        <div className="bg-black/70 p-6 rounded-lg border-2 border-yellow-400">
          <h2 className="text-xl text-yellow-400 mb-4">Регистрация игрока</h2>
          <div className="space-y-4">
            <Input
              placeholder="Введите ваш никнейм"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-blue-900 border-blue-400 text-white placeholder-blue-300"
            />
            <Input
              type="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-blue-900 border-blue-400 text-white placeholder-blue-300"
            />
            <div className="text-xs text-cyan-300">
              Email нужен для связи с вами в случае выигрыша
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleSubmit}
            disabled={!nickname.trim() || !email.trim()}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3"
          >
            Зарегистрировать результат
          </Button>
          
          <Button 
            onClick={onRestart}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3"
          >
            Играть снова
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
