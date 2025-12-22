import React, { useState, useEffect } from 'react';

export default function Dashboard({ token, apiUrl }) {
  const [stats, setStats] = useState({ technicians: 0, workOrders: 0, materials: 0, clients: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [techRes, ordersRes, matRes, clientsRes] = await Promise.all([
        fetch(`${apiUrl}/api/technicians`, { headers }),
        fetch(`${apiUrl}/api/work-orders`, { headers }),
        fetch(`${apiUrl}/api/materials`, { headers }),
        fetch(`${apiUrl}/api/clients`, { headers })
      ]);

      const techs = await techRes.json();
      const ordersData = await ordersRes.json();
      const mats = await matRes.json();
      const clients = await clientsRes.json();

      setStats({
        technicians: techs.length,
        workOrders: ordersData.length,
        materials: mats.length,
        clients: clients.length
      });
      setRecentOrders(ordersData.slice(0, 5));
      setOrders(ordersData);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      });
    }

    return days;
  };

  const getOrdersForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return orders.filter(order => order.scheduled_date === dateStr);
  };

  const changeMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date().toISOString().split('T')[0];

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const statusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-400';
      default: return 'bg-red-500';
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Técnicos Activos</p>
              <p className="text-4xl font-bold mt-2">{stats.technicians}</p>
            </div>
            <div className="text-5xl opacity-80">👷</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Órdenes de Trabajo</p>
              <p className="text-4xl font-bold mt-2">{stats.workOrders}</p>
            </div>
            <div className="text-5xl opacity-80">📋</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Materiales</p>
              <p className="text-4xl font-bold mt-2">{stats.materials}</p>
            </div>
            <div className="text-5xl opacity-80">📦</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Clientes</p>
              <p className="text-4xl font-bold mt-2">{stats.clients}</p>
            </div>
            <div className="text-5xl opacity-80">👥</div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => changeMonth(-1)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              Hoy
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2 bg-gray-100 rounded-lg">
              {day}
            </div>
          ))}

          {days.map((dayObj, idx) => {
            const dayOrders = getOrdersForDate(dayObj.date);
            const isToday = dayObj.date.toISOString().split('T')[0] === today;

            return (
              <div
                key={idx}
                className={`min-h-[100px] border rounded-lg p-2 ${
                  !dayObj.isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
                } ${isToday ? 'ring-2 ring-red-500 bg-red-50' : ''} hover:shadow-md transition`}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  isToday ? 'text-red-600' : dayObj.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {dayObj.day}
                </div>

                <div className="space-y-1">
                  {dayOrders.slice(0, 3).map(order => (
                    <div
                      key={order.id}
                      className={`${statusColor(order.status)} text-white text-xs px-2 py-1 rounded truncate`}
                      title={`${order.title} - ${order.technician_name || 'Sin asignar'}`}
                    >
                      {order.scheduled_time || '—'} {order.title.substring(0, 15)}
                    </div>
                  ))}
                  {dayOrders.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayOrders.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Pendiente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">En Progreso</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Completada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-700">Cancelada</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Órdenes Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">ID</th>
                <th className="text-left py-3 px-4 text-gray-700">Título</th>
                <th className="text-left py-3 px-4 text-gray-700">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-700">Técnico</th>
                <th className="text-left py-3 px-4 text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No hay órdenes recientes
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">#{order.id}</td>
                    <td className="py-3 px-4">{order.title}</td>
                    <td className="py-3 px-4">{order.client_name || 'N/A'}</td>
                    <td className="py-3 px-4">{order.technician_name || 'Sin asignar'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}