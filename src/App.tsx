import React from "react";
import { TelegramProvider } from "./context/TelegramContext";
import { BalanceProvider } from "./context/BalanceContext";
import AppContent from "./AppContent";
import "./App.css";
import store from "./redux/store/store";
import { Provider } from "react-redux";

const App: React.FC = () => {
  return (
    <TelegramProvider>
      <BalanceProvider>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </BalanceProvider>
    </TelegramProvider>
  );
};

export default App;
