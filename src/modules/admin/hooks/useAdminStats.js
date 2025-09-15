import { useState, useEffect } from 'react';
import { getUsers } from '../../../shared/services/authAPI';
import { getClients } from '../services/personaAPI';
import { getSales } from '../services/ventasAPI';

export const useAdminStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    activeSubscriptions: 0,
    revenue: 0,
    attendance: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          throw new Error('No hay sesión activa');
        }

        // Obtener datos de usuarios
        const usersData = await getUsers(user.token);
        
        // Obtener datos de clientes
        const clientsData = await getClients();
        
        // Obtener datos de ventas
        const salesData = await getSales();
        
        // Calcular ingresos totales
        const totalRevenue = salesData.reduce((sum, sale) => {
          return sum + (sale.montoTotal || 0);
        }, 0);

        setStats({
          users: usersData.length || 0,
          activeSubscriptions: clientsData.length || 0,
          revenue: totalRevenue || 0,
          attendance: Math.floor(Math.random() * 100), // Ejemplo para asistencia (reemplazar por datos reales)
          loading: false,
          error: null
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Error al cargar estadísticas'
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};