
import React from "react";
import SocialLinks from "./SocialLinks";
import type { Translations } from "@/hooks/useTranslations";

export default function AddressSection({ t }: { t: Translations }) {
  return (
    <div className="bg-blue-800/70 border border-yellow-400 p-4 rounded-lg w-full mb-4">
      <h2 className="text-yellow-300 font-semibold mb-1">{t.addressTitle}</h2>
      <div className="text-white/80">{t.address}</div>
      <a
        href={`mailto:${t.email}`}
        className="text-cyan-300 hover:underline block mt-1"
      >
        {t.email}
      </a>
      {/* Social/media icon links */}
      <SocialLinks />
      {/* DONATE BUTTON */}
      <div className="flex justify-center mt-6">
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-white shadow-md text-base bg-pink-600 hover:bg-pink-700 border border-yellow-300 transition animate-[pulse_2.2s_cubic-bezier(0.4,0,0.6,1)_infinite] select-none"
          style={{
            minWidth: "100px",
            animation: "pulse 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
          }}
        >
          <span>{t.donateButton}</span>
          <img
            src="/lovable-uploads/63f3c1bb-af9c-4c63-86ae-a15bc687d8a8.png"
            alt="Donate Cup"
            className="w-[20px] h-[20px] object-contain"
            style={{
              marginLeft: "4px",
            }}
          />
        </a>
      </div>
    </div>
  );
}
