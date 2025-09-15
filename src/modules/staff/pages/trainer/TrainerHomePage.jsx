
import { useNavigate } from 'react-router-dom';
import { Card, Grid, Flex, Metric, Text } from '@tremor/react';
import { Calendar, BarChart2, Award, Users } from 'react-feather';

const InscripcionesImg = () => (
  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-200 to-red-400 flex items-center justify-center shadow-lg mb-4">
    <BarChart2 size={32} className="text-red-700" />
  </div>
);
const HorariosImg = () => (
  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-red-400 flex items-center justify-center shadow-lg mb-4">
    <Calendar size={32} className="text-amber-700" />
  </div>
);

const TrainerHomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-gray-50 py-10 px-2 sm:px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-2">
            <BarChart2 size={32} className="text-red-600" />
            <h1 className="text-3xl font-bold text-black tracking-tight">Panel de Inicio del Entrenador</h1>
          </div>
          <Text className="text-gray-700 text-center max-w-xl">
            Accede rápidamente a tus páginas principales: inscripciones, desempeño y horarios. Si eres entrenador <span className="font-bold text-red-700">premium</span> podrás gestionar el desempeño de tus clientes asignados. Si eres <span className="font-bold text-gray-700">estándar</span> solo podrás visualizar tus planes y los clientes inscritos en ellos.
          </Text>
        </div>
        <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-8">
          <Card decoration="top" decorationColor="red" className="border border-red-300 bg-white hover:shadow-xl transition-all p-8 flex flex-col items-center justify-between min-h-[220px] cursor-pointer" onClick={() => navigate('/staff/inscripciones/desempeno')}>
            <InscripcionesImg />
            <Metric className="text-2xl font-bold text-red-700 mb-2">Inscripciones y Desempeños</Metric>
            <Text className="text-gray-700 text-base text-center font-medium mb-2">
              Gestiona inscripciones y desempeño.<br />
              <span className="inline-flex items-center gap-1"><Award size={18} className="text-emerald-600" /> Premium:</span> registra y actualiza desempeño.<br />
              <span className="inline-flex items-center gap-1"><Users size={18} className="text-gray-600" /> Estándar:</span> solo visualiza tus planes y clientes.
            </Text>
          </Card>
          <Card decoration="top" decorationColor="red" className="border border-red-300 bg-white hover:shadow-xl transition-all p-8 flex flex-col items-center justify-between min-h-[220px] cursor-pointer" onClick={() => navigate('/staff/planes/horarios')}>
            <HorariosImg />
            <Metric className="text-2xl font-bold text-red-700 mb-2">Horarios</Metric>
            <Text className="text-gray-700 text-base text-center font-medium mb-2">
              Consulta tus horarios y turnos.<br />
              Mantente informado sobre tus días y horas de trabajo en el gimnasio.
            </Text>
          </Card>
        </Grid>
      </div>
    </div>
  );
};

export default TrainerHomePage;
