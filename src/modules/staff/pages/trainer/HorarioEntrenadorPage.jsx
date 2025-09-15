import React, { useEffect, useState, useContext } from 'react';
import { inscripcionAPI } from '../../services/InscripcionAPI';
import { AuthContext } from '../../../../shared/context/AuthContext';
import axios from 'axios';
import { ENDPOINTS } from '../../../../shared/services/endpoints';
import { Card, Badge, Text, Metric, Flex, Grid } from '@tremor/react';
import { Calendar, Clock, User } from 'react-feather';

const HorarioEntrenadorPage = () => {
  const { user } = useContext(AuthContext);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHorarios = async () => {
      setLoading(true);
      setError(null);
      try {
        let idEmpleado = user?.idEmpleado;
        // Si no está en el contexto, obtenerlo desde el backend
        if (!idEmpleado && user?.id) {
          const res = await axios.get(ENDPOINTS.GET_EMPLOYEE_BY_USER(user.id));
          idEmpleado = res.data?.idEmpleado || res.data?.id || null;
        }
        if (idEmpleado) {
          const horarios = await inscripcionAPI.obtenerHorariosInstructor(idEmpleado);
          setHorarios(horarios);
        } else {
          setHorarios([]);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar los horarios.');
      } finally {
        setLoading(false);
      }
    };
    fetchHorarios();
  }, [user]);

  // Log temporal para depuración
  if (horarios && horarios.length > 0) {
    // eslint-disable-next-line no-console
    console.log('Horarios recibidos:', horarios);
  }
  // El backend no envía el campo 'estado', así que mostramos todos los horarios recibidos
  const horariosActivos = horarios;
  // Ordenar horarios por día de la semana y luego por hora de inicio
  const diasOrden = ["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];
  function normalizaDia(dia) {
    if (!dia) return "";
    // Eliminar tildes, espacios y convertir a minúsculas
    let d = dia.normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase().trim();
    // Reemplazar variantes comunes y devolver exactamente como en diasOrden
    if (d.startsWith("lun")) return "lunes";
    if (d.startsWith("mar")) return "martes";
    if (d.startsWith("mie") || d.startsWith("mi")) return "miércoles";
    if (d.startsWith("jue")) return "jueves";
    if (d.startsWith("vie")) return "viernes";
    if (d.startsWith("sab")) return "sábado";
    if (d.startsWith("dom")) return "domingo";
    return d;
  }
  // Función para comparar horas en formato HH:mm
  function compararHoras(horaA, horaB) {
    const [hA, mA] = horaA.split(":").map(Number);
    const [hB, mB] = horaB.split(":").map(Number);
    if (hA !== hB) return hA - hB;
    return mA - mB;
  }
  const horariosOrdenados = horariosActivos.slice().sort((a, b) => {
    const diaA = diasOrden.indexOf(normalizaDia(a.dia));
    const diaB = diasOrden.indexOf(normalizaDia(b.dia));
    if (diaA !== diaB) return diaA - diaB;
    // Si es el mismo día, ordenar por hora de inicio
    return compararHoras(a.horaInicio, b.horaInicio);
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6 md:px-12">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar size={32} className="text-red-600" />
          <h1 className="text-3xl font-bold text-black tracking-tight">Mis Horarios</h1>
        </div>
        <Text className="text-gray-700 text-center">Visualiza tus horarios asignados como entrenador. Si tienes dudas, contacta a tu administrador.</Text>
      </div>
      {loading && (
        <div className="text-center text-gray-500 py-8 animate-pulse">Cargando horarios...</div>
      )}
      {!loading && error && (
        <div className="text-center text-red-600 py-8">{error}</div>
      )}
      {!loading && !error && horariosOrdenados.length === 0 && (
        <div className="text-center text-gray-600 py-8">No tienes horarios asignados.</div>
      )}
      {!loading && !error && horariosOrdenados.length > 0 && (
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-8">
          {horariosOrdenados.map((h, idx) => (
            <Card key={h.idHorarioEmpleado || idx} decoration="top" decorationColor="red" className="border border-red-300 bg-white hover:shadow-xl transition-all p-8 flex flex-col justify-between min-h-[180px]">
              <Flex alignItems="center" justifyContent="between">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-red-600" />
                  <Metric className="text-lg font-semibold text-black">{normalizaDia(h.dia).charAt(0).toUpperCase() + normalizaDia(h.dia).slice(1)}</Metric>
                </div>
                <Badge color="gray" className="text-xs font-medium">{h.turno}</Badge>
              </Flex>
              <div className="mt-6 flex flex-col gap-2">
                <Flex alignItems="center" className="gap-3">
                  <Clock size={20} className="text-red-500" />
                  <Text className="text-lg font-bold text-red-700 tracking-wide">{h.horaInicio} - {h.horaFin}</Text>
                </Flex>
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default HorarioEntrenadorPage;
