import React from 'react';
import LoginForm from './components/LoginForm';


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-primary flex items-stretch">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-4 border-white" />
          <div className="absolute top-40 left-40 w-40 h-40 rounded-full border-2 border-white" />
          <div className="absolute bottom-32 right-20 w-80 h-80 rounded-full border-4 border-white" />
          <div className="absolute bottom-60 right-48 w-48 h-48 rounded-full border-2 border-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <img
              src="/assets/images/WhatsApp_Image_2026-09-04_at_10.38.24-1788743376541.jpeg"
              alt="NefroHC logo — kidney stethoscope medical symbol"
              className="w-16 h-16 rounded-xl object-cover bg-white p-1"
            />
            <div>
              <h1 className="text-white text-2xl font-bold leading-tight">NefroHC</h1>
              <p className="text-blue-200 text-sm">Sistema de Historia Clínica</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-white text-4xl font-bold leading-tight">
              Nefrología &<br />Medicina Interna
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              Historia clínica digital especializada con calculadora TFG CKD-EPI 2021,
              estadificación KDIGO automática y gestión de recetas.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: 'Calculadora TFG', desc: 'CKD-EPI 2021 automática' },
              { label: 'KDIGO Automático', desc: 'G1 a G5 en tiempo real' },
              { label: 'Recetas digitales', desc: 'Con membrete del médico' },
              { label: 'Base de datos local', desc: 'Sin internet requerido' },
            ]?.map((f) => (
              <div
                key={`feature-${f?.label}`}
                className="bg-white/10 rounded-xl p-4 border border-white/20"
              >
                <p className="text-white font-semibold text-sm">{f?.label}</p>
                <p className="text-blue-200 text-xs mt-1">{f?.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-blue-300 text-xs">
          <p>Dr. Hernando González Cortina · RM 01-6566-87</p>
          <p>Bucaramanga, Colombia · 317 5153473</p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <LoginForm />
      </div>
    </div>
  );
}