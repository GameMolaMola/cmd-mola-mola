import React from "react";
import AboutSection from "@/components/AboutSection";
import { useGame } from "@/contexts/GameContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  const { language } = useGame();
  const t = useTranslations(language);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700 px-2">
      <div className="bg-black/80 rounded-xl shadow-xl max-w-xl w-full py-8 px-4 md:px-8 flex flex-col items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6 drop-shadow-lg">
          {t.aboutTitle}
        </h1>
        <AboutSection t={t} />
        <Link to="/">
          <Button className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-8 py-2 text-lg">
            ← Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default About;
