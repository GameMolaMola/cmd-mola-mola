
import MolaMolaGame from '@/components/game/MolaMolaGame';
import { useLocation } from 'react-router-dom';

const Game = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const autoStart = params.get('autostart') === '1';

  // Для мобильных: делаем fullscreen блок и убираем внутренние скроллы
  return (
    <div
      className="fixed inset-0 z-0 bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center p-0"
      style={{ touchAction: 'none', overflow: 'hidden', minHeight: '100dvh', minWidth: '100vw' }}
    >
      <MolaMolaGame autoStart={autoStart} />
    </div>
  );
};

export default Game;
