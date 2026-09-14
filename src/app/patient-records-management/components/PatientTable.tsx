'use client';
import React, { useState } from 'react';
import { Eye, Trash2, Edit2, ChevronUp, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PatientRecord } from './PatientRecordsPage';

interface Props {
  records: PatientRecord[];
  onDelete: (r: PatientRecord) => void;
}

type SortKey = keyof PatientRecord;

const KDIGO_BADGE: Record<string, string> = {
  G1: 'bg-success-bg text-success border-success/20',
  G2: 'bg-green-50 text-green-600 border-green-200',
  G3a: 'bg-warning-bg text-warning border-warning/20',
  G3b: 'bg-orange-50 text-orange-600 border-orange-200',
  G4: 'bg-red-50 text-red-500 border-red-200',
  G5: 'bg-danger-bg text-danger border-danger/20',
};

const getTfgColor = (tfg: string) => {
  const v = parseInt(tfg);
  if (v >= 60) return 'text-success font-bold';
  if (v >= 30) return 'text-warning font-bold';
  return 'text-danger font-bold';
};

export default function PatientTable({ records, onDelete }: Props) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sorted = [...records].sort((a, b) => {
    const av = a[sortKey] as string;
    const bv = b[sortKey] as string;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp
        size={10}
        className={
          sortKey === col && sortDir === 'asc' ?'text-accent' :'text-muted-foreground/40'
        }
      />
      <ChevronDown
        size={10}
        className={
          sortKey === col && sortDir === 'desc' ?'text-accent' :'text-muted-foreground/40'
        }
      />
    </span>
  );

  const columns: { key: SortKey; label: string; width?: string }[] = [
    { key: 'fecha', label: 'Fecha', width: 'w-24' },
    { key: 'nombre', label: 'Paciente', width: 'w-48' },
    { key: 'cc', label: 'CC', width: 'w-28' },
    { key: 'edad', label: 'Edad', width: 'w-16' },
    { key: 'tfg', label: 'TFG', width: 'w-28' },
    { key: 'kdigo', label: 'KDIGO', width: 'w-20' },
    { key: 'crea_calc', label: 'Crea (mg/dL)', width: 'w-24' },
    { key: 'eps', label: 'EPS', width: 'w-28' },
    { key: 'cie10', label: 'CIE-10', width: 'w-28' },
  ];

  if (records.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          No se encontraron historias clínicas
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ajusta los filtros de búsqueda o crea una nueva historia clínica.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-accent transition-all active:scale-95"
        >
          Crear primera HC
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted border-b border-border">
              {columns.map((col) => (
                <th
                  key={`th-${col.key}`}
                  className={`text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors ${col.width}`}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((record, idx) => (
              <tr
                key={`row-${record._id}`}
                className={`border-b border-border transition-colors hover:bg-muted/50 group ${
                  idx % 2 === 0 ? 'bg-card' : 'bg-background/40'
                }`}
              >
                <td className="px-4 py-3 text-xs text-muted-foreground font-tabular">
                  {record.fecha}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground text-sm leading-tight truncate max-w-44">
                    {record.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {record.sexo === 'M' ? 'Masculino' : 'Femenino'}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-tabular">
                  {record.cc}
                </td>
                <td className="px-4 py-3 text-sm font-tabular text-foreground">
                  {record.edad}a
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-tabular ${getTfgColor(record.tfg)}`}>
                    {parseInt(record.tfg) || '--'}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">ml/min</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                      KDIGO_BADGE[record.kdigo] || 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {record.kdigo}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-tabular text-foreground">
                  {record.crea_calc}
                </td>
                <td className="px-4 py-3 text-xs text-foreground truncate max-w-24">
                  {record.eps}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                  {record.cie10}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push('/')}
                      title="Abrir historia clínica"
                      className="p-1.5 rounded-lg hover:bg-info-bg text-muted-foreground hover:text-accent transition-all"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      title="Editar historia"
                      className="p-1.5 rounded-lg hover:bg-warning-bg text-muted-foreground hover:text-warning transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(record)}
                      title="Eliminar historia — esta acción no se puede deshacer"
                      className="p-1.5 rounded-lg hover:bg-danger-bg text-muted-foreground hover:text-danger transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filas por página:</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs border border-input rounded-lg px-2 py-1 bg-card focus:outline-none"
          >
            {[5, 8, 15, 25].map((n) => (
              <option key={`perpage-${n}`} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground font-tabular">
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, records.length)} de{' '}
            {records.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-all"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => (
              <React.Fragment key={`page-btn-${p}`}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-xs text-muted-foreground px-1">…</span>
                )}
                <button
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs rounded-lg border transition-all ${
                    p === page
                      ? 'bg-primary text-white border-primary font-bold' :'border-border hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-all"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}