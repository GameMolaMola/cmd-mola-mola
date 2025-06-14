
import React from "react";
import MobileControls from "./MobileControls";

interface Props {
  show: boolean;
  onControl: (control: string, state: boolean) => void;
}

const MolaMolaMobileControlsWrapper: React.FC<Props> = ({ show, onControl }) => {
  if (!show) return null;
  return (
    <div className="w-full z-30 bottom-0 left-0 sticky"
      style={{
        maxWidth: 900,
        margin: "0 auto",
      }}>
      <MobileControls onControl={onControl} />
    </div>
  );
};

export default MolaMolaMobileControlsWrapper;
