import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/contexts/GameContext";
import GamePage from "./pages/Game";
import LandingPage from "./pages/Landing";
import RegistrationPage from "./pages/Registration";
import AboutPage from "./pages/About";
import NotFoundPage from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <Toaster />
    </GameProvider>
  );
}

export default App;
