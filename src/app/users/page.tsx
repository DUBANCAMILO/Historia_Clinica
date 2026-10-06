'use client';
import React, { useEffect, useState } from 'react';
import { KeyRound, Plus, Shield, Trash2, UserPlus } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { recordAudit } from '../../lib/localData';

interface UserRecord { id: string; name: string; email: string; password: string; role: 'Administrador' | 'Médico' | 'Auxiliar' | 'Consulta'; active: boolean; }
const DEFAULT_USER: UserRecord = { id: 'user-admin', name: 'Administrador', email: 'hergoncor@gmail.com', password: 'NefroHC2026!', role: 'Administrador', active: true };
const KEY = 'nefrohc_users';

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [form, setForm] = useState<Omit<UserRecord, 'id'>>({ name: '', email: '', password: '', role: 'Médico', active: true });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    const initial = Array.isArray(stored) && stored.length ? stored : [DEFAULT_USER];
    setUsers(initial);
    localStorage.setItem(KEY, JSON.stringify(initial));
  }, []);

  const addUser = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) { setMessage('Completa nombre, correo y contraseña.'); return; }
    if (users.some((user) => user.email.toLowerCase() === form.email.toLowerCase())) { setMessage('Ya existe un usuario con ese correo.'); return; }
    const next = [...users, { ...form, id: `user-${Date.now()}` }];
    setUsers(next); localStorage.setItem(KEY, JSON.stringify(next)); recordAudit('CREATE', 'Usuario', form.email, `Usuario ${form.name} creado con rol ${form.role}`); setForm({ name: '', email: '', password: '', role: 'Médico', active: true }); setMessage('Usuario agregado.');
  };
  const removeUser = (id: string) => { if (users.length <= 1) return; const removed = users.find((user) => user.id === id); const next = users.filter((user) => user.id !== id); setUsers(next); localStorage.setItem(KEY, JSON.stringify(next)); if (removed) recordAudit('DELETE', 'Usuario', id, `Usuario ${removed.name} eliminado`); };
  const toggle = (id: string) => { const next = users.map((user) => user.id === id ? { ...user, active: !user.active } : user); setUsers(next); localStorage.setItem(KEY, JSON.stringify(next)); const changed = next.find((user) => user.id === id); if (changed) recordAudit('UPDATE', 'Usuario', id, `${changed.name} quedó ${changed.active ? 'activo' : 'inactivo'}`); };

  return <AppLayout><div className="min-h-screen bg-background p-4 lg:p-8"><div className="max-w-5xl mx-auto space-y-6">
    <div><h1 className="text-2xl font-extrabold text-primary">Usuarios y roles</h1><p className="text-sm text-muted-foreground mt-1">Administra quién puede entrar al sistema y qué nivel de acceso tiene.</p></div>
    <section className="bg-card border border-border rounded-2xl shadow-card p-5"><h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-primary mb-4"><UserPlus size={18} /> Crear usuario</h2><div className="grid grid-cols-1 md:grid-cols-5 gap-3"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre" className="px-3 py-2.5 border border-input rounded-lg bg-card text-sm" /><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@consultorio.com" className="px-3 py-2.5 border border-input rounded-lg bg-card text-sm" /><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" className="px-3 py-2.5 border border-input rounded-lg bg-card text-sm" /><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRecord['role'] })} className="px-3 py-2.5 border border-input rounded-lg bg-card text-sm"><option>Administrador</option><option>Médico</option><option>Auxiliar</option><option>Consulta</option></select><button onClick={addUser} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-accent"><Plus size={17} /> Agregar</button></div>{message && <p className="text-sm text-accent mt-3">{message}</p>}</section>
    <section className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"><div className="px-5 py-4 border-b border-border flex items-center gap-2"><Shield size={18} className="text-accent" /><h2 className="font-bold text-primary">Usuarios registrados</h2></div><div className="divide-y divide-border">{users.map((user) => <div key={user.id} className="p-4 flex flex-wrap items-center gap-3"><div className="w-10 h-10 rounded-full bg-info-bg text-accent flex items-center justify-center"><KeyRound size={18} /></div><div className="flex-1 min-w-[180px]"><p className="font-bold text-foreground">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div><span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground">{user.role}</span><button onClick={() => toggle(user.id)} className={`px-3 py-1 rounded-full text-xs font-bold ${user.active ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>{user.active ? 'Activo' : 'Inactivo'}</button><button onClick={() => removeUser(user.id)} className="p-2 rounded-lg text-danger hover:bg-danger-bg" title="Eliminar usuario"><Trash2 size={16} /></button></div>)}</div></section>
    <p className="text-xs text-muted-foreground">Para pruebas de escritorio los usuarios se guardan localmente. Antes de uso clínico real se debe activar hash de contraseñas y control de permisos en SQLite.</p>
  </div></div></AppLayout>;
}
