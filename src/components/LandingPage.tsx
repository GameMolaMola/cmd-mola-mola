
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';
import PlayerRegistrationForm from './PlayerRegistrationForm';
import { Button } from '@/components/ui/button';

// Изменен порядок: Italiano, Русский, English
const LANGS = [
  { value: 'it', label: 'Italiano' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' }
];

const DONATE_URL = "https://buymeacoffee.com/com.molamola";

const LandingPage = ({ onPlay }: { onPlay: () => void }) => {
  const { language, setLanguage, playerData } = useGame();
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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center px-4 relative">
      <div className="bg-black/80 rounded-xl shadow-xl max-w-xl w-full py-10 px-6 flex flex-col items-center gap-6">
        <img src="/lovable-uploads/ee8156f0-ed84-469d-b314-13a6aa436d63.png" alt="Mola Mola" className="h-24 mb-1 mx-auto" />
        <h1 className="text-3xl md:text-4xl text-yellow-400 mb-2 font-bold text-center">{t.title}</h1>
        <div className="flex gap-3 mb-2">
          {LANGS.map((lang) =>
            <Button
              variant="ghost"
              key={lang.value}
              onClick={() => setLanguage(lang.value as any)}
              className={
                language === lang.value
                  ? "bg-[#212334] text-white font-[Georgia,serif] text-lg shadow-lg border border-cyan-400 px-7 py-2 transition-all duration-200 pointer-events-none"
                  : "bg-[#11121a]/75 text-gray-400 font-[Georgia,serif] text-lg hover:bg-[#23253a] hover:text-white px-7 py-2 border border-transparent"
              }
              style={{
                fontWeight: language === lang.value ? 600 : 400,
                letterSpacing: "0.02em",
                transition: "all 0.18s"
              }}
            >
              {lang.label}
            </Button>
          )}
        </div>
        {view === 'language' && (
          <Button
            onClick={handleStart}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 text-lg mb-2"
          >
            {t.playButton}
          </Button>
        )}
        <p className="text-white text-center text-md">{t.subtitle}</p>
        <div className="bg-blue-950/70 border border-cyan-400 p-4 rounded-lg w-full mb-2">
          <h2 className="text-cyan-200 font-semibold mb-2">{t.aboutTitle}</h2>
          <p className="text-white/90 text-sm">{t.description || t.aboutText}</p>
          <ul className="list-disc ml-5 mt-2 text-cyan-100 text-sm">
            {t.features?.map?.((f: string, idx: number) => <li key={idx}>{f}</li>)}
          </ul>
        </div>
        <div className="bg-blue-800/70 border border-yellow-400 p-4 rounded-lg w-full mb-4">
          <h2 className="text-yellow-300 font-semibold mb-1">{t.addressTitle}</h2>
          <div className="text-white/80">{t.address}</div>
          <a href={`mailto:${t.email}`} className="text-cyan-300 hover:underline block mt-1">{t.email}</a>
        </div>
        {view === 'register' && (
          <div className="w-full">
            <PlayerRegistrationForm />
          </div>
        )}
        {view === 'ready' && (
          <Button
            onClick={onPlay}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 text-lg"
          >
            {t.startButton}
          </Button>
        )}
      </div>

      {/* DONATE BUTTON */}
      <a
        href={DONATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-1 rounded-full font-semibold
                   text-white shadow-lg text-base bg-pink-600 hover:bg-pink-700
                   animate-pulse border border-yellow-300 transition
                   select-none flex items-center"
        style={{
          animation: 'pulse 1s infinite',
          minWidth: '100px',
          maxWidth: '160px'
        }}
      >
        <span>{t.donateButton}</span>
        <img
          src="/lovable-uploads/9b1300ba-7697-468a-991e-4c29d0a221a0.png"
          alt="Donate Cup"
          className="ml-1"
          style={{ height: "17px", width: "17px", objectFit: "contain" }}
        />
      </a>
    </div>
  );
};

export default LandingPage;

