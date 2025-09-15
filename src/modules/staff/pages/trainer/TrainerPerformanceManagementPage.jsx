import React, { useEffect, useState } from 'react';
import { getPremiumPlansWithClients } from '../../services/trainerAPI';
import { registrarDesempeno, obtenerDesempenoCliente, actualizarDesempeno, eliminarDesempeno } from '../../services/desempenoAPI';
import { Card, Grid, Badge, Flex, Metric, Button, Text, TextInput } from '@tremor/react';
import { Users, User, Calendar, Edit2, Trash2, CheckCircle, Info, Activity, BarChart2, Clipboard, Award, Hash, Heart, Shield, UserCheck, Clock, RefreshCw } from 'react-feather';

const initialForm = {
  peso: '',
  estatura: '',
  imc: '',
  diagnostico: '',
  indicador: '',
  edad: '',
  nivelFisico: '',
  estado: true,
};

const TrainerPerformanceManagementPage = () => {
  // Buscadores y filtros
  const [planSearch, setPlanSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clientDesempenoFilter, setClientDesempenoFilter] = useState('all'); // 'all' | 'con' | 'sin'
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modalMode, setModalMode] = useState('register'); // 'register' | 'view' | 'edit'
  const [desempenoId, setDesempenoId] = useState(null);
  const [clientesConDesempeno, setClientesConDesempeno] = useState({}); // { [idCliente]: desempeño }
  // Eliminado: editMode no se usa y puede causar error

  // Consulta de desempeños de todos los clientes al cargar la página
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPremiumPlansWithClients();
        setPlans(Array.isArray(data) ? data : []);
        // Buscar desempeños de todos los clientes
        const allClientes = (Array.isArray(data) ? data : []).flatMap(plan => plan.clientes);
        const desempenos = {};
        await Promise.all(
          allClientes.map(async (cliente) => {
            try {
              const d = await obtenerDesempenoCliente(cliente.idCliente);
              if (d && d.idDesempeno) {
                desempenos[cliente.idCliente] = d;
              } else {
                desempenos[cliente.idCliente] = null;
              }
            } catch {
              desempenos[cliente.idCliente] = null;
            }
          })
        );
        setClientesConDesempeno(desempenos);
      } catch (err) {
        setError(err?.message || 'Error al cargar los planes y clientes.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modal: abrir para ver o editar desempeño actual (solo una versión)
  const openViewModal = (cliente) => {
    setSelectedCliente(cliente);
    setFormError('');
    setShowSuccess('');
    setModalMode('view');
    const d = clientesConDesempeno[cliente.idCliente];
    setDesempenoId(d?.idDesempeno || null);
    setForm({
      peso: d?.peso ?? '',
      estatura: d?.estatura ?? '',
      imc: d?.imc ?? '',
      diagnostico: d?.diagnostico ?? '',
      indicador: d?.indicador ?? '',
      edad: d?.edad ?? '',
      nivelFisico: d?.nivelFisico ?? '',
      estado: d?.estado ?? true,
    });
    setModalOpen(true);
  };

  // Modal: abrir para registrar desempeño (solo una versión)
  const openRegisterModal = (cliente) => {
    setSelectedCliente(cliente);
    setForm(initialForm);
    setFormError('');
    setShowSuccess('');
    setModalMode('register');
    setDesempenoId(null);
    setModalOpen(true);
  };

  const enableEdit = () => {
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCliente(null);
    setForm(initialForm);
    setFormError('');
    setShowSuccess('');
    setModalMode('register');
    setDesempenoId(null);
  };

  // Calcula IMC e indicador según la lógica del backend
  const calcularImcEIndicador = (peso, estatura) => {
    let imc = '';
    let indicador = '';
    const numPeso = parseFloat(peso);
    const numEstatura = parseFloat(estatura);
    if (!isNaN(numPeso) && !isNaN(numEstatura) && numEstatura > 0) {
      imc = numPeso / (numEstatura * numEstatura);
      imc = Math.round(imc * 10) / 10;
      if (imc <= 18.5) {
        indicador = 'Peso Insuficiente';
      } else if (imc > 18.5 && imc <= 24.9) {
        indicador = 'Normopeso';
      } else if (imc >= 25 && imc <= 29.9) {
        indicador = 'Sobrepeso I y II';
      } else if (imc >= 30 && imc <= 39.9) {
        indicador = 'Obesidad I y II';
      } else if (imc >= 40) {
        indicador = 'Obesidad III y IV';
      } else {
        indicador = '';
      }
    } else {
      imc = '';
      indicador = '';
    }
    return { imc, indicador };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormError('');
    if (name === 'peso' || name === 'estatura') {
      const nuevoPeso = name === 'peso' ? value : form.peso;
      const nuevaEstatura = name === 'estatura' ? value : form.estatura;
      const { imc, indicador } = calcularImcEIndicador(nuevoPeso, nuevaEstatura);
      setForm((prev) => ({
        ...prev,
        [name]: value,
        imc: imc !== '' ? imc : '',
        indicador: indicador !== '' ? indicador : '',
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validaciones de formulario mejoradas
  const validateForm = () => {
    if (!form.peso || isNaN(form.peso) || Number(form.peso) <= 0) return 'El peso debe ser mayor a 0.';
    if (!form.estatura || isNaN(form.estatura) || Number(form.estatura) <= 0) return 'La estatura debe ser mayor a 0.';
    if (!form.diagnostico || form.diagnostico.trim().length < 10) return 'El diagnóstico debe tener al menos 10 caracteres.';
    if (form.diagnostico && form.diagnostico.trim().length > 100) return 'El diagnóstico no debe superar los 100 caracteres.';
    if (!form.edad || isNaN(form.edad) || Number(form.edad) < 18 || Number(form.edad) > 120) return 'La edad debe ser mayor o igual a 18 años y menor a 120 años.';
    if (!form.nivelFisico || form.nivelFisico.trim().length < 3) return 'El nivel físico es obligatorio y debe tener al menos 3 caracteres.';
    return '';
  };

  // Versión única y correcta de handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setShowSuccess('');
    // Validar antes de enviar
    const validationMsg = validateForm();
    if (validationMsg) {
      setFormError(validationMsg);
      setSubmitting(false);
      return;
    }
    try {
      let newDesempeno = null;
      if (modalMode === 'edit' && desempenoId) {
        await actualizarDesempeno(desempenoId, { ...form });
        setShowSuccess('¡Los datos del desempeño fueron actualizados correctamente!');
        newDesempeno = { ...form, idDesempeno: desempenoId };
      } else {
        const idInscripcionPremium = selectedCliente.idInscripcion;
        if (!idInscripcionPremium) {
          setFormError('No se encontró una inscripción premium activa para este cliente. Contacte al administrador si el problema persiste.');
          setSubmitting(false);
          return;
        }
        const resp = await registrarDesempeno({
          cliente: { idCliente: selectedCliente.idCliente },
          inscripcion: { idInscripcion: idInscripcionPremium },
          ...form
        });
        setShowSuccess('¡Desempeño registrado exitosamente!');
        newDesempeno = resp;
      }
      setClientesConDesempeno(prev => ({
        ...prev,
        [selectedCliente.idCliente]: newDesempeno,
      }));
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Ocurrió un error inesperado al guardar el desempeño. Intente nuevamente.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!desempenoId) return;
    setSubmitting(true);
    setFormError('');
    setShowSuccess('');
    try {
      await eliminarDesempeno(desempenoId);
      setShowSuccess('El desempeño fue eliminado correctamente.');
      if (selectedCliente) {
        try {
          const d = await obtenerDesempenoCliente(selectedCliente.idCliente);
          setClientesConDesempeno(prev => ({
            ...prev,
            [selectedCliente.idCliente]: d && d.idDesempeno ? d : null,
          }));
        } catch {
          setClientesConDesempeno(prev => ({
            ...prev,
            [selectedCliente.idCliente]: null,
          }));
        }
      }
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'No se pudo eliminar el desempeño. Intente nuevamente.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Helper para badge de desempeño con colores rojo/gris
  const getDesempenoBadge = (d) => {
    if (!d || !d.idDesempeno) return <Badge color="gray">Sin desempeño</Badge>;
    return <Badge color="red">Con desempeño</Badge>;
  };

  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-4 w-full bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Desempeños de Clientes Premium</h1>
          <p className="text-gray-700">Gestiona y visualiza el desempeño físico de tus clientes en sus planes premium.</p>
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
                <Text>No tienes planes premium asignados actualmente.</Text>
              </div>
            )}
            {!loading && !error && plans.length > 0 && (
              <>
                {plans
                  .filter(plan => plan.nombrePlan.toLowerCase().includes(planSearch.toLowerCase()))
                  .map(plan => (
                    <Card key={plan.idPlan} decoration="top" decorationColor="red" className="cursor-pointer hover:shadow-xl transition-all border border-gray-300 p-6 bg-white flex flex-col justify-between min-h-[180px]" onClick={() => setSelectedPlan(plan)}>
                      <Flex alignItems="center" justifyContent="between">
                        <div className="flex items-center space-x-2">
                          <Users size={22} className="text-red-600" />
                          <Metric className="text-lg font-semibold text-black">{plan.nombrePlan}</Metric>
                        </div>
                        <Badge color="gray" className="text-xs font-medium">{plan.clientes.length} clientes</Badge>
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
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button
                size="xs"
                color={clientDesempenoFilter === 'all' ? 'red' : 'gray'}
                variant={clientDesempenoFilter === 'all' ? 'primary' : 'secondary'}
                onClick={() => setClientDesempenoFilter('all')}
              >Todos</Button>
              <Button
                size="xs"
                color={clientDesempenoFilter === 'red' ? 'red' : 'gray'}
                variant={clientDesempenoFilter === 'con' ? 'primary' : 'secondary'}
                onClick={() => setClientDesempenoFilter('con')}
              >Con desempeño</Button>
              <Button
                size="xs"
                color={clientDesempenoFilter === 'gray' ? 'gray' : 'gray'}
                variant={clientDesempenoFilter === 'sin' ? 'primary' : 'secondary'}
                onClick={() => setClientDesempenoFilter('sin')}
              >Sin desempeño</Button>
            </div>
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
                  const searchMatch = fullName.includes(clientSearch.toLowerCase());
                  const d = clientesConDesempeno[cliente.idCliente];
                  if (clientDesempenoFilter === 'con') return searchMatch && d && d.idDesempeno;
                  if (clientDesempenoFilter === 'sin') return searchMatch && (!d || !d.idDesempeno);
                  return searchMatch;
                })
                .map(cliente => {
                  const d = clientesConDesempeno[cliente.idCliente];
                  return (
                    <Card key={cliente.idCliente} decoration="top" decorationColor={d && d.idDesempeno ? 'red' : 'gray'} className={`border ${d && d.idDesempeno ? 'border-red-300' : 'border-gray-300'} hover:shadow-xl transition-all p-6 space-y-4 bg-white flex flex-col justify-between min-h-[220px]`}>
                      <Flex alignItems="center" justifyContent="between">
                        <div className="flex items-center space-x-2">
                          <User size={20} className="text-gray-900" />
                          <Metric className="text-lg font-semibold text-black">{cliente.nombre} {cliente.apellido}</Metric>
                        </div>
                        {getDesempenoBadge(d)}
                      </Flex>
                      <div className="space-y-2 mt-2">
                        <Flex alignItems="center" className="space-x-2">
                          <Calendar size={16} className="text-gray-900" />
                          <Text className="text-xs font-medium text-gray-700">Horarios:</Text>
                        </Flex>
                        <div className="flex flex-col gap-2 mt-2">
                          {cliente.horarios && cliente.horarios.length > 0 ? (
                            (() => {
                              const diasOrden = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
                              const horariosOrdenados = cliente.horarios.slice().sort((a, b) => diasOrden.indexOf(a.diaSemana) - diasOrden.indexOf(b.diaSemana));
                              return horariosOrdenados.map((h) => (
                                <div key={h.idHorario || `${h.diaSemana}-${h.horaInicio}-${h.horaFin}`}
                                  className="bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-700 flex flex-col shadow-sm border border-gray-200">
                                  <span className="font-semibold text-red-700">{h.diaSemana}</span>
                                  <span className="ml-2">{h.horaInicio} - {h.horaFin}</span>
                                </div>
                              ));
                            })()
                          ) : (
                            <Text className="text-gray-400 text-xs">Sin horarios</Text>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 justify-end">
                        {d && d.idDesempeno ? (
                          <Button color="red" size="xs" className="font-semibold" onClick={() => openViewModal(cliente)}>Ver desempeño</Button>
                        ) : (
                          <Button color="gray" size="xs" className="font-semibold" onClick={() => openRegisterModal(cliente)}>Registrar desempeño</Button>
                        )}
                      </div>
                    </Card>
                  );
                })
            )}
          </Grid>
        </>
      )}
      {/* Modal para registrar/ver/editar desempeño */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeModal}
              disabled={submitting}
              aria-label="Cerrar"
            >
              &times;
            </button>
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-black tracking-tight">
                  {modalMode === 'register' && (<span className="flex items-center gap-2"><Edit2 size={18} className="text-red-600" />Registrar Desempeño</span>)}
                  {modalMode === 'view' && (<span className="flex items-center gap-2"><Info size={18} className="text-red-600" />Ver Desempeño</span>)}
                  {modalMode === 'edit' && (<span className="flex items-center gap-2"><Edit2 size={18} className="text-red-600" />Actualizar Desempeño</span>)}
                </h3>
              </div>
              {selectedCliente && (
                <span className="text-base font-semibold text-gray-700 mt-2 flex items-center gap-2"><User size={16} className="text-gray-500" />{selectedCliente.nombre} {selectedCliente.apellido}</span>
              )}
            </div>
            {/* Mensaje global de éxito o error con colores mejorados */}
            {(showSuccess || formError) && (
              <div className={`px-4 py-3 rounded-lg text-base text-center mb-4 animate-fade-in border font-semibold flex items-center justify-center gap-2 ${showSuccess ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-700'}`}>
                {showSuccess ? (
                  <>
                    <CheckCircle size={22} className="text-green-600" />
                    <span>{showSuccess}</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={22} className="text-red-600" />
                    <span>{formError}</span>
                  </>
                )}
              </div>
            )}
            {modalMode === 'view' ? (
              <div className="space-y-4 text-base bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-md w-full max-w-lg mx-auto">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-2">
                  <div className="flex flex-col gap-1"><span className="font-bold text-black flex items-center gap-1"><Activity size={16} className="text-red-600" />Peso (kg)</span> <span className="text-gray-700 break-words max-w-xs">{form.peso}</span></div>
                  <div className="flex flex-col gap-1"><span className="font-bold text-black flex items-center gap-1"><BarChart2 size={16} className="text-red-600" />Estatura (m)</span> <span className="text-gray-700 break-words max-w-xs">{form.estatura}</span></div>
                  <div className="flex flex-col gap-1"><span className="font-bold text-black flex items-center gap-1"><Hash size={16} className="text-red-600" />IMC</span> <span className="text-gray-700 break-words max-w-xs">{form.imc}</span></div>
                  <div className="flex flex-col gap-1"><span className="font-bold text-black flex items-center gap-1"><Clipboard size={16} className="text-red-600" />Diagnóstico</span> <span className="text-gray-700 break-words max-w-xs whitespace-pre-line" style={{maxHeight:'6em',overflow:'auto'}}>{form.diagnostico}</span></div>
                  <div className="flex flex-col gap-1"><span className="font-bold text-black flex items-center gap-1"><Award size={16} className="text-red-600" />Indicador</span> <span className="text-gray-700 break-words max-w-xs">{form.indicador}</span></div>
                  <div className="flex flex-col gap-1"><span className="font-bold text-black flex items-center gap-1"><Heart size={16} className="text-red-600" />Edad</span> <span className="text-gray-700 break-words max-w-xs">{form.edad}</span></div>
                  <div className="flex flex-col gap-1"><span className="font-bold text-black flex items-center gap-1"><Activity size={16} className="text-red-600" />Nivel Físico</span> <span className="text-gray-700 break-words max-w-xs">{form.nivelFisico}</span></div>
                  <div className="flex flex-col gap-1"><span className="font-bold text-black flex items-center gap-1"><Shield size={16} className="text-red-600" />Estado</span> <span className="text-gray-700 break-words max-w-xs">{form.estado ? 'Activo' : 'Inactivo'}</span></div>
                  {clientesConDesempeno[selectedCliente?.idCliente]?.creadoPor && (
                    <div className="flex flex-col gap-1 col-span-2"><span className="font-bold text-black flex items-center gap-1"><UserCheck size={16} className="text-red-600" />Creado por</span> <span className="text-gray-700 break-words max-w-2xl">{clientesConDesempeno[selectedCliente?.idCliente]?.creadoPor}</span></div>
                  )}
                  {clientesConDesempeno[selectedCliente?.idCliente]?.fechaCreacion && (
                    <div className="flex flex-col gap-1 col-span-2"><span className="font-bold text-black flex items-center gap-1"><Clock size={16} className="text-red-600" />Fecha de creación</span> <span className="text-gray-700 break-words max-w-2xl">{new Date(clientesConDesempeno[selectedCliente?.idCliente]?.fechaCreacion).toLocaleString()}</span></div>
                  )}
                  {clientesConDesempeno[selectedCliente?.idCliente]?.fechaModificacion && (
                    <div className="flex flex-col gap-1 col-span-2"><span className="font-bold text-black flex items-center gap-1"><RefreshCw size={16} className="text-red-600" />Fecha de modificación</span> <span className="text-gray-700 break-words max-w-2xl">{new Date(clientesConDesempeno[selectedCliente?.idCliente]?.fechaModificacion).toLocaleString()}</span></div>
                  )}
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-center gap-3 mt-2">
                  <button type="button" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60 font-semibold shadow flex items-center gap-2" onClick={enableEdit}>Actualizar</button>
                  <button type="button" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-60 font-semibold shadow flex items-center gap-2" onClick={() => setShowDeleteConfirm(true)} disabled={submitting}>Eliminar</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-base bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-md w-full max-w-lg mx-auto">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-2">
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1"><Activity size={14} className="text-red-600" />Peso (kg)</label>
                    <input type="number" name="peso" value={form.peso} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" required min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1"><BarChart2 size={14} className="text-red-600" />Estatura (m)</label>
                    <input type="number" name="estatura" value={form.estatura} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" required min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1"><Hash size={14} className="text-red-600" />IMC</label>
                    <input type="number" name="imc" value={form.imc} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100" tabIndex={-1} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1"><Clipboard size={14} className="text-red-600" />Diagnóstico</label>
                    <input type="text" name="diagnostico" value={form.diagnostico} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" required minLength={10} maxLength={100} />
                    <div className="text-xs text-gray-500 mt-1 text-right">{form.diagnostico.length}/100</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1"><Award size={14} className="text-red-600" />Indicador</label>
                    <input type="text" name="indicador" value={form.indicador} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100" tabIndex={-1} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1"><Heart size={14} className="text-red-600" />Edad</label>
                    <input type="number" name="edad" value={form.edad} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" required min="18" max="120" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1"><Activity size={14} className="text-red-600" />Nivel Físico</label>
                    <select name="nivelFisico" value={form.nivelFisico} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" required>
                      <option value="">Selecciona nivel</option>
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-2 flex items-center gap-1"><Shield size={14} className="text-red-600" />Estado</label>
                    <select name="estado" value={form.estado ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, estado: e.target.value === 'true' }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-center gap-3 mt-2">
                  {(modalMode === 'register' || modalMode === 'edit') && (
                    <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-60 font-semibold shadow flex items-center gap-2" disabled={submitting}>
                      <CheckCircle size={16} />
                      {(() => {
                        if (submitting) return modalMode === 'edit' ? 'Actualizando...' : 'Registrando...';
                        return modalMode === 'edit' ? 'Actualizar' : 'Registrar';
                      })()}
                    </button>
                  )}
                  {modalMode === 'edit' && (
                    <button type="button" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60 font-semibold shadow flex items-center gap-2" onClick={closeModal} disabled={submitting}>
                      <Trash2 size={16} />Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}
            {/* Confirmación de eliminación */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center animate-fade-in border border-red-400">
                  <p className="mb-4 font-semibold text-red-700 flex items-center justify-center gap-2">
                    <Trash2 size={22} className="text-red-600" />
                    ¿Está seguro que desea eliminar este desempeño? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2" onClick={handleDelete} disabled={submitting}><Trash2 size={18} />Sí, eliminar</button>
                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-semibold flex items-center gap-2" onClick={() => setShowDeleteConfirm(false)} disabled={submitting}><Shield size={18} />Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerPerformanceManagementPage;
