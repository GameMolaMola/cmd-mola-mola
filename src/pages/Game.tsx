
import MolaMolaGame from '@/components/game/MolaMolaGame';
import { useLocation } from 'react-router-dom';

const Game = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const autoStart = params.get('autostart') === '1';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <MolaMolaGame autoStart={autoStart} />
    </div>
  );
};

export default Game;
