
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Кнопки перехода к мобильным гайдам
const MobileGuidesNav: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-row justify-center gap-2 mb-2">
      <Button className="bg-yellow-700 hover:bg-yellow-800 text-white font-medium" onClick={() => navigate('/appstore')}>
        Гайд: Публикация в App Store
      </Button>
      <Button className="bg-green-700 hover:bg-green-800 text-white font-medium" onClick={() => navigate('/android')}>
        Гайд: Публикация в Google Play
      </Button>
    </div>
  );
};

export default MobileGuidesNav;
