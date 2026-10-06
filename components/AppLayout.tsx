'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { createAutomaticBackup, recordAudit } from '../src/lib/localData';
import WindowControls from './WindowControls';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // La sesión local no se reutiliza al abrir nuevamente el sistema: cada
    // inicio de la aplicación comienza en el login. Durante la navegación
    // actual se conserva mediante sessionStorage.
    const runtimeSession = sessionStorage.getItem('nefrohc_runtime_session');
    if (!localStorage.getItem('nefrohc_session') || runtimeSession !== '1') {
      localStorage.removeItem('nefrohc_session');
      router.replace('/login-screen');
      return;
    }
    const clearOnClose = () => { localStorage.removeItem('nefrohc_session'); sessionStorage.removeItem('nefrohc_runtime_session'); };
    window.addEventListener('beforeunload', clearOnClose);
    return () => window.removeEventListener('beforeunload', clearOnClose);
  }, [router]);

  useEffect(() => {
    if (sessionStorage.getItem('nefrohc_runtime_session') !== '1') return;
    void createAutomaticBackup('Respaldo al iniciar sesión');
    const timer = window.setInterval(() => void createAutomaticBackup('Respaldo periódico automático'), 5 * 60 * 1000);
    const onDataUpdated = () => void createAutomaticBackup('Cambio clínico guardado');
    const onSettingsUpdated = () => void createAutomaticBackup('Configuración del consultorio guardada');
    window.addEventListener('nefrohc:data-updated', onDataUpdated);
    window.addEventListener('nefrohc:settings-updated', onSettingsUpdated);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('nefrohc:data-updated', onDataUpdated);
      window.removeEventListener('nefrohc:settings-updated', onSettingsUpdated);
    };
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const theme = localStorage.getItem('nefrohc_theme');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    };
    applyTheme();
    window.addEventListener('nefrohc:settings-updated', applyTheme);
    return () => window.removeEventListener('nefrohc:settings-updated', applyTheme);
  }, []);

  useEffect(() => {
    const timeoutMs = 30 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => { clearTimeout(timer); timer = setTimeout(() => { if (localStorage.getItem('nefrohc_session')) { recordAudit('LOGOUT', 'Sesión', 'timeout', 'Cierre automático por inactividad'); localStorage.removeItem('nefrohc_session'); router.replace('/login-screen'); } }, timeoutMs); };
    const events = ['click', 'keydown', 'mousemove'];
    events.forEach((event) => window.addEventListener(event, resetTimer)); resetTimer();
    return () => { clearTimeout(timer); events.forEach((event) => window.removeEventListener(event, resetTimer)); };
  }, [router]);

  return (
    <div className="app-shell flex min-h-screen overflow-x-hidden bg-background">
      <WindowControls />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />
      <main
        className={`min-w-0 flex-1 overflow-y-auto ${
          sidebarCollapsed ? 'ml-0' : 'ml-0'
        }`}
      >
        {children}
      </main>
    </div>
  );
}