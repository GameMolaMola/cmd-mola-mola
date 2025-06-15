
import React from 'react';
import { audioManager } from '../audioManager';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ isMuted, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center w-8 h-8 bg-gray-800/70 hover:bg-gray-700/70 rounded border border-gray-600 transition-colors"
      title={isMuted ? "Включить звук" : "Выключить звук"}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4 text-gray-300" />
      ) : (
        <Volume2 className="w-4 h-4 text-white" />
      )}
    </button>
  );
};

export default SoundToggle;
