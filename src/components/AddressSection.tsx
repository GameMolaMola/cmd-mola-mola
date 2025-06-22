
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
    </div>
  );
}
