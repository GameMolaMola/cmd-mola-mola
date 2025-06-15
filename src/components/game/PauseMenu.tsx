
import React from 'react';
import { Button } from '@/components/ui/button';

interface PauseMenuProps {
  onResume: () => void;
  onGameEnd: (victory: boolean, finalStats: any) => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onGameEnd }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-white text-2xl font-bold mb-4 text-center">Пауза</h2>
        <div className="flex flex-col gap-3">
          <Button
            onClick={onResume}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Продолжить
          </Button>
          <Button
            onClick={() => onGameEnd(false, { level: 1, coins: 0 })}
            variant="destructive"
          >
            Выйти из игры
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
