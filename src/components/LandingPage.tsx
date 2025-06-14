
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';
import PlayerRegistrationForm from './PlayerRegistrationForm';
import { Button } from '@/components/ui/button';
import LanguageSelector from './LanguageSelector';
import GuidoShrimpBlock from './GuidoShrimpBlock';
import AboutSection from './AboutSection';
import AddressSection from './AddressSection';

const LandingPage = ({
  onPlay
}: {
  onPlay: () => void;
}) => {
  const {
    language,
    setLanguage,
    playerData
  } = useGame();
  const t = useTranslations(language);
  const [view, setView] = useState<'language' | 'register' | 'ready'>('language');

  // Переключение вида в пошаговом режиме
  const handleStart = () => {
    setView('register');
  };

  // Сохраняем переход на игру после регистрации
  React.useEffect(() => {
    if (playerData && view !== 'ready') {
      setView('ready');
    }
  }, [playerData, view]);
  return (
    <div className="w-full h-screen min-h-screen overflow-y-auto bg-gradient-to-b from-blue-900 to-blue-700 flex justify-center px-2 py-6 md:py-10 relative">
      <div
        className="bg-black/80 rounded-xl shadow-xl max-w-xl w-full py-8 md:py-10 px-2 md:px-6 flex flex-col items-center gap-6 relative"
        style={{
          marginTop: 0,
          marginLeft: 0,
        }}
      >
        <div className="w-full flex flex-col items-center mb-2" style={{ minHeight: 48 }}>
          <div
            className="flex w-full justify-start items-center"
            style={{ marginBottom: '2px', maxWidth: '100%' }}
          >
            <span
              className="font-bold bg-cyan-900 border border-cyan-500 text-cyan-400 text-[11px] md:text-xs px-2 py-0.5 rounded-lg overflow-hidden"
              style={{
                letterSpacing: "0.01em",
                minWidth: 56,
                maxWidth: 78,
                width: "auto",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                lineHeight: 1.15,
                textAlign: "center",
                fontFamily: "inherit",
                fontWeight: 700,
                boxSizing: "border-box",
                display: "inline-block",
                marginLeft: 0,
                marginRight: 0,
              }}
              title="v.1.0"
            >
              v.1.0
            </span>
          </div>
          <h1
            className="text-2xl md:text-4xl text-yellow-400 font-bold text-center m-0 p-0 leading-tight overflow-hidden text-ellipsis whitespace-nowrap w-auto max-w-full"
            style={{ marginTop: "8px" }}
          >
            {t.title}
          </h1>
        </div>
        <img src="/lovable-uploads/ee8156f0-ed84-469d-b314-13a6aa436d63.png" alt="Mola Mola" className="w-[220px] h-24 mb-1 mx-auto object-contain" />
        {/* Language selector block */}
        <LanguageSelector language={language} setLanguage={setLanguage} />
        {/* Guido Shrimp block */}
        <GuidoShrimpBlock language={language} />
        {/* Кнопка начать операцию Букатини ПОД Guido Shrimp */}
        {view === 'ready' && (
          <Button
            onClick={onPlay}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 text-lg"
          >
            {t.startButton}
          </Button>
        )}
        {/* Форма регистрации ПОД Guido Shrimp */}
        {view === 'register' && <div className="w-full">
          <PlayerRegistrationForm />
        </div>}
        {view === 'language' && <Button onClick={handleStart} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 text-lg mb-2">
          {t.playButton}
        </Button>}
        <p className="text-white text-center text-md">{t.subtitle}</p>
        <AboutSection t={t} />
        <AddressSection t={t} />
      </div>
    </div>
  );
};

export default LandingPage;
