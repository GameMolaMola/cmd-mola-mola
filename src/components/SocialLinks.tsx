
import React from "react";
import { Youtube } from "lucide-react";

const TikTokIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M25.829 10.785a6.515 6.515 0 0 1-2.135-4.704l-.038-2.05h-4.143v17.236a3.03 3.03 0 1 1-3.036-3.03 3.01 3.01 0 0 1 1.343.314v-4.33a7.35 7.35 0 0 0-1.343-.132 7.362 7.362 0 1 0 7.367 7.36V14.159a10.626 10.626 0 0 0 4.143 1.024v-4.05a6.664 6.664 0 0 1-2.158-.348z"/>
  </svg>
);
const BitlyIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#ee6123"/>
    <path d="M22.414 40.748c0-1.676 1.113-2.797 2.864-2.797 1.579 0 2.65 1.03 2.65 2.797 0 1.753-1.071 2.784-2.65 2.784-1.751 0-2.864-1.108-2.864-2.784zm12.682.036c0-1.676 1.113-2.797 2.864-2.797 1.579 0 2.65 1.03 2.65 2.797 0 1.753-1.071 2.784-2.65 2.784-1.751 0-2.864-1.108-2.864-2.784zm-3.119-12.178c3.455 0 6.105 1.911 6.218 5.395h-4.633c-.162-1.206-.837-1.984-2.629-1.984-1.39 0-2.303.658-2.303 1.638 0 1.03 1.16 1.396 2.792 1.513 4.19.293 6.923 1.361 6.923 5.252 0 3.223-2.781 5.215-7.128 5.215-4.025 0-6.503-1.892-6.707-5.22h4.531c.121 1.17.938 1.892 2.496 1.892 1.335 0 2.164-.579 2.164-1.529 0-.989-1.002-1.436-2.778-1.539-4.119-.232-6.793-1.286-6.793-5.042 0-3.069 2.529-5.029 7.044-5.029z" fill="#fff"/>
  </svg>
);

const WebtoonIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="80" height="80" rx="16" fill="#00D564"/>
    <path d="M54 22L25 29.5V56L47.5 54L49.5 61L55.5 56.5V26.5L54 22Z" fill="white"/>
    <text x="31" y="45" fill="#00D564" fontFamily="Arial Black, Arial, sans-serif" fontWeight="bold" fontSize="14" >WEB</text>
    <text x="31.5" y="58" fill="#00D564" fontFamily="Arial Black, Arial, sans-serif" fontWeight="bold" fontSize="13">TOON</text>
  </svg>
);

export default function SocialLinks() {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <a
        href="https://www.webtoons.com/en/canvas/commander-mola-mola-operation-bucatini/list?title_no=1062681"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Commander Mola Mola Comic"
        className="bg-[#00d564] rounded-full p-2 hover:bg-green-300 transition"
      >
        <WebtoonIcon />
      </a>
      <a
        href="https://www.tiktok.com/@commandermolamola"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="text-cyan-300 bg-[#132732] rounded-full p-2 hover:bg-white hover:text-black transition"
      >
        <TikTokIcon />
      </a>
      <a
        href="https://www.youtube.com/@CommanderMolaMola"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="text-red-500 bg-[#1a1919] rounded-full p-2 hover:bg-red-100 hover:text-red-700 transition"
      >
        <Youtube className="w-5 h-5" />
      </a>
      <a
        href="https://bit.ly/m/CMDMolaMola"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bitly"
        className="bg-[#fff6eb] text-[#ee6123] rounded-full p-2 hover:bg-orange-100 hover:text-orange-700 transition"
      >
        <BitlyIcon />
      </a>
    </div>
  );
}
