// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/contexts/GameContext";
import Index from "./pages/Index";
import Game from "./pages/Game";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AppStoreGuide from "./pages/AppStoreGuide";
import AndroidGuide from "./pages/AndroidGuide";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <GameProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/game" element={<Game />} />
          <Route path="/about" element={<About />} />
          <Route path="/appstore" element={<AppStoreGuide />} />
          <Route path="/android" element={<AndroidGuide />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </GameProvider>
  );
}

export default App;
