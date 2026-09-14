'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from './ui/AppLogo';
import { FileText, Users, ChevronLeft, ChevronRight, LogOut, Menu, Download } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    key: 'nav-hc',
    label: 'Historia Clínica',
    href: '/',
    icon: FileText,
    badge: null,
  },
  {
    key: 'nav-patients',
    label: 'Pacientes',
    href: '/patient-records-management',
    icon: Users,
    badge: null,
  },
  {
    key: 'nav-export',
    label: 'Exportar / Importar',
    href: '/export-import',
    icon: Download,
    badge: null,
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-border ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <AppLogo size={36} src="/assets/kidney-stethoscope-logo.svg" />
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-bold text-sm text-primary block leading-tight">
              NefroHC
            </span>
            <span className="text-xs text-muted-foreground block leading-tight">
              Dr. González
            </span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className={`mb-2 ${collapsed ? 'hidden' : 'block'}`}>
          <span className="text-xs font-600 text-muted-foreground uppercase tracking-widest px-2">
            Módulos
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive
                  ? 'bg-accent text-white font-semibold shadow-sm'
                  : 'text-foreground hover:bg-muted hover:text-primary'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
              {item.badge && !collapsed && (
                <span className="ml-auto bg-danger text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-primary text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Doctor Info + Logout */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="px-2 py-2 mb-2">
            <p className="text-xs font-semibold text-foreground truncate">
              Dr. Hernando González
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Nefrólogo · RM 01-6566-87
            </p>
          </div>
        )}
        <Link
          href="/login-screen"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-danger-bg hover:text-danger transition-all duration-150 group relative"
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm">Cerrar sesión</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-primary text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              Cerrar sesión
            </span>
          )}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out shrink-0 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <NavContent />
        <button
          onClick={onToggle}
          className="absolute top-16 -right-3 bg-card border border-border rounded-full p-1 shadow-card hover:bg-muted transition-colors z-10"
          style={{ position: 'fixed', left: collapsed ? '52px' : '212px', top: '64px' }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight size={14} className="text-muted-foreground" />
          ) : (
            <ChevronLeft size={14} className="text-muted-foreground" />
          )}
        </button>
      </aside>

      {/* Mobile Hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-card border border-border rounded-lg p-2 shadow-card"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={20} className="text-primary" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}