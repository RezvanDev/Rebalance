import React from "react";
import { TelegramProvider } from "./context/TelegramContext";
import { BalanceProvider } from "./context/BalanceContext";
import AppContent from "./AppContent";
import "./App.css";

const App: React.FC = () => {
  return (
    <TelegramProvider>
      <BalanceProvider>
        <AppContent />
      </BalanceProvider>
    </TelegramProvider>
  );
};

export default App;