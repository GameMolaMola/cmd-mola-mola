import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'ru' | 'en' | 'it';

export interface PlayerData {
  nickname: string;
  email: string;
  language: Language;
  godmode?: boolean;   // теперь спец-режим может быть сохранён
  markJump?: boolean;  // спец-флаг для особой способности
}

interface GameContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  playerData: PlayerData | null;
  setPlayerData: (data: PlayerData) => void;
  isRegistered: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('it');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);

  const isRegistered = !!playerData;

  // ЛОГ для контроля
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[GameProvider] language:', language);
    }
  }, [language]);

  return (
    <GameContext.Provider value={{
      language,
      setLanguage,
      playerData,
      setPlayerData,
      isRegistered
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
