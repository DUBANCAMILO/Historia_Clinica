'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';
import PatientStatsCards from './PatientStatsCards';
import PatientTable from './PatientTable';
import PatientChartsSection from './PatientChartsSection';
import DeleteConfirmModal from './DeleteConfirmModal';
import PatientPreviewModal from './PatientPreviewModal';
import PatientOrdersModal from './PatientOrdersModal';
import { createAutomaticBackup, recordAudit } from '../../../lib/localData';

export interface PatientRecord {
  [key: string]: unknown;
  _id: string;
  fecha: string;
  nombre: string;
  cc: string;
  edad: string;
  sexo: string;
  eps: string;
  tfg: string;
  kdigo: string;
  crea_calc: string;
  imc: string;
  cie10: string;
  motivo: string;
  plan_tto: string;
  _savedAt: string;
}

const MOCK_RECORDS: PatientRecord[] = [
  {
    _id: 'hc-001',
    fecha: '2026-09-05',
    nombre: 'Carlos Ramírez Peña',
    cc: '91234567',
    edad: '68',
    sexo: 'M',
    eps: 'Sanitas',
    tfg: '52 ml/min/1.73',
    kdigo: 'G3a',
    crea_calc: '1.4',
    imc: '24.2',
    cie10: 'N18.3 I10',
    motivo: 'Control ERC G3a',
    plan_tto: 'Losartán 100mg, Amlodipino 10mg',
    _savedAt: '2026-09-05T10:30:00Z',
  },
  {
    _id: 'hc-002',
    fecha: '2026-09-04',
    nombre: 'María Esperanza Vargas',
    cc: '43765890',
    edad: '72',
    sexo: 'F',
    eps: 'Compensar',
    tfg: '28 ml/min/1.73',
    kdigo: 'G3b',
    crea_calc: '2.1',
    imc: '27.8',
    cie10: 'N18.3 E11.9',
    motivo: 'Control DM2 + ERC',
    plan_tto: 'Losartán 50mg, Insulina NPH',
    _savedAt: '2026-09-04T14:15:00Z',
  },
  {
    _id: 'hc-003',
    fecha: '2026-09-03',
    nombre: 'Jorge Alberto Mendoza',
    cc: '77890123',
    edad: '55',
    sexo: 'M',
    eps: 'Nueva EPS',
    tfg: '78 ml/min/1.73',
    kdigo: 'G2',
    crea_calc: '1.1',
    imc: '29.3',
    cie10: 'N18.2 I10',
    motivo: 'Seguimiento HTA + microalbuminuria',
    plan_tto: 'Enalapril 20mg, Hidroclorotiazida 25mg',
    _savedAt: '2026-09-03T09:00:00Z',
  },
  {
    _id: 'hc-004',
    fecha: '2026-09-02',
    nombre: 'Luz Marina Torres',
    cc: '52341678',
    edad: '63',
    sexo: 'F',
    eps: 'Sanitas',
    tfg: '18 ml/min/1.73',
    kdigo: 'G4',
    crea_calc: '3.4',
    imc: '22.1',
    cie10: 'N18.4 I12',
    motivo: 'Preparación para diálisis',
    plan_tto: 'Eritropoyetina 4000UI, Furosemida 80mg',
    _savedAt: '2026-09-02T11:45:00Z',
  },
  {
    _id: 'hc-005',
    fecha: '2026-09-01',
    nombre: 'Andrés Felipe Gómez',
    cc: '88123456',
    edad: '44',
    sexo: 'M',
    eps: 'Famisanar',
    tfg: '95 ml/min/1.73',
    kdigo: 'G1',
    crea_calc: '0.9',
    imc: '26.4',
    cie10: 'N00.9',
    motivo: 'Hematuria macroscópica',
    plan_tto: 'Observación, control en 3 meses',
    _savedAt: '2026-09-01T16:20:00Z',
  },
  {
    _id: 'hc-006',
    fecha: '2026-08-28',
    nombre: 'Rosa Elena Castillo',
    cc: '36789012',
    edad: '79',
    sexo: 'F',
    eps: 'Compensar',
    tfg: '12 ml/min/1.73',
    kdigo: 'G5',
    crea_calc: '5.2',
    imc: '20.8',
    cie10: 'N18.5 I13.1',
    motivo: 'ERC terminal, valoración diálisis',
    plan_tto: 'Hemodiálisis 3x/sem, Eritropoyetina',
    _savedAt: '2026-08-28T08:30:00Z',
  },
  {
    _id: 'hc-007',
    fecha: '2026-08-25',
    nombre: 'Pedro Antonio Rojas',
    cc: '19456789',
    edad: '58',
    sexo: 'M',
    eps: 'Salud Total',
    tfg: '61 ml/min/1.73',
    kdigo: 'G2',
    crea_calc: '1.2',
    imc: '31.2',
    cie10: 'N18.2 E11.9 I10',
    motivo: 'Control anual DM2 + HTA',
    plan_tto: 'Metformina 1g, Losartán 100mg',
    _savedAt: '2026-08-25T13:10:00Z',
  },
  {
    _id: 'hc-008',
    fecha: '2026-08-20',
    nombre: 'Gloria Inés Herrera',
    cc: '41234567',
    edad: '66',
    sexo: 'F',
    eps: 'Nueva EPS',
    tfg: '41 ml/min/1.73',
    kdigo: 'G3b',
    crea_calc: '1.8',
    imc: '25.6',
    cie10: 'N18.3 M32.9',
    motivo: 'Lupus eritematoso + nefritis',
    plan_tto: 'Prednisona 20mg, Micofenolato 1g',
    _savedAt: '2026-08-20T10:00:00Z',
  },
  {
    _id: 'hc-009',
    fecha: '2026-08-15',
    nombre: 'Hernán Darío Suárez',
    cc: '71234890',
    edad: '51',
    sexo: 'M',
    eps: 'Sanitas',
    tfg: '88 ml/min/1.73',
    kdigo: 'G1',
    crea_calc: '1.0',
    imc: '28.1',
    cie10: 'N04.9',
    motivo: 'Síndrome nefrótico debut',
    plan_tto: 'Prednisona 60mg, Furosemida 40mg',
    _savedAt: '2026-08-15T09:30:00Z',
  },
  {
    _id: 'hc-010',
    fecha: '2026-08-10',
    nombre: 'Claudia Patricia Jiménez',
    cc: '55678901',
    edad: '47',
    sexo: 'F',
    eps: 'Famisanar',
    tfg: '35 ml/min/1.73',
    kdigo: 'G3b',
    crea_calc: '1.9',
    imc: '23.5',
    cie10: 'N18.3 I10 E11',
    motivo: 'Control trimestral ERC',
    plan_tto: 'Valsartán 160mg, Amlodipino 5mg',
    _savedAt: '2026-08-10T14:00:00Z',
  },
];

export default function PatientRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [search, setSearch] = useState(() => { if (typeof window === 'undefined') return ''; const value = localStorage.getItem('nefrohc_global_search') || ''; localStorage.removeItem('nefrohc_global_search'); return value; });
  const [kdigoFilter, setKdigoFilter] = useState('all');
  const [epsFilter, setEpsFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<PatientRecord | null>(null);
  const [previewTarget, setPreviewTarget] = useState<PatientRecord | null>(null);
  const [ordersTarget, setOrdersTarget] = useState<PatientRecord | null>(null);
  const [evolution, setEvolution] = useState<Record<string, Array<{ fecha: string; tfg: number; creatinina: number; potasio?: number; hemoglobina?: number; proteinuria?: number; calcio?: number; fosforo?: number; pth?: number }>>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const uniqueRecords = (items: PatientRecord[]) => Array.from(new Map(items.map((record) => [record._id, record])).values());
    const loadRecords = async () => {
      let stored: PatientRecord[] = [];
      try { setEvolution(JSON.parse(localStorage.getItem('nefro_evolution') || '{}')); } catch { setEvolution({}); }
      try {
        const parsed = JSON.parse(localStorage.getItem('hcs_hgc') || '[]');
        stored = Array.isArray(parsed) ? parsed : [];
      } catch { stored = []; }
      // Renderiza de inmediato la copia local; SQLite se consulta en segundo plano.
      setRecords(uniqueRecords(stored));
      try {
        const documents = await Promise.race([
          invoke<string[]>('load_history_json'),
          new Promise<string[]>((resolve) => window.setTimeout(() => resolve([]), 500)),
        ]);
        const sqliteRecords = documents.map((item) => JSON.parse(item) as PatientRecord);
        setRecords(uniqueRecords([...stored, ...sqliteRecords]));
      } catch { /* web preview or first run */ }
    };
    void loadRecords();
    const refresh = () => void loadRecords();
    window.addEventListener('nefrohc:data-updated', refresh);
    return () => window.removeEventListener('nefrohc:data-updated', refresh);
  }, []);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !search ||
        r.nombre.toLowerCase().includes(search.toLowerCase()) ||
        r.cc.includes(search) ||
        r.eps.toLowerCase().includes(search.toLowerCase()) ||
        String(r.hcno || '').toLowerCase().includes(search.toLowerCase()) ||
        String(r.cie10 || '').toLowerCase().includes(search.toLowerCase());
      const matchKdigo = kdigoFilter === 'all' || r.kdigo === kdigoFilter;
      const matchEps = epsFilter === 'all' || r.eps === epsFilter;
      return matchSearch && matchKdigo && matchEps;
    });
  }, [records, search, kdigoFilter, epsFilter]);

  const epsOptions = useMemo(() => {
    const all = Array.from(new Set(records.map((r) => r.eps)));
    return all;
  }, [records]);

  const handleDelete = async (record: PatientRecord) => {
    setDeletingId(record._id);
    const safetyPath = await createAutomaticBackup(`Antes de eliminar historia ${record._id}`, true);
    if ('__TAURI_INTERNALS__' in window && !safetyPath) {
      toast.error('No se eliminó la historia porque no se pudo crear el respaldo de seguridad.');
      setDeletingId(null);
      return;
    }
    const stored = JSON.parse(localStorage.getItem('hcs_hgc') || '[]');
    localStorage.setItem('hcs_hgc', JSON.stringify(stored.filter((item: PatientRecord) => item._id !== record._id)));
    try {
      const orders = JSON.parse(localStorage.getItem('nefrohc_external_orders') || '[]');
      localStorage.setItem('nefrohc_external_orders', JSON.stringify((Array.isArray(orders) ? orders : []).filter((item: { historyId?: string }) => item.historyId !== record._id)));
      const recipes = JSON.parse(localStorage.getItem('nefrohc_recipes') || '[]');
      localStorage.setItem('nefrohc_recipes', JSON.stringify((Array.isArray(recipes) ? recipes : []).filter((item: { historyId?: string }) => item.historyId !== record._id)));
      const manualOrders = JSON.parse(localStorage.getItem('nefrohc_manual_orders') || '[]');
      localStorage.setItem('nefrohc_manual_orders', JSON.stringify((Array.isArray(manualOrders) ? manualOrders : []).filter((item: { historyId?: string }) => item.historyId !== record._id)));
    } catch { /* la historia sigue siendo eliminable aunque falte una copia secundaria */ }
    try { await invoke('delete_history_json', { id: record._id }); } catch { /* web preview */ }
    recordAudit('DELETE', 'Historia clínica', record._id, `Eliminación de ${record.nombre}`);
    setRecords((prev) => prev.filter((r) => r._id !== record._id));
    window.dispatchEvent(new Event('nefrohc:data-updated'));
    setDeleteTarget(null);
    setDeletingId(null);
    toast.success(`Historia de ${record.nombre} eliminada`);
  };

  const goToNewHistory = () => {
    localStorage.removeItem('nefrohc_selected_history');
    router.push('/');
  };
  const startNewEncounter = (record: PatientRecord) => {
    localStorage.setItem('nefrohc_selected_history', JSON.stringify({ fecha: new Date().toISOString().slice(0, 10), ciudad: record.ciudad || 'Bucaramanga', nombre: record.nombre, cc: record.cc, edad: record.edad, sexo: record.sexo, cel: record.cel, eps: record.eps, allergies: record.allergies, acompanante: record.acompanante, history_id: '', prescription_id: '', hcno: '', medications: [], riskAlerts: [] }));
    router.push('/');
  };

  const handleExport = () => {
    const csv = [
      ['Fecha', 'Nombre', 'CC', 'Edad', 'TFG', 'KDIGO', 'Creatinina', 'EPS', 'CIE-10'].join(','),
      ...filtered.map((r) =>
        [r.fecha, r.nombre, r.cc, r.edad, r.tfg, r.kdigo, r.crea_calc, r.eps, r.cie10].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pacientes_nefro.csv';
    a.click();
    toast.success('Exportado como CSV');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="patient-management-header bg-card border-b border-border px-6 lg:px-8 py-5 lg:pl-8 pl-16">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Gestión de Pacientes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Base de datos de historias clínicas — Dr. González · Bucaramanga
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-95"
            >
              <Download size={15} />
              Exportar CSV
            </button>
            <button
              onClick={goToNewHistory}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-accent transition-all active:scale-95"
            >
              <Plus size={15} />
              Nueva HC
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <PatientStatsCards records={records} filtered={filtered} />

        {/* Charts */}
        <PatientChartsSection records={records} />

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-48">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, CC o EPS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-muted-foreground" />
            <select
              value={kdigoFilter}
              onChange={(e) => setKdigoFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
            >
              <option value="all">Todos KDIGO</option>
              {['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5'].map((g) => (
                <option key={`kdigo-opt-${g}`} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              value={epsFilter}
              onChange={(e) => setEpsFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
            >
              <option value="all">Todas las EPS</option>
              {epsOptions.map((eps) => (
                <option key={`eps-opt-${eps}`} value={eps}>
                  {eps}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted-foreground ml-auto font-tabular">
            {filtered.length} de {records.length} pacientes
          </span>
        </div>

        {/* Table */}
        <PatientTable
          records={filtered}
          onDelete={(r) => setDeleteTarget(r)}
          onView={(r) => { setPreviewTarget(r); recordAudit('VIEW', 'Historia clínica', r._id, `Visualización de ${r.nombre}`); }}
          onOrders={(r) => { setOrdersTarget(r); recordAudit('VIEW', 'Órdenes médicas', r._id, `Consulta de órdenes de ${r.nombre}`); }}
        />
      </div>

      {previewTarget && <PatientPreviewModal record={previewTarget} historyRecords={records} evolution={evolution[previewTarget.cc || previewTarget.nombre] || []} onClose={() => setPreviewTarget(null)} onNewEncounter={(record) => { setPreviewTarget(null); startNewEncounter(record); }} />}
      {ordersTarget && <PatientOrdersModal record={ordersTarget} onClose={() => setOrdersTarget(null)} />}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          record={deleteTarget}
          loading={deletingId === deleteTarget._id}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}