
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const translations = {
  en: {
    title: "🐟 COMMANDER MOLA MOLA 🐟",
    subtitle: "Adventure in the seas of Calabria awaits you!",
    description: "Dive into an epic underwater pixel adventure where you control Commander Mola Mola through the dangerous waters of Calabria. Collect coins, defeat enemies, and survive the depths!",
    playButton: "PLAY NOW",
    aboutTitle: "About the Game",
    aboutText: "Commander Mola Mola is a retro-style underwater adventure game featuring classic pixel art graphics and exciting gameplay mechanics.",
    addressTitle: "Contact Us",
    address: "Via Roma 123, Cosenza, Calabria, Italy",
    email: "commandermolamola@gmail.com",
    features: [
      "🎮 Classic pixel art graphics",
      "🌊 Underwater adventure",
      "🪙 Collect Mola Mola coins",
      "🍕 Italian food power-ups",
      "🚀 Epic boss battles"
    ]
  },
  it: {
    title: "🐟 COMMANDER MOLA MOLA 🐟",
    subtitle: "L'avventura nei mari della Calabria ti aspetta!",
    description: "Immergiti in un'epica avventura subacquea pixel dove controlli Commander Mola Mola attraverso le acque pericolose della Calabria. Raccogli monete, sconfiggi nemici e sopravvivi agli abissi!",
    playButton: "GIOCA ORA",
    aboutTitle: "Sul Gioco",
    aboutText: "Commander Mola Mola è un gioco d'avventura subacquea in stile retrò con grafica pixel art classica e meccaniche di gioco emozionanti.",
    addressTitle: "Contattaci",
    address: "Via Roma 123, Cosenza, Calabria, Italia",
    email: "commandermolamola@gmail.com",
    features: [
      "🎮 Grafica pixel art classica",
      "🌊 Avventura subacquea",
      "🪙 Raccogli monete Mola Mola",
      "🍕 Power-up di cibo italiano",
      "🚀 Battaglie epiche con boss"
    ]
  },
  ru: {
    title: "🐟 COMMANDER MOLA MOLA 🐟",
    subtitle: "Приключение в морях Калабрии ждет тебя!",
    description: "Погрузись в эпическое подводное пиксельное приключение, где ты управляешь Командиром Мола Мола через опасные воды Калабрии. Собирай монеты, побеждай врагов и выживай в глубинах!",
    playButton: "ИГРАТЬ СЕЙЧАС",
    aboutTitle: "О Игре",
    aboutText: "Commander Mola Mola - это подводная приключенческая игра в ретро стиле с классической пиксельной графикой и захватывающими игровыми механиками.",
    addressTitle: "Свяжитесь с нами",
    address: "Via Roma 123, Козенца, Калабрия, Италия",
    email: "commandermolamola@gmail.com",
    features: [
      "🎮 Классическая пиксельная графика",
      "🌊 Подводное приключение",
      "🪙 Собирай монеты Мола Мола",
      "🍕 Усиления итальянской еды",
      "🚀 Эпические битвы с боссами"
    ]
  }
};

const LandingPage = () => {
  const [language, setLanguage] = useState('ru');
  const t = (translations as any)[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-yellow-400 font-mono">
              {t.title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Select onValueChange={(value) => setLanguage(value)} defaultValue={language}>
              <SelectTrigger className="w-[180px] bg-blue-800 border-blue-400 text-white">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="bg-blue-800 text-white border-blue-400">
                <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="it">🇮🇹 Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold text-yellow-400 mb-6 font-mono animate-pulse">
            {t.title}
          </h2>
          <p className="text-xl text-cyan-300 mb-8 font-mono">
            {t.subtitle}
          </p>
          <p className="text-lg text-white mb-12 max-w-2xl mx-auto leading-relaxed">
            {t.description}
          </p>
          
          <Link to="/game">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-12 py-6 text-xl animate-bounce">
              {t.playButton}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-cyan-400 mb-12 font-mono">
            {t.aboutTitle}
          </h3>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-white text-lg mb-8 leading-relaxed">
                {t.aboutText}
              </p>
              <ul className="space-y-4">
                {t.features.map((feature: string, index: number) => (
                  <li key={index} className="text-cyan-300 font-mono text-lg">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-black/50 p-8 rounded-lg border-2 border-cyan-400">
              <div className="text-center">
                <div className="text-6xl mb-4">🐟</div>
                <p className="text-yellow-400 font-mono text-xl">
                  Commander Mola Mola
                </p>
                <p className="text-cyan-300 font-mono">
                  Pixel Adventure
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-cyan-400 mb-8 font-mono">
            {t.addressTitle}
          </h3>
          <div className="bg-black/50 p-8 rounded-lg border-2 border-yellow-400">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">📍</span>
                <p className="text-white font-mono">{t.address}</p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">📧</span>
                <p className="text-cyan-300 font-mono">{t.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center">
        <p className="text-cyan-400 font-mono">
          © 2024 Commander Mola Mola. Made with ❤️ in Calabria, Italy
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
