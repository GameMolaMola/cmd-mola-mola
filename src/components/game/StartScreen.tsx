
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StartScreenProps {
  onStart: () => void;
}

const translations = {
  en: {
    title: "🐟 COMMANDER MOLA MOLA 🐟",
    controlsHeader: "CONTROLS:",
    jump: "⬆️ W/↑ - JUMP",
    move: "⬅️➡️ A/D/←/→ - MOVE",
    fire: "🚀 SPACE - FIRE",
    collectHeader: "COLLECT:",
    coins: "🪙 MOLA MOLA COINS",
    pizza: "🍕 MARGHERITA PIZZA",
    brasilena: "🧃 BRASILENA",
    wine: "🍷 MADRE GOCCIA WINE",
    effectsHeader: "EFFECTS:",
    pizzaEffect: "🍕 Pizza: +20 health",
    brasilenaEffect: "🧃 Brasilena: +10 ammo",
    wineEffect: "🍷 Wine: speed boost for 5 sec",
    startButton: "START OPERATION BUCATINI!",
    subtitle: "Adventure in the seas of Calabria awaits you!"
  },
  it: {
    title: "🐟 COMMANDER MOLA MOLA 🐟",
    controlsHeader: "CONTROLLI:",
    jump: "⬆️ W/↑ - SALTA",
    move: "⬅️➡️ A/D/←/→ - MUOVI",
    fire: "🚀 SPAZIO - SPARA",
    collectHeader: "RACCOGLI:",
    coins: "🪙 MONETE MOLA MOLA",
    pizza: "🍕 PIZZA MARGHERITA",
    brasilena: "🧃 BRASILENA",
    wine: "🍷 VINO MADRE GOCCIA",
    effectsHeader: "EFFETTI:",
    pizzaEffect: "🍕 Pizza: +20 salute",
    brasilenaEffect: "🧃 Brasilena: +10 munizioni",
    wineEffect: "🍷 Vino: velocità +5 sec",
    startButton: "INIZIA OPERAZIONE BUCATINI!",
    subtitle: "L'avventura nei mari della Calabria ti aspetta!"
  },
  ru: {
    title: "🐟 COMMANDER MOLA MOLA 🐟",
    controlsHeader: "УПРАВЛЕНИЕ:",
    jump: "⬆️ W/↑ - ПРЫЖОК",
    move: "⬅️➡️ A/D/←/→ - ДВИЖЕНИЕ",
    fire: "🚀 ПРОБЕЛ - ОГОНЬ",
    collectHeader: "СОБИРАЙ:",
    coins: "🪙 МОНЕТЫ MOLA MOLA",
    pizza: "🍕 ПИЦЦА МАРГАРИТА",
    brasilena: "🧃 BRASILENA",
    wine: "🍷 VINO MADRE GOCCIA",
    effectsHeader: "ЭФФЕКТЫ:",
    pizzaEffect: "🍕 Пицца: +20 здоровья",
    brasilenaEffect: "🧃 Brasilena: +10 патронов",
    wineEffect: "🍷 Вино: ускорение на 5 сек",
    startButton: "НАЧАТЬ ОПЕРАЦИЮ БУКАТИНИ!",
    subtitle: "Приключение в морях Калабрии ждет тебя!"
  }
};

const StartScreen = ({ onStart }: StartScreenProps) => {
  const [language, setLanguage] = useState('ru');
  const t = (translations as any)[language];

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-800 to-blue-900 flex flex-col items-center justify-center text-white font-mono">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 animate-pulse">
          {t.title}
        </h1>
        
        <div className="mb-4">
          <Select onValueChange={(value) => setLanguage(value)} defaultValue={language}>
            <SelectTrigger className="w-[180px] mx-auto bg-blue-700 border-blue-400 text-white">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent className="bg-blue-800 text-white border-blue-400">
              <SelectItem value="ru">🇷🇺 Русский</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
              <SelectItem value="it">🇮🇹 Italiano</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-cyan-400">
          <h2 className="text-xl text-cyan-400 mb-4">{t.controlsHeader}</h2>
          <div className="space-y-2 text-sm">
            <p>{t.jump}</p>
            <p>{t.move}</p>
            <p>{t.fire}</p>
          </div>
        </div>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-yellow-400">
          <h2 className="text-xl text-yellow-400 mb-4">{t.collectHeader}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>{t.coins}</div>
            <div>{t.pizza}</div>
            <div>{t.brasilena}</div>
            <div>{t.wine}</div>
          </div>
        </div>
        
        <div className="bg-black/50 p-6 rounded-lg border-2 border-red-400">
          <h2 className="text-xl text-red-400 mb-4">{t.effectsHeader}</h2>
          <div className="space-y-2 text-sm">
            <p>{t.pizzaEffect}</p>
            <p>{t.brasilenaEffect}</p>
            <p>{t.wineEffect}</p>
          </div>
        </div>
        
        <Button 
          onClick={onStart}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg animate-bounce"
        >
          {t.startButton}
        </Button>
        
        <div className="text-xs text-cyan-300">
          {t.subtitle}
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
