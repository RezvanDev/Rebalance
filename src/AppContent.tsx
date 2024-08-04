import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useTonConnect } from './hooks/useTonConnect';
import { useTelegram } from './context/TelegramContext';
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
  const { user } = useTelegram();
  const location = useLocation();

  const isOnboarding = location.pathname === '/' || location.pathname === '/onboarding';
  const showNavigationBar = !isOnboarding && location.pathname !== '/reba-academy';

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`app-container ${isOnboarding ? 'onboarding' : ''}`}>
      <div className="content">
        <Routes>
          <Route
            path="/"
            element={
              connected ? <Navigate to="/main-menu" /> : <Navigate to="/onboarding" />
            }
          />
          <Route path="/onboarding" element={<OnboardingPages />} />
          <Route 
            path="/main-menu" 
            element={connected ? <MainMenu /> : <Navigate to="/onboarding" />} 
          />
          <Route 
            path="/tasks" 
            element={connected ? <TasksPage /> : <Navigate to="/onboarding" />} 
          />
          <Route 
            path="/reba-academy" 
            element={connected ? <RebaAcademy /> : <Navigate to="/onboarding" />} 
          />
          <Route 
            path="/channel-tasks" 
            element={connected ? <ChannelTasks /> : <Navigate to="/onboarding" />} 
          />
          <Route 
            path="/token-tasks" 
            element={connected ? <TokenTasks /> : <Navigate to="/onboarding" />} 
          />
          <Route 
            path="/token-task/:tokenId" 
            element={connected ? <TokenTaskDetail /> : <Navigate to="/onboarding" />} 
          />
        </Routes>
      </div>
      {showNavigationBar && <NavigationBar />}
    </div>
  );
};

export default AppContent;