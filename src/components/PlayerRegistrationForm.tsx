
import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';
import type { PlayerData } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { isGodmodeUser } from '@/constants';

const SPECIAL_LOGIN = '@Molamola_9@';

const PlayerRegistrationForm = () => {
  const { language, setPlayerData } = useGame();
  const t = useTranslations(language);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [submitError, setSubmitError] = useState('');

  const godmode = isGodmodeUser(nickname.trim());
  // Новый спец-режим (Molamola Mark)
  const isMark = nickname.trim() === SPECIAL_LOGIN;

  // Всплывающее окно для Mark
  const [showMarkModal, setShowMarkModal] = useState(false);

  // Для автозапуска игры после спец-логина
  React.useEffect(() => {
    if (showMarkModal) {
      const timer = setTimeout(() => {
        setShowMarkModal(false);
        const data: PlayerData = {
          nickname: SPECIAL_LOGIN,
          email: '-',
          language,
          // Передаем индивидуальный спец-флаг
          markJump: true,
        };
        setPlayerData(data);
        setSubmitError('');
      }, 3000); // было 1700, стало 3000 мс (~3 секунды)
      return () => clearTimeout(timer);
    }
  }, [showMarkModal, setPlayerData, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() === '') {
      setSubmitError(t.nicknameRequired || 'Nickname required');
      return;
    }
    if (isMark) {
      setShowMarkModal(true);
      return;
    }
    if (!godmode && email.trim() === '') {
      setSubmitError(t.emailRequired || 'Email required');
      return;
    }
    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();
    const data: PlayerData = {
const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();
    const data: PlayerData = {
      nickname: trimmedNickname, // Используем уже обрезанный никнейм
      email: godmode ? '-' : trimmedEmail, // Используем уже обрезанный email
      language,
      godmode,
      ...(godmode ? { level: 10 } : {}),
    } as PlayerData;
      language,
      godmode,
      ...(godmode ? { level: 10 } : {}),
    } as PlayerData;
    setPlayerData(data);
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
      {/* email не требуется если режим бога или Mark */}
      {!godmode && !isMark && (
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
      {isMark && (
        <div className="text-cyan-200 text-xs mt-2 font-mono">Special power is waiting...</div>
      )}
      <Dialog open={showMarkModal} onOpenChange={(open) => setShowMarkModal(open)}>
        <DialogContent className="flex flex-col items-center gap-6 bg-black/90 border-cyan-400">
          <img src="/lovable-uploads/64235a5a-8a4e-4fac-83fe-14e82ff1bba0.png" alt="Molamola Mark" className="w-40 h-40 object-contain mx-auto" />
          <div className="text-2xl text-yellow-300 font-bold text-center animate-bounce mb-2">CIAO MARK!!!</div>
          <Button
            autoFocus
            onClick={() => {
              setShowMarkModal(false);
              const markData: PlayerData = {
                nickname: SPECIAL_LOGIN,
                email: '-',
                language,
                markJump: true,
              };
              setPlayerData(markData);
              setSubmitError('');
            }}
            className="bg-cyan-500 hover:bg-cyan-600 mt-2"
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default PlayerRegistrationForm;

