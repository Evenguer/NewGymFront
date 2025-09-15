import React, { useEffect, useState } from 'react';
import { getStandardPlansWithClients } from '../../services/trainerAPI';
import { Card, Grid, Flex, Metric, Text, TextInput, Button, Badge } from '@tremor/react';
import { User, Users, Calendar } from 'react-feather';

const TrainerStandardInscriptionClientsPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planSearch, setPlanSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStandardPlansWithClients();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || 'Error al cargar los planes y clientes.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-4 w-full bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Planes y Clientes Estándar</h1>
          <p className="text-gray-700">Visualiza tus planes estándar y los clientes inscritos.</p>
        </div>
        {selectedPlan && (
          <Button color="gray" size="xs" onClick={() => setSelectedPlan(null)} className="ml-2">Volver a planes</Button>
        )}
      </div>
      {/* Vista principal: solo tarjetas de planes */}
      {!selectedPlan && (
        <>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <TextInput
              icon={Users}
              placeholder="Buscar plan por nombre..."
              value={planSearch}
              onChange={e => setPlanSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
            {loading && (
              <div className="text-center py-8 col-span-full">
                <Text>Cargando información...</Text>
              </div>
            )}
            {!loading && error && (
              <div className="text-center py-8 col-span-full">
                <Text className="text-red-600">{error}</Text>
              </div>
            )}
            {!loading && !error && plans.length === 0 && (
              <div className="text-center py-8 col-span-full">
                <Text>No tienes planes estándar asignados actualmente.</Text>
              </div>
            )}
            {!loading && !error && plans.length > 0 && (
              <>
                {plans
                  .filter(plan => plan.nombrePlan.toLowerCase().includes(planSearch.toLowerCase()))
                  .map(plan => (
                    <Card key={plan.idPlan} decoration="top" decorationColor="red" className="cursor-pointer hover:shadow-xl transition-all border border-red-300 p-6 bg-white flex flex-col justify-between min-h-[180px]" onClick={() => setSelectedPlan(plan)}>
                      <Flex alignItems="center" justifyContent="between">
                        <div className="flex items-center space-x-2">
                          <Users size={22} className="text-red-600" />
                          <Metric className="text-lg font-semibold text-black">{plan.nombrePlan}</Metric>
                        </div>
                        <Text className="text-xs font-medium text-gray-700">{plan.clientes.length} clientes</Text>
                      </Flex>
                      <div className="mt-3">
                        <Text className="text-gray-700 text-sm font-medium">{plan.descripcionPlan}</Text>
                      </div>
                    </Card>
                  ))}
              </>
            )}
          </Grid>
        </>
      )}
      {/* Vista de clientes del plan seleccionado */}
      {selectedPlan && (
        <>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <TextInput
              icon={User}
              placeholder="Buscar cliente por nombre..."
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
            {selectedPlan.clientes.length === 0 ? (
              <div className="text-center py-8 col-span-full">
                <Text>No hay clientes asignados a este plan.</Text>
              </div>
            ) : (
              selectedPlan.clientes
                .filter(cliente => {
                  const fullName = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
                  return fullName.includes(clientSearch.toLowerCase());
                })
                .map(cliente => {
                  // Ordenar horarios por día de la semana
                  const diasOrden = ["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];
                  function normalizaDia(dia) {
                    return dia.normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase();
                  }
                  const horariosOrdenados = (cliente.horarios || []).slice().sort((a, b) => {
                    return diasOrden.indexOf(normalizaDia(a.diaSemana)) - diasOrden.indexOf(normalizaDia(b.diaSemana));
                  });
                  return (
                    <Card key={cliente.idCliente} decoration="top" decorationColor="red" className="border border-red-300 hover:shadow-xl transition-all p-6 space-y-4 bg-white flex flex-col justify-between min-h-[220px]">
                      <Flex alignItems="center" justifyContent="between">
                        <div className="flex items-center space-x-2">
                          <User size={20} className="text-red-600" />
                          <Metric className="text-lg font-semibold text-black">{cliente.nombre} {cliente.apellido}</Metric>
                        </div>
                        <Badge color="gray" className="text-xs font-medium">{horariosOrdenados.length} horarios</Badge>
                      </Flex>
                      <div className="space-y-2 mt-2">
                        <Flex alignItems="center" className="space-x-2">
                          <Calendar size={16} className="text-red-600" />
                          <Text className="text-xs font-medium text-gray-700">Horarios:</Text>
                        </Flex>
                        <div className="flex flex-col gap-2 mt-2">
                          {horariosOrdenados.length > 0 ? (
                            horariosOrdenados.map((h, idx) => (
                              <div key={h.idHorario || `${h.diaSemana}-${h.horaInicio}-${h.horaFin}`}
                                className="bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-700 flex flex-col shadow-sm border border-gray-200">
                                <span className="font-semibold text-red-700">{h.diaSemana}</span>
                                <span className="ml-2">{h.horaInicio} - {h.horaFin}</span>
                              </div>
                            ))
                          ) : (
                            <Text className="text-gray-400 text-xs">Sin horarios</Text>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
            )}
          </Grid>
        </>
      )}
    </div>
  );
};

export default TrainerStandardInscriptionClientsPage;
