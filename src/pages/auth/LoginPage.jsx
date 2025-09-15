// filepath: c:\7MOCICLO\APP_GYM_BACK_FRONT\gym-admin-front\src\pages\auth\LoginPage.jsx
import { useState } from "react";
import LoginForm from "../../components/common/LoginForm";
import logoImage from "../../assets/LOGO BUSSTER GYM.png";

const LoginPage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans"
      style={{ backgroundColor: "#090909" }}
    >
      <div
        className="relative w-full max-w-5xl flex items-center justify-center overflow-hidden min-h-[650px] sm:min-h-[700px]"
      >
        {/* Logo y mensaje */}
        <div
          className={`flex flex-col items-center justify-center absolute transition-all duration-[1400ms] ease-in-out
            ${showForm
              ? "md:-translate-x-[220px] md:left-1/4 left-1/2 -translate-x-1/2"
              : "left-1/2 -translate-x-1/2"}
            w-full md:w-auto`}
          style={{ zIndex: 2 }}
        >
          <img
            src={logoImage}
            alt="Logo"
            className={`cursor-pointer transition-all duration-[1400ms] ease-in-out
              ${showForm ? "w-80 h-80 md:w-[420px] md:h-[420px]" : "w-64 h-64 md:w-[320px] md:h-[320px]"}
              select-none
            `}
            onClick={() => setShowForm((prev) => !prev)}
            draggable={false}
            style={{
              objectFit: "contain",
              aspectRatio: "1/1",
            }}
          />
          {/* Mensaje solo cuando el logo está centrado */}
          <div
            className={`transition-all duration-700 ease-in-out ${
              showForm
                ? "opacity-0 translate-y-4 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
          >
            {!showForm && (
              <>
                <h1 className="text-xl md:text-2xl mt-6 font-medium text-gray-200 text-center tracking-tight font-sans">
                  ¡Bienvenido a{" "}
                  <span className="text-red-700 font-bold">Buster Gym</span>!
                </h1>
                <p className="text-center text-xs text-gray-400 mt-2 font-normal tracking-wide font-sans">
                  Haz clic en el logo para iniciar sesión
                </p>
              </>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div
          className={`absolute right-0 bg-neutral-800/80 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col
            transition-all duration-700 ease-in-out
            ${showForm
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-full pointer-events-none"}
          `}
          style={{ zIndex: 3 }}
        >
          {/* Título y subtítulo */}
          <h1 className="text-center text-3xl font-extrabold text-white mb-1 tracking-tight mt-2">
            <span className="text-red-700">BUSTER</span> GYM
          </h1>
          <p className="text-center text-base text-gray-300 font-medium tracking-wide mb-6">
            Sistema de Administración
          </p>
          <p className="text-center text-sm text-gray-400 font-normal tracking-wide mb-8 mt-2">
            Solo acceso a usuarios autorizados.
          </p>

          {/* Formulario real */}
          <LoginForm />

          {/* Derechos reservados */}
          <div className="text-center text-xs text-gray-500 mt-8">
            © {new Date().getFullYear()} Buster GYM. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;