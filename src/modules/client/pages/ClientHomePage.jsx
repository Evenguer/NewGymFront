import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PlanInfoCard from '../components/InscribedPlans/PlanInfoCard';
import AttendanceLegend from '../components/InscribedPlans/AttendanceLegend';

const HomeCard = ({ title, description, icon, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center bg-white/90 rounded-2xl shadow-lg border border-gray-200/60 p-8 hover:shadow-xl transition-all duration-200 w-full h-full group`}
    style={{ minHeight: 220 }}
  >
    <div className={`w-14 h-14 mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-md`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-primary-700 mb-2 group-hover:text-primary-800 transition">{title}</h3>
    <p className="text-gray-500 text-sm text-center">{description}</p>
  </button>
);

const ClientHomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-800 mb-2">Bienvenido a tu Portal de Cliente</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Gestiona tu experiencia en el gimnasio: revisa tus planes, sigue tu desempeño, consulta tu historial y mantén tu perfil actualizado. ¡Todo en un solo lugar!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HomeCard
            title="Planes Activos"
            description="Consulta tus planes de inscripción actuales, horarios y asistencia semanal."
            icon={<svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="2" /><path d="M8 2v4M16 2v4" strokeWidth="2" /></svg>}
            color="from-primary-400 to-primary-600"
            onClick={() => navigate('/client/inscripciones/planes-inscritos')}
          />
          <HomeCard
            title="Desempeño Actual"
            description="Visualiza tu estado físico actual, IMC, metas y consejos personalizados."
            icon={<svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M9 12l2 2l4-4" strokeWidth="2" /></svg>}
            color="from-emerald-400 to-emerald-600"
            onClick={() => navigate('/client/inscripciones/desempeno')}
          />
          <HomeCard
            title="Historial de Desempeño"
            description="Revisa la evolución de tus mediciones físicas y tu progreso a lo largo del tiempo."
            icon={<svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" strokeWidth="2" /><path d="M16 11V7a4 4 0 00-8 0v4" strokeWidth="2" /><rect x="8" y="15" width="8" height="2" rx="1" /></svg>}
            color="from-amber-300 to-amber-500"
            onClick={() => navigate('/client/inscripciones/desempeno-historial')}
          />
          <HomeCard
            title="Planes Anteriores"
            description="Consulta el historial de tus planes finalizados o cancelados y tus estadísticas de asistencia."
            icon={<svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="2" /><path d="M8 2v4M16 2v4" strokeWidth="2" /><path d="M12 8v4l3 3" strokeWidth="2" /></svg>}
            color="from-gray-300 to-gray-400"
            onClick={() => navigate('/client/inscripciones/planes-anteriores')}
          />
          <HomeCard
            title="Mi Perfil"
            description="Edita tus datos personales, cambia tu contraseña y mantén tu información actualizada."
            icon={<svg className="w-8 h-8 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" strokeWidth="2" /><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeWidth="2" /></svg>}
            color="from-primary-200 to-primary-400"
            onClick={() => navigate('/client/perfil')}
          />
        </div>
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-white/80 rounded-2xl shadow border border-gray-200/60 p-8 flex flex-col items-center">
            <h2 className="text-xl font-bold text-primary-700 mb-2">¿Cómo aprovechar tu portal?</h2>
            <ul className="list-disc text-gray-600 text-left space-y-2 pl-6">
              <li>Revisa tus <span className="font-semibold text-primary-700">planes activos</span> y mantente al tanto de tus horarios y asistencia.</li>
              <li>Consulta tu <span className="font-semibold text-emerald-600">desempeño actual</span> para seguir tus avances y recibir consejos.</li>
              <li>Explora tu <span className="font-semibold text-amber-600">historial</span> para ver tu evolución física.</li>
              <li>Actualiza tu <span className="font-semibold text-primary-700">perfil</span> para mantener tu información segura y al día.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHomePage;
