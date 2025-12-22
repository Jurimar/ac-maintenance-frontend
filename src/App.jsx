import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Technicians from './components/Technicians';
import WorkOrders from './components/WorkOrders';
import Materials from './components/Materials';
import Clients from './components/Clients';
import Schedule from './components/Schedule';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [currentView, setCurrentView] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('dashboard');
  };

  if (!token) {
    return <Login onLogin={handleLogin} apiUrl={API_URL} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl md:text-2xl font-bold">Sistema de Mantenimiento AC</h1>
              {!isOnline && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                  Offline
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user?.username} ({user?.role})</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <nav className="w-full md:w-64 bg-white shadow-lg">
          <ul className="py-4">
            {[
              { view: 'dashboard', label: '📊 Dashboard' },
              { view: 'work-orders', label: '📋 Órdenes' },
              { view: 'schedule', label: '📅 Agenda' },
              { view: 'technicians', label: '👷 Técnicos' },
              { view: 'clients', label: '👥 Clientes' },
              { view: 'materials', label: '📦 Materiales' }
            ].map(item => (
              <li key={item.view}>
                <button
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full text-left px-6 py-3 hover:bg-blue-50 transition ${
                    currentView === item.view ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-4 md:p-6">
          {currentView === 'dashboard' && <Dashboard token={token} apiUrl={API_URL} />}
          {currentView === 'work-orders' && <WorkOrders token={token} apiUrl={API_URL} />}
          {currentView === 'schedule' && <Schedule token={token} apiUrl={API_URL} />}
          {currentView === 'technicians' && <Technicians token={token} apiUrl={API_URL} />}
          {currentView === 'clients' && <Clients token={token} apiUrl={API_URL} />}
          {currentView === 'materials' && <Materials token={token} apiUrl={API_URL} />}
        </main>
      </div>
    </div>
  );
}

export default App;