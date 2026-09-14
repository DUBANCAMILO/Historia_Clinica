'use client';
import React, { useState } from 'react';
import { Plus, Trash2, Pill, AlertCircle } from 'lucide-react';
import { Medication } from '../types/hcTypes';

interface Props {
  medications: Medication[];
  onChange: (meds: Medication[]) => void;
}

const ROUTES = ['VO', 'IV', 'IM', 'SC', 'SL', 'Tópico', 'Inhalado', 'Rectal', 'Transdérmica'];
const FREQUENCIES = [
  'c/día', 'c/12h', 'c/8h', 'c/6h', 'c/4h',
  '2x/semana', '3x/semana', 'Semanal', 'Mensual', 'Según necesidad',
];

const emptyMed = (): Medication => ({
  id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  drug: '',
  dose: '',
  quantity: '',
  route: 'VO',
  frequency: 'c/día',
  duration: '',
  notes: '',
});

export default function MedicationManager({ medications, onChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    const m = emptyMed();
    onChange([...medications, m]);
    setExpanded(m.id);
  };

  const remove = (id: string) => {
    onChange(medications.filter((m) => m.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const update = (id: string, field: keyof Medication, value: string) => {
    onChange(medications.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill size={18} className="text-accent" />
          <h4 className="text-sm font-extrabold text-primary uppercase tracking-wide">
            Gestión de Medicamentos
          </h4>
          {medications.length > 0 && (
            <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {medications.length}
            </span>
          )}
        </div>
        <button
          onClick={add}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-primary transition-all active:scale-95"
        >
          <Plus size={14} />
          Agregar
        </button>
      </div>

      {medications.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <Pill size={28} className="mx-auto mb-2 opacity-30" />
          <p>No hay medicamentos registrados</p>
          <p className="text-xs mt-1">Haz clic en &quot;Agregar&quot; para añadir uno</p>
        </div>
      )}

      <div className="space-y-3">
        {medications.map((med, idx) => (
          <div key={med.id} className="border border-border rounded-xl overflow-hidden">
            {/* Row Summary */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-muted cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => setExpanded(expanded === med.id ? null : med.id)}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-accent text-white rounded-full text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {med.drug || <span className="text-muted-foreground italic">Medicamento sin nombre</span>}
                    {med.dose && <span className="text-accent ml-2">{med.dose}</span>}
                  </p>
                  {(med.route || med.frequency || med.duration) && (
                    <p className="text-xs text-muted-foreground">
                      {[med.route, med.frequency, med.duration && `x ${med.duration}`].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); remove(med.id); }}
                  className="p-1.5 text-danger hover:bg-danger-bg rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <span className="text-muted-foreground text-xs">{expanded === med.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Expanded Form */}
            {expanded === med.id && (
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-card">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Medicamento / Principio activo *
                  </label>
                  <input
                    value={med.drug}
                    onChange={(e) => update(med.id, 'drug', e.target.value)}
                    placeholder="Ej: Losartán"
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Dosis
                  </label>
                  <input
                    value={med.dose}
                    onChange={(e) => update(med.id, 'dose', e.target.value)}
                    placeholder="100mg"
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Cantidad
                  </label>
                  <input
                    value={med.quantity}
                    onChange={(e) => update(med.id, 'quantity', e.target.value)}
                    placeholder="30 tab"
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Vía
                  </label>
                  <select
                    value={med.route}
                    onChange={(e) => update(med.id, 'route', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
                  >
                    {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={med.frequency}
                    onChange={(e) => update(med.id, 'frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
                  >
                    {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Duración
                  </label>
                  <input
                    value={med.duration}
                    onChange={(e) => update(med.id, 'duration', e.target.value)}
                    placeholder="30 días"
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
                  />
                </div>
                <div className="col-span-2 md:col-span-4">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Notas / Instrucciones
                  </label>
                  <input
                    value={med.notes}
                    onChange={(e) => update(med.id, 'notes', e.target.value)}
                    placeholder="Tomar con alimentos, ajustar según TFG..."
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {medications.length > 0 && (
        <div className="mt-3 p-3 bg-info-bg rounded-lg border border-info/20 flex items-start gap-2">
          <AlertCircle size={14} className="text-accent mt-0.5 shrink-0" />
          <p className="text-xs text-accent">
            Los medicamentos se guardan junto con la historia clínica al hacer clic en &quot;Guardar HC&quot;
          </p>
        </div>
      )}
    </div>
  );
}