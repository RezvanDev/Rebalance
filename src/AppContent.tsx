import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useTonConnect } from './hooks/useTonConnect';
import OnboardingPages from './components/OnboardingPages';
import MainMenu from './components/MainMenu';
import TasksPage from './components/TasksPage';
import RebaAcademy from './components/RebaAcademy';
import ChannelTasks from './components/ChannelTasks';
import TokenTasks from './components/TokenTask';
import NavigationBar from './components/NavigationBar';
import TokenTaskDetail from './components/TokenTaskDetail';

const AppContent: React.FC = () => {
  const { connected } = useTonConnect();
  const location = useLocation();
  const isOnboarding = location.pathname === '/' && !connected;
  const showNavigationBar = !isOnboarding && location.pathname !== '/reba-academy';

  return (
    <div className={`app-container ${isOnboarding ? 'onboarding' : ''}`}>
      <div className="content">
        <Routes>
          <Route
            path="/"
            element={connected ? <Navigate to="/main-menu" /> : <OnboardingPages />}
          />
          <Route path="/main-menu" element={<MainMenu />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/reba-academy" element={<RebaAcademy />} />
          <Route path="/channel-tasks" element={<ChannelTasks />} />
          <Route path="/token-tasks" element={<TokenTasks />} />
          <Route path="/token-task/:tokenId" element={<TokenTaskDetail />} />
        </Routes>
      </div>
      {showNavigationBar && <NavigationBar />}
    </div>
  );
};

export default AppContent;