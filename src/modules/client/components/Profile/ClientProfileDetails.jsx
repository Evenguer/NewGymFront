import React from 'react';
import {
  Key, Lock
} from 'react-feather';
import {
  FaUser, FaUserCheck, FaIdCard, FaEnvelope, FaMobileAlt, FaVenusMars, FaBirthdayCake, FaHourglassHalf
} from 'react-icons/fa';
import { TbGenderMale, TbGenderFemale } from 'react-icons/tb';

const ClientProfileDetails = ({ profile, onShowPasswordForm }) => {
  const passwordMasked = profile?.password
    ? '•'.repeat(profile.password.length)
    : '••••••••';

  const genero = profile.genero?.toLowerCase();
  let genderIcon = null;
  if (genero === 'masculino' || genero === 'm') {
    genderIcon = (
      <TbGenderMale
        className="text-blue-600 bg-blue-100 rounded-full p-1"
        size={32}
        title="Masculino"
      />
    );
  } else if (genero === 'femenino' || genero === 'f') {
    genderIcon = (
      <TbGenderFemale
        className="text-pink-600 bg-pink-100 rounded-full p-1"
        size={32}
        title="Femenino"
      />
    );
  }

  return (
    <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden border border-gray-100">
      {/* Lateral: Avatar y usuario */}
      <div className="lg:w-1/3 w-full flex flex-col items-center justify-center p-14 gap-8 bg-white">
        <div className="w-44 h-44 rounded-full bg-gray-100 flex items-center justify-center text-8xl font-extrabold text-red-700 border-4 border-white shadow mb-6">
          {profile.nombre[0]}{profile.apellidos[0]}
        </div>
        <div className="flex flex-col items-center w-full min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-800 break-all">{profile.nombreUsuario}</span>
            {genderIcon}
          </div>
        </div>
        <button
          type="button"
          className="mt-8 px-7 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900 text-lg font-semibold shadow transition flex items-center gap-2"
          onClick={onShowPasswordForm}
          title="Cambiar contraseña"
        >
          <Key size={20} /> Cambiar contraseña
        </button>
        <div className="flex items-center gap-3 mt-6 bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
          <Lock size={20} className="text-red-700" />
          <span className="font-mono tracking-widest text-xl select-all">{passwordMasked}</span>
        </div>
      </div>
      {/* Datos personales */}
      <div className="lg:w-2/3 w-full flex flex-col justify-center p-14 bg-white">
        <h2 className="text-3xl font-bold text-red-700 mb-10 text-center lg:text-left">Datos personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          <div className="flex items-stretch gap-4 bg-gray-50 rounded-xl shadow p-6 border border-gray-100">
            <div className="self-stretch flex items-center">
              <FaUser className="text-red-700" size={28} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-lg font-semibold">Nombre:</span>
              <div className="text-base overflow-x-auto whitespace-nowrap min-w-0">{profile.nombre}</div>
            </div>
          </div>
          <div className="flex items-stretch gap-4 bg-gray-50 rounded-xl shadow p-6 border border-gray-100">
            <div className="self-stretch flex items-center">
              <FaUserCheck className="text-red-700" size={28} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-lg font-semibold">Apellidos:</span>
              <div className="text-base overflow-x-auto whitespace-nowrap min-w-0">{profile.apellidos}</div>
            </div>
          </div>
          <div className="flex items-stretch gap-4 bg-gray-50 rounded-xl shadow p-6 border border-gray-100">
            <div className="self-stretch flex items-center">
              <FaIdCard className="text-red-700" size={28} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-lg font-semibold">DNI:</span>
              <div className="text-base overflow-x-auto whitespace-nowrap min-w-0">{profile.dni}</div>
            </div>
          </div>
          <div className="flex items-stretch gap-4 bg-gray-50 rounded-xl shadow p-6 border border-gray-100">
            <div className="self-stretch flex items-center">
              <FaMobileAlt className="text-red-700" size={28} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-lg font-semibold">Celular:</span>
              <div className="text-base overflow-x-auto whitespace-nowrap min-w-0">{profile.celular}</div>
            </div>
          </div>
          <div className="flex items-stretch gap-4 bg-gray-50 rounded-xl shadow p-6 border border-gray-100">
            <div className="self-stretch flex items-center">
              <FaVenusMars className="text-red-700" size={28} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-lg font-semibold">Género:</span>
              <div className="text-base overflow-x-auto whitespace-nowrap min-w-0">{profile.genero || '-'}</div>
            </div>
          </div>
          <div className="flex items-stretch gap-4 bg-gray-50 rounded-xl shadow p-6 border border-gray-100">
            <div className="self-stretch flex items-center">
              <FaBirthdayCake className="text-red-700" size={28} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-lg font-semibold">Fecha de nacimiento:</span>
              <div className="text-base overflow-x-auto whitespace-nowrap min-w-0">{profile.fechaNacimiento || '-'}</div>
            </div>
          </div>
          <div className="flex items-stretch gap-4 bg-gray-50 rounded-xl shadow p-6 border border-gray-100">
            <div className="self-stretch flex items-center">
              <FaHourglassHalf className="text-red-700" size={28} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-lg font-semibold">Edad:</span>
              <div className="text-base overflow-x-auto whitespace-nowrap min-w-0">{profile.edad || '-'}</div>
            </div>
          </div>
          <div className="flex items-stretch gap-4 bg-gray-50 rounded-xl shadow p-6 border border-gray-100">
            <div className="self-stretch flex items-center">
              <FaEnvelope className="text-red-700" size={28} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-lg font-semibold">Correo:</span>
              <div className="text-base overflow-x-auto whitespace-nowrap min-w-0">{profile.correo}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileDetails;