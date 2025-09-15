import React from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import DashboardRecepcion from './receptionist/DashboardRecepcion';
import TrainerHomePage from './trainer/TrainerHomePage';

const StaffDashboardSwitch = () => {
  const { user } = useAuth();

  // Si es recepcionista, mostrar el dashboard de recepción
  if (user?.role === 'RECEPCIONISTA') {
    return <DashboardRecepcion />;
  }

  // Si es entrenador, mostrar el dashboard de entrenador
  return <TrainerHomePage />;
};

export default StaffDashboardSwitch;
