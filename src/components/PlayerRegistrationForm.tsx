
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/contexts/GameContext';
import { useTranslations } from '@/hooks/useTranslations';

interface PlayerRegistrationFormProps {
  onRegister: () => void;
}

const PlayerRegistrationForm = ({ onRegister }: PlayerRegistrationFormProps) => {
  const { language, setPlayerData } = useGame();
  const t = useTranslations(language);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ nickname: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { nickname: '', email: '' };
    
    if (!nickname.trim()) {
      newErrors.nickname = t.nicknameRequired;
    }
    
    if (!email.trim()) {
      newErrors.email = t.emailRequired;
    }
    
    if (newErrors.nickname || newErrors.email) {
      setErrors(newErrors);
      return;
    }
    
    setPlayerData({
      nickname: nickname.trim(),
      email: email.trim(),
      language
    });
    
    onRegister();
  };

  return (
    <div className="max-w-md mx-auto bg-black/70 p-8 rounded-lg border-2 border-yellow-400">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center font-mono">
        {t.playerRegistration}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white font-mono mb-2">
            {t.nickname}
          </label>
          <Input
            type="text"
            placeholder={t.enterNickname}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="bg-blue-900 border-blue-400 text-white placeholder-blue-300 font-mono"
          />
          {errors.nickname && (
            <p className="text-red-400 text-sm mt-1 font-mono">{errors.nickname}</p>
          )}
        </div>
        
        <div>
          <label className="block text-white font-mono mb-2">
            Email
          </label>
          <Input
            type="email"
            placeholder={t.enterEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-blue-900 border-blue-400 text-white placeholder-blue-300 font-mono"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1 font-mono">{errors.email}</p>
          )}
        </div>
        
        <Button 
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 font-mono"
        >
          {t.registerAndPlay}
        </Button>
      </form>
    </div>
  );
};

export default PlayerRegistrationForm;
