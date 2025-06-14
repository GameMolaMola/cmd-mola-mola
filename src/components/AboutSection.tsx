
import React from "react";
import FeatureList from "./FeatureList";

export default function AboutSection({ t }: { t: any }) {
  return (
    <div className="bg-blue-950/70 border border-cyan-400 p-4 rounded-lg w-full mb-2">
      <h2 className="text-cyan-200 font-semibold mb-2">{t.aboutTitle}</h2>
      <p className="text-white/90 text-sm">{t.aboutText}</p>
      <FeatureList features={t.features} />
    </div>
  );
}
