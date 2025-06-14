
import React from "react";
import { Button } from "@/components/ui/button";

const LANGS = [
  { value: "it", label: "Italiano" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

export default function LanguageSelector({
  language,
  setLanguage,
}: {
  language: string;
  setLanguage: (lang: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap justify-center items-center gap-2 mb-2 w-full"
      style={{
        maxWidth: 220,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {LANGS.map((lang) => (
        <Button
          variant="ghost"
          key={lang.value}
          onClick={() => setLanguage(lang.value)}
          className={
            (language === lang.value
              ? "bg-[#212334] text-white font-[Georgia,serif] shadow-lg border border-cyan-400"
              : "bg-[#11121a]/75 text-gray-400 font-[Georgia,serif] hover:bg-[#23253a] hover:text-white border border-transparent") +
            " px-3 py-1 md:px-5 md:py-2 text-base md:text-lg transition-all duration-200 rounded-md"
          }
          style={{
            fontWeight: language === lang.value ? 600 : 400,
            letterSpacing: "0.02em",
          }}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
}
