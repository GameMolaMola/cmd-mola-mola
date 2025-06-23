
import React from "react";

const GUIDO_MESSAGES = {
  en: "Guido Shrimp greets you!",
  ru: "Гвидо Креветка приветствует тебя!",
  it: "Guido Shrimp ti saluta!",
};

export default function GuidoShrimpBlock({ language }: { language: string }) {
  return (
    <div className="w-full flex justify-center my-3">
      <div
        className="
          bg-blue-950/80 
          border-2 border-yellow-300 
          rounded-xl 
          py-3 
          flex flex-row items-center gap-3 shadow-md 
          max-w-md mx-auto select-none
          overflow-hidden
          "
        style={{
          // 5мм минимум ≈ 20px
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <img
          // оригинальное webp изображение отсутствует
          src="/uploads/9132b9d8-ab25-44a7-81ec-031ebfbb97e6.png"
          alt="Guido Shrimp"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-yellow-300 bg-black"
          style={{ flexShrink: 0, aspectRatio: "1/1", objectFit: "cover" }}
          loading="lazy"
        />
        <span
          className="
            text-base md:text-lg font-semibold text-yellow-200 
            break-words 
            whitespace-normal 
            w-full
            "
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          {GUIDO_MESSAGES[language as keyof typeof GUIDO_MESSAGES] || "Guido Shrimp!"}
        </span>
      </div>
    </div>
  );
}
