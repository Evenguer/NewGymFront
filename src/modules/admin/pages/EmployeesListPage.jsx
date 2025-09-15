import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listEmployees } from '../../../shared/services/authAPI';
import { useNotification } from '../../../shared/hooks/useNotification';
import { 
  Card, 
  Table, 
  TableHead, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell, 
  Button,
  TextInput,
  Title,
  Flex,
  TabGroup,
  TabList,
  Tab,
  Badge
} from '@tremor/react';
import { Edit, Search } from 'react-feather';
import EditEmployeeModal from '../components/UserManagement/EditEmployeeModal';
import { ActionButtons } from '../components/common/ActionButtons';

const EmployeesListPage = () => {
  const notify = useNotification();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Contadores para las pestañas
  const [counts, setCounts] = useState({
    todos: 0,
    entrenadores: 0,
    recepcionistas: 0
  });
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await listEmployees(token);
      if (!Array.isArray(data)) {
        console.error('Los datos recibidos no son un array:', data);
        setError('Error: Formato de datos incorrecto');
        return;
      }
      setEmployees(data);
      setError(null);
      
      // Actualizar contadores para las pestañas
      const counts = {
        todos: data.length,
        entrenadores: data.filter(emp => emp.roles?.includes('ENTRENADOR')).length,
        recepcionistas: data.filter(emp => emp.roles?.includes('RECEPCIONISTA')).length
      };
      setCounts(counts);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      setError('Error al cargar la lista de empleados');
      notify.error('Error al cargar la lista de empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  // Estado removido ya que se maneja desde la gestión de usuarios
  // Filtrar empleados por búsqueda y por pestaña activa
  const filteredEmployees = employees.filter(employee => {
    // Primero filtrar por pestaña activa (rol)
    if (activeTab === 'entrenadores' && !employee.roles?.includes('ENTRENADOR')) {
      return false;
    }
    if (activeTab === 'recepcionistas' && !employee.roles?.includes('RECEPCIONISTA')) {
      return false;
    }
    
    // Luego filtrar por término de búsqueda
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (employee.nombre || '').toLowerCase().includes(searchTermLower) ||
      (employee.apellidos || '').toLowerCase().includes(searchTermLower) ||
      (employee.correo || '').toLowerCase().includes(searchTermLower) ||
      (employee.dni || '').toLowerCase().includes(searchTermLower) ||
      (employee.ruc || '').toLowerCase().includes(searchTermLower) ||
      (employee.tipoInstructor || '').toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) return (
    <div className="p-4 flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-500 text-center">
      <p>{error}</p>
      <Button onClick={fetchEmployees} color="blue" className="mt-4">
        Intentar de nuevo
      </Button>
    </div>
  );  return (
    <div className="space-y-6"><div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
          <p className="text-gray-500">Administra los empleados del gimnasio</p>
        </div>
      </div><div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Para crear un nuevo empleado, por favor utiliza la opción <strong>"Nuevo Usuario"</strong> en la sección de <Link to="/admin/usuarios" className="font-medium underline">Gestión de Usuarios</Link>.
            </p>
          </div>
        </div>
      </div>      <Card>
        <Flex justifyContent="between" className="mb-4">
          <Title>Lista de Empleados</Title>          <div className="flex space-x-2">
            <div className="w-64">
              <TextInput
                icon={Search}
                placeholder="Buscar por nombre o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Flex>
        
        <TabGroup className="mb-6" onIndexChange={(index) => {
          const tabs = ['todos', 'entrenadores', 'recepcionistas'];
          setActiveTab(tabs[index]);
        }}>
          <TabList variant="solid">
            <Tab>
              Todos <Badge size="xs" color="blue">{counts.todos}</Badge>
            </Tab>
            <Tab>
              Entrenadores <Badge size="xs" color="green">{counts.entrenadores}</Badge>
            </Tab>
            <Tab>
              Recepcionistas <Badge size="xs" color="amber">{counts.recepcionistas}</Badge>
            </Tab>
          </TabList>
        </TabGroup>
          <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Información del Empleado</TableHeaderCell>
              <TableHeaderCell>Contacto y Documentos</TableHeaderCell>
              <TableHeaderCell>Rol y Salario</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No se encontraron empleados con los criterios de búsqueda
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.idEmpleado}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {employee.nombre?.[0]}{employee.apellidos?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.nombre} {employee.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {employee.dni}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{employee.correo}</p>
                      <p className="text-sm text-gray-500">RUC: {employee.ruc || 'No registrado'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{employee.roles ? Array.from(new Set(employee.roles.map(r => r.toUpperCase()))).join(', ') : 'Sin rol'}</p>
                      {employee.tipoInstructor && (
                        <p className="text-xs text-gray-500">Instructor: {employee.tipoInstructor}</p>
                      )}
                      <p className="text-sm text-gray-500">Salario: S/. {employee.salario?.toLocaleString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <ActionButtons
                        onEdit={() => {
                          setSelectedEmployee(employee);
                          setIsEditModalOpen(true);
                        }}
                        showDelete={false}
                        showView={false}
                        hideText={true}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>      
      {/* Modal de edición */}      {isEditModalOpen && (
        <EditEmployeeModal 
          isOpen={isEditModalOpen}
          employee={selectedEmployee}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSave={(updatedEmployee) => {
            // Actualizar la lista de empleados con el empleado actualizado
            setEmployees(prevEmployees => 
              prevEmployees.map(emp => 
                emp.idEmpleado === updatedEmployee.idEmpleado ? updatedEmployee : emp
              )
            );
            notify.success('Empleado actualizado exitosamente');
            // Refrescar la lista de empleados
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
};

export default EmployeesListPage;
