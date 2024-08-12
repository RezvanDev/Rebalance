import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/NavigationBar.css';

const NavigationBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link to="/main-menu" className={`nav-item ${location.pathname === '/main-menu' ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span className="nav-text">Главная</span>
      </Link>
      <Link to="/tasks" className={`nav-item ${location.pathname === '/tasks' ? 'active' : ''}`}>
        <span className="nav-icon">☰</span>
        <span className="nav-text">Задания</span>
      </Link>
      <div className="nav-item">
        <span className="nav-icon">⛏️</span>
        <span className="nav-text">Кран</span>
      </div>
    </nav>
  );
};

export default NavigationBar;