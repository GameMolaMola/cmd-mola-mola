
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() === '') {
      setSubmitError(t.nicknameRequired || 'Nickname required');
      return;
    }
    if (email.trim() === '') {
      setSubmitError(t.emailRequired || 'Email required');
      return;
    }
    setPlayerData({ nickname, email, language });
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
      <input
        type="email"
        className="w-full rounded bg-blue-950/80 border border-cyan-300 px-3 py-2 text-white"
        placeholder={t.enterEmail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {submitError && <div className="text-red-400 text-sm">{submitError}</div>}
      <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2">
        {t.registerAndPlay}
      </Button>
    </form>
  );
};

export default PlayerRegistrationForm;
