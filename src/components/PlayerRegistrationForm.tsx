
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';

const PlayerRegistrationForm = () => {
  const { language, setPlayerData } = useGame();
  const t = useTranslations(language);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Определяем режим "бог" по никнейму
  const godmode = nickname.trim() === '@MolaMolaCoin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() === '') {
      setSubmitError(t.nicknameRequired || 'Nickname required');
      return;
    }
    // email обязателен только если не godmode
    if (!godmode && email.trim() === '') {
      setSubmitError(t.emailRequired || 'Email required');
      return;
    }
    // Вместо email подставим "-" если godmode и ничего не введено
    setPlayerData({
      nickname,
      email: godmode ? '-' : email,
      language,
      // явно прокидываем godmode
      godmode,
    } as any); // тип расширяем для godmode (или добавить в контекст новый тип, если нужно)
    setSubmitError('');
  };

  return (
    <form className="flex flex-col items-center gap-4" onSubmit={handleSubmit}>
      <input
        type="text"
        className="w-full rounded bg-blue-950/80 border border-cyan-300 px-3 py-2 text-white"
        placeholder={t.enterNickname}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        required
      />
      {/* email не требуется если режим бога */}
      {!godmode && (
        <input
          type="email"
          className="w-full rounded bg-blue-950/80 border border-cyan-300 px-3 py-2 text-white"
          placeholder={t.enterEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      )}
      {submitError && <div className="text-red-400 text-sm">{submitError}</div>}
      {godmode && (
        <div className="text-cyan-300 text-xs font-mono mb-2">
          GODMODE ACTIVATED 🦈<br />Вы бессмертны!
        </div>
      )}
      <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2">
        {t.registerAndPlay}
      </Button>
    </form>
  );
};

export default PlayerRegistrationForm;
