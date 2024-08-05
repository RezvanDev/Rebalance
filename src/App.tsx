import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import OnboardingPages from './components/OnboardingPages';
import MainMenu from './components/MainMenu';
import './App.css';

const manifestUrl = "https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json";

function App() {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Router>
        <Routes>
          <Route path="/" element={<OnboardingPages />} />
          <Route path="/main-menu" element={<MainMenu />} />
        </Routes>
      </Router>
    </TonConnectUIProvider>
  );
}

export default App;