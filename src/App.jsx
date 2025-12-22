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
  const [backendStatus, setBackendStatus] = useState('checking');

  // Keep backend alive
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`);
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (err) {
        setBackendStatus('offline');
      }
    };

    // Ping immediately
    pingBackend();

    // Ping every 5 minutes to keep backend awake
    const interval = setInterval(pingBackend, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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
    return <Login onLogin={handleLogin} apiUrl={API_URL} backendStatus={backendStatus} />;
  }

  const menuItems = [
    { view: 'dashboard', label: 'Dashboard', icon: '📊' },
    { view: 'work-orders', label: 'Órdenes', icon: '📋' },
    { view: 'schedule', label: 'Agenda', icon: '📅' },
    { view: 'technicians', label: 'Técnicos', icon: '👷' },
    { view: 'clients', label: 'Clientes', icon: '👥' },
    { view: 'materials', label: 'Materiales', icon: '📦' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Ártico Logo" className="h-12 w-12 rounded-full bg-white p-1" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Sistema Ártico</h1>
                <p className="text-xs text-red-100">Servicios Técnicos</p>
              </div>
              {!isOnline && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs">
                  Sin conexión
                </span>
              )}
              {backendStatus === 'offline' && (
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs animate-pulse">
                  Servidor iniciando...
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-red-100">{user?.role === 'admin' ? 'Administrador' : 'Técnico'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition font-medium"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <nav className="w-full md:w-64 bg-white shadow-lg border-r border-gray-200">
          <ul className="py-4">
            {menuItems.map(item => (
              <li key={item.view}>
                <button
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full text-left px-6 py-3 hover:bg-red-50 transition flex items-center space-x-3 ${
                    currentView === item.view 
                      ? 'bg-red-50 border-l-4 border-red-600 text-red-600 font-medium' 
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {currentView === 'dashboard' && <Dashboard token={token} apiUrl={API_URL} />}
          {currentView === 'work-orders' && <WorkOrders token={token} apiUrl={API_URL} />}
          {currentView === 'schedule' && <Schedule token={token} apiUrl={API_URL} />}
          {currentView === 'technicians' && <Technicians token={token} apiUrl={API_URL} />}
          {currentView === 'clients' && <Clients token={token} apiUrl={API_URL} />}
          {currentView === 'materials' && <Materials token={token} apiUrl={API_URL} />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-600">
        <p>© 2025 Ártico Servicios Técnicos. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;