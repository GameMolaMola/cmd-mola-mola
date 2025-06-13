
import React from 'react';
import { Button } from '@/components/ui/button';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-800 to-blue-900 flex flex-col items-center justify-center text-white font-mono">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 animate-pulse">
          🐟 COMMANDER MOLA MOLA 🐟
        </h1>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-cyan-400">
          <h2 className="text-xl text-cyan-400 mb-4">УПРАВЛЕНИЕ:</h2>
          <div className="space-y-2 text-sm">
            <p>⬆️ W/↑ - ПРЫЖОК</p>
            <p>⬅️➡️ A/D/←/→ - ДВИЖЕНИЕ</p>
            <p>🚀 ПРОБЕЛ - ОГОНЬ</p>
          </div>
        </div>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-yellow-400">
          <h2 className="text-xl text-yellow-400 mb-4">СОБИРАЙ:</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>🪙 МОНЕТЫ MOLA MOLA</div>
            <div>🍕 ПИЦЦА МАРГАРИТА</div>
            <div>🧃 BRASILENA</div>
            <div>🍷 VINO MADRE GOCCIA</div>
          </div>
        </div>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-red-400">
          <h2 className="text-xl text-red-400 mb-4">ЭФФЕКТЫ:</h2>
          <div className="space-y-2 text-sm">
            <p>🍕 Пицца: +20 здоровья</p>
            <p>🧃 Brasilena: +10 патронов</p>
            <p>🍷 Вино: ускорение на 5 сек</p>
          </div>
        </div>
        
        <Button 
          onClick={onStart}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg animate-bounce"
        >
          START OPERATION BUCATINI!
        </Button>
        
        <div className="text-xs text-cyan-300">
          Приключение в морях Калабрии ждет тебя!
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
