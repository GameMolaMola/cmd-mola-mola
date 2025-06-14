
import React from "react";

const GUIDO_MESSAGES = {
  en: "Guido Shrimp greets you!",
  ru: "Гвидо Креветка приветствует тебя!",
  it: "Guido Shrimp ti saluta!",
};

export default function GuidoShrimpBlock({ language }: { language: string }) {
  return (
    <div className="w-full flex justify-center my-3">
      <div className="bg-blue-950/80 border-2 border-yellow-300 rounded-xl p-3 flex flex-row items-center gap-2 shadow-md max-w-xs mx-auto select-none">
        <img
          src="/lovable-uploads/f3db5ddc-4774-4a77-a73a-b87832b655a1.png"
          alt="Guido Shrimp"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-yellow-300 bg-black"
          style={{ flexShrink: 0, aspectRatio: "1/1", objectFit: "cover" }}
          loading="lazy"
        />
        <span className="text-base md:text-lg font-semibold text-yellow-200 px-2 whitespace-nowrap">
          {GUIDO_MESSAGES[language as keyof typeof GUIDO_MESSAGES] ||
            "Guido Shrimp!"}
        </span>
      </div>
    </div>
  );
}
