import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';
import PlayerRegistrationForm from './PlayerRegistrationForm';
import { Button } from '@/components/ui/button';
import { Youtube } from 'lucide-react';

const LANGS = [{
  value: 'it',
  label: 'Italiano'
}, {
  value: 'ru',
  label: 'Русский'
}, {
  value: 'en',
  label: 'English'
}];
const DONATE_URL = "https://buymeacoffee.com/com.molamola";

// Icon SVGs for TikTok and Linktree (simple versions)
const TikTokIcon = ({className = "w-5 h-5"}) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M25.829 10.785a6.515 6.515 0 0 1-2.135-4.704l-.038-2.05h-4.143v17.236a3.03 3.03 0 1 1-3.036-3.03 3.01 3.01 0 0 1 1.343.314v-4.33a7.35 7.35 0 0 0-1.343-.132 7.362 7.362 0 1 0 7.367 7.36V14.159a10.626 10.626 0 0 0 4.143 1.024v-4.05a6.664 6.664 0 0 1-2.158-.348z"/>
  </svg>
);

// Старая LinkIcon больше не нужна для bit.ly

const BitlyIcon = ({className = "w-5 h-5"}) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#ee6123"/>
    <path d="M22.414 40.748c0-1.676 1.113-2.797 2.864-2.797 1.579 0 2.65 1.03 2.65 2.797 0 1.753-1.071 2.784-2.65 2.784-1.751 0-2.864-1.108-2.864-2.784zm12.682.036c0-1.676 1.113-2.797 2.864-2.797 1.579 0 2.65 1.03 2.65 2.797 0 1.753-1.071 2.784-2.65 2.784-1.751 0-2.864-1.108-2.864-2.784zm-3.119-12.178c3.455 0 6.105 1.911 6.218 5.395h-4.633c-.162-1.206-.837-1.984-2.629-1.984-1.39 0-2.303.658-2.303 1.638 0 1.03 1.16 1.396 2.792 1.513 4.19.293 6.923 1.361 6.923 5.252 0 3.223-2.781 5.215-7.128 5.215-4.025 0-6.503-1.892-6.707-5.22h4.531c.121 1.17.938 1.892 2.496 1.892 1.335 0 2.164-.579 2.164-1.529 0-.989-1.002-1.436-2.778-1.539-4.119-.232-6.793-1.286-6.793-5.042 0-3.069 2.529-5.029 7.044-5.029z" fill="#fff"/>
  </svg>
);

const LinkIcon = ({className = "w-5 h-5"}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 1 7 7l-3 3a5 5 0 0 1-7-7"/>
    <path d="M14 11a5 5 0 0 0-7-7l-3 3a5 5 0 0 0 7 7"/>
  </svg>
);

const BookIcon = ({className = "w-5 h-5"}) => (
  <span role="img" aria-label="Comic" className={className}>📖</span>
);

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
  return <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center px-4 relative">
      <div className="bg-black/80 rounded-xl shadow-xl max-w-xl w-full py-10 px-6 flex flex-col items-center gap-6">
        {/* Название в самом верху */}
        <h1 className="text-3xl md:text-4xl text-yellow-400 mb-2 font-bold text-center">{t.title}</h1>
        {/* Картинка с фиксированными размерами и корректным масштабированием */}
        <img src="/lovable-uploads/ee8156f0-ed84-469d-b314-13a6aa436d63.png" alt="Mola Mola" className="w-[220px] h-24 mb-1 mx-auto object-contain" />
        {/* Language selector block */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-2 w-full" style={{
        maxWidth: 220,
        // В соответствии с шириной изображения
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
          {LANGS.map(lang => <Button variant="ghost" key={lang.value} onClick={() => setLanguage(lang.value as any)} className={(language === lang.value ? "bg-[#212334] text-white font-[Georgia,serif] shadow-lg border border-cyan-400" : "bg-[#11121a]/75 text-gray-400 font-[Georgia,serif] hover:bg-[#23253a] hover:text-white border border-transparent") + " px-3 py-1 md:px-5 md:py-2 text-base md:text-lg transition-all duration-200 rounded-md"} style={{
          fontWeight: language === lang.value ? 600 : 400,
          letterSpacing: "0.02em"
        }}>
              {lang.label}
            </Button>)}
        </div>
        {/* End language selector */}

        {view === 'language' && <Button onClick={handleStart} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 text-lg mb-2">
            {t.playButton}
          </Button>}
        <p className="text-white text-center text-md">{t.subtitle}</p>
        <div className="bg-blue-950/70 border border-cyan-400 p-4 rounded-lg w-full mb-2">
          <h2 className="text-cyan-200 font-semibold mb-2">{t.aboutTitle}</h2>
          <p className="text-white/90 text-sm">{t.description || t.aboutText}</p>
          <ul className="list-disc ml-5 mt-2 text-cyan-100 text-sm">
            {t.features?.map?.((f: string, idx: number) =>
              // Показываем свою иконку если строка - монеты Mola Mola
              typeof f === 'string' && (
                (f.includes('монеты Mola Mola') || f.includes('monete Mola Mola') || f.includes('Mola Mola coins'))
                ? <li key={idx} className="flex items-center gap-2">
                    <img src="/lovable-uploads/00354654-8e2c-4993-8167-a9e91aef0d44.png" alt="Mola Mola Coin" className="inline w-5 h-5 object-contain mr-1" />
                    <span>{f.replace(/[🪙]/g, '').trim()}</span>
                  </li>
                : <li key={idx}>{f}</li>
              )
            )}
          </ul>
        </div>
        <div className="bg-blue-800/70 border border-yellow-400 p-4 rounded-lg w-full mb-4">
          <h2 className="text-yellow-300 font-semibold mb-1">{t.addressTitle}</h2>
          <div className="text-white/80">{t.address}</div>
          <a href={`mailto:${t.email}`} className="text-cyan-300 hover:underline block mt-1">{t.email}</a>
          <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 px-5 py-2 rounded-full font-semibold text-white shadow-md text-base bg-pink-600 hover:bg-pink-700 border border-yellow-300 transition animate-[pulse_2.2s_cubic-bezier(0.4,0,0.6,1)_infinite] select-none" style={{
          minWidth: "100px",
          animation: 'pulse 2.2s cubic-bezier(0.4,0,0.6,1) infinite'
        }}>
            <span>{t.donateButton}</span>
            <img src="/lovable-uploads/63f3c1bb-af9c-4c63-86ae-a15bc687d8a8.png" alt="Donate Cup" className="w-[20px] h-[20px] object-contain" style={{
            marginLeft: "4px"
          }} />
          </a>
          {/* Social/media icon links */}
          <div className="flex justify-center gap-4 mt-6">
            {/* Comic link */}
            <a
              href="https://www.webtoons.com/en/canvas/commander-mola-mola-operation-bucatini/list?title_no=1062681"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Commander Mola Mola Comic"
              className="text-yellow-300 bg-[#2d3751] rounded-full p-2 hover:bg-yellow-100 hover:text-blue-900 transition"
            >
              <BookIcon />
            </a>
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@commandermolamola"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-cyan-300 bg-[#132732] rounded-full p-2 hover:bg-white hover:text-black transition"
            >
              <TikTokIcon />
            </a>
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@CommanderMolaMola"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-red-500 bg-[#1a1919] rounded-full p-2 hover:bg-red-100 hover:text-red-700 transition"
            >
              <Youtube className="w-5 h-5" />
            </a>
            {/* Linktree/Bitly with Bitly Icon */}
            <a
              href="https://bit.ly/m/CommanderMolaMola"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bitly"
              className="bg-[#fff6eb] text-[#ee6123] rounded-full p-2 hover:bg-orange-100 hover:text-orange-700 transition"
            >
              <BitlyIcon />
            </a>
          </div>
        </div>
        {view === 'register' && <div className="w-full">
            <PlayerRegistrationForm />
          </div>}
        {view === 'ready' && <Button onClick={onPlay} className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 text-lg">
            {t.startButton}
          </Button>}
      </div>
    </div>;
};

export default LandingPage;
