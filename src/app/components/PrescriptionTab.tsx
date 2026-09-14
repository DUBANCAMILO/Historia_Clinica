'use client';
import React, { useState, useCallback } from 'react';
import { Printer, FileDown, Pill, Plus, Trash2, AlertCircle } from 'lucide-react';
import { HCFormData, Medication } from '../types/hcTypes';

interface Props {
  formData: HCFormData;
  updateField: (field: keyof HCFormData, value: string) => void;
  medications: Medication[];
  onMedicationsChange: (meds: Medication[]) => void;
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

export default function PrescriptionTab({ formData, updateField, medications, onMedicationsChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dx, setDx] = useState(formData.cie10 || '');
  const [additionalNotes, setAdditionalNotes] = useState(formData.plan_tto || '');
  const [recetaFecha, setRecetaFecha] = useState(
    formData.fecha || new Date().toISOString().split('T')[0]
  );

  const addMed = () => {
    const m = emptyMed();
    onMedicationsChange([...medications, m]);
    setExpanded(m.id);
  };

  const removeMed = (id: string) => {
    onMedicationsChange(medications.filter((m) => m.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const updateMed = useCallback((id: string, field: keyof Medication, value: string) => {
    onMedicationsChange(medications.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }, [medications, onMedicationsChange]);

  const handlePrint = () => window.print();

  const handlePDFDownload = () => {
    // Trigger browser print dialog which can save as PDF
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* ── MEDICATION MANAGER (now lives in Receta) ── */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5 no-print">
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
            onClick={addMed}
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
                      {med.drug || <span className="text-muted-foreground italic">Sin nombre</span>}
                      {med.dose && <span className="text-accent ml-2">{med.dose}</span>}
                    </p>
                    {(med.route || med.frequency) && (
                      <p className="text-xs text-muted-foreground">
                        {[med.route, med.frequency, med.duration && `x ${med.duration}`, med.quantity && `Cant: ${med.quantity}`].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeMed(med.id); }}
                    className="p-1.5 text-danger hover:bg-danger-bg rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <span className="text-muted-foreground text-xs">{expanded === med.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === med.id && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-card">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Medicamento / Principio activo *</label>
                    <input value={med.drug} onChange={(e) => updateMed(med.id, 'drug', e.target.value)} placeholder="Ej: Losartán" className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Dosis</label>
                    <input value={med.dose} onChange={(e) => updateMed(med.id, 'dose', e.target.value)} placeholder="100mg" className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Cantidad</label>
                    <input value={med.quantity} onChange={(e) => updateMed(med.id, 'quantity', e.target.value)} placeholder="30 tab" className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Vía</label>
                    <select value={med.route} onChange={(e) => updateMed(med.id, 'route', e.target.value)} className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card">
                      {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Frecuencia</label>
                    <select value={med.frequency} onChange={(e) => updateMed(med.id, 'frequency', e.target.value)} className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card">
                      {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Duración</label>
                    <input value={med.duration} onChange={(e) => updateMed(med.id, 'duration', e.target.value)} placeholder="30 días" className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card" />
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notas / Instrucciones</label>
                    <input value={med.notes} onChange={(e) => updateMed(med.id, 'notes', e.target.value)} placeholder="Tomar con alimentos, ajustar según TFG..." className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {medications.length > 0 && (
          <div className="mt-3 p-3 bg-info-bg rounded-lg border border-info/20 flex items-start gap-2">
            <AlertCircle size={14} className="text-accent mt-0.5 shrink-0" />
            <p className="text-xs text-accent">Los medicamentos se guardan junto con la historia clínica al hacer clic en &quot;Guardar HC&quot;</p>
          </div>
        )}
      </div>

      {/* ── PRESCRIPTION PRINTABLE CARD ── */}
      <div className="bg-white rounded-xl shadow-card border border-border p-6 max-w-3xl print-prescription" id="prescription-print-area">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-4 border-[#0f2a44] pb-4 mb-5">
          <div className="flex items-center gap-4">
            <img
              src="/assets/kidney-stethoscope-logo.svg"
              alt="NefroHC logo — riñón con estetoscopio"
              className="w-16 h-16 rounded-xl object-contain bg-[#0f2a44] p-1.5"
            />
            <div>
              <p className="font-extrabold text-[#0f2a44] text-base text-center">
                Dr. Hernando González Cortina
              </p>
              <p className="text-xs text-gray-500 text-center font-semibold">
                Medicina Interna — Nefrólogo
              </p>
              <p className="text-xs text-gray-500 text-center">
                RM: 01-6566-87 | Cel: 317 5153473
              </p>
              <p className="text-xs text-gray-500 text-center">
                herrgoncor123@gmail.com | Bucaramanga
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-semibold uppercase">Fecha</p>
            <input
              type="date"
              value={recetaFecha}
              onChange={(e) => setRecetaFecha(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400/40 no-print"
            />
            <p className="text-sm font-semibold text-[#0f2a44] print-only hidden">{recetaFecha}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Paciente</label>
            <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 font-semibold text-[#0f2a44]">{formData.nombre || '—'}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">CC / Edad</label>
            <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">{formData.cc}{formData.edad ? ` / ${formData.edad}a` : ''}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Diagnóstico (CIE-10)</label>
            <input
              value={dx}
              onChange={(e) => setDx(e.target.value)}
              placeholder="N18.3 HTA I10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
          </div>
        </div>

        {/* Rp. Medications */}
        <div className="mb-5">
          <h4 className="text-sm font-extrabold text-[#0f2a44] uppercase tracking-wide mb-3 border-b-2 border-[#0f2a44] pb-1">
            Rp. — Medicamentos Prescritos
          </h4>

          {medications.length > 0 ? (
            <div className="space-y-2">
              {medications.map((m, i) => (
                <div key={m.id} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="w-6 h-6 bg-[#0f2a44] text-white rounded-full text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0f2a44]">
                      {m.drug} <span className="text-[#1976d2]">{m.dose}</span>
                      {m.quantity && <span className="text-gray-500 font-normal ml-2">— Cant: {m.quantity}</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vía: {m.route} · {m.frequency}{m.duration ? ` · x ${m.duration}` : ''}
                    </p>
                    {m.notes && <p className="text-xs text-gray-400 italic mt-0.5">{m.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              <Pill size={24} className="mx-auto mb-2 opacity-40" />
              <p>Agregue medicamentos en el panel superior</p>
            </div>
          )}
        </div>

        {/* Additional notes */}
        <div className="mb-5">
          <h4 className="text-sm font-bold text-[#0f2a44] uppercase tracking-wide mb-2">
            Indicaciones adicionales
          </h4>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={3}
            placeholder="Dieta hiposódica, control de TA en casa, próxima cita en 1 mes..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 resize-none no-print"
          />
          {additionalNotes && (
            <p className="text-sm text-gray-700 print-only hidden whitespace-pre-line">{additionalNotes}</p>
          )}
        </div>

        {/* Signature */}
        <div className="border-t-2 border-gray-200 pt-4 flex items-end justify-between">
          <div className="text-xs text-gray-400">
            <p>Válida por 30 días desde la fecha de emisión</p>
            <p className="mt-1">Bucaramanga, Colombia</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b-2 border-[#0f2a44] mb-1" />
            <p className="text-xs font-semibold text-[#0f2a44]">Dr. Hernando González Cortina</p>
            <p className="text-xs text-gray-500">RM: 01-6566-87</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap gap-3 justify-end no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0f2a44] text-white rounded-xl font-semibold text-sm hover:bg-[#1976d2] transition-all duration-150 active:scale-95"
          >
            <Printer size={16} />
            Imprimir Receta
          </button>
          <button
            onClick={handlePDFDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#0f2a44] text-[#0f2a44] rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all duration-150 active:scale-95"
          >
            <FileDown size={16} />
            Guardar PDF
          </button>
        </div>
      </div>
    </div>
  );
}