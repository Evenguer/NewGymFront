import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ClientProfileDetails from '../components/Profile/ClientProfileDetails';
import PasswordChangeForm from '../components/Profile/PasswordChangeForm';
import { getClientProfile, updateClientPassword } from '../services/clientAPI';
import { CheckCircle } from 'react-feather';

const Toast = ({ message, onClose }) => (
  <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 bg-green-600 text-white" style={{ minWidth: 280 }}>
    <CheckCircle size={22} />
    <span className="font-medium">{message}</span>
    <button className="ml-4 text-white text-xl" onClick={onClose}>&times;</button>
  </div>
);

const ClientProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastPassword, setLastPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setError('');
      try {
        const token = localStorage.getItem('token');
        const data = await getClientProfile(token);
        setProfile(data);
      } catch (err) {
        setProfile(null);
        setError(err.message || 'No se pudo cargar el perfil.');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordChange = async (data) => {
    setLoadingPassword(true);
    // NO usar setError aquí, solo dejar el throw
    try {
      const token = localStorage.getItem('token');
      await updateClientPassword(data, token);
    } catch (err) {
      throw err; // Para que el formulario muestre el error
    } finally {
      setLoadingPassword(false);
    }
  };

  // Recibe la nueva contraseña al cerrar el modal
  const handleClosePasswordForm = (newPassword) => {
    setShowPasswordForm(false);
    if (newPassword) {
      setLastPassword(newPassword);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2500);
    }
  };

  if (loadingProfile) {
    return <LoadingSpinner message="Cargando perfil..." />;
  }

  if (!profile) {
    return <div className="text-center py-10 text-red-600">{error || 'No se pudo cargar el perfil.'}</div>;
  }
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent overflow-hidden">
      <div className="w-full max-w-7xl h-full flex items-center justify-center">
        <div className="w-full">
          <ClientProfileDetails profile={profile} onShowPasswordForm={() => setShowPasswordForm(true)} />
        </div>
      </div>
      {showPasswordForm && (
        <PasswordChangeForm
          onSubmit={handlePasswordChange}
          loading={loadingPassword}
          onClose={handleClosePasswordForm}
        />
      )}
      {showSuccessToast && (
        <Toast
          message={`¡Contraseña cambiada exitosamente! Nueva contraseña: ${lastPassword}`}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
};

export default ClientProfilePage;