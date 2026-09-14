'use client';
import React from 'react';
import { Loader2, Save, Printer, ArrowRight } from 'lucide-react';
import { HCFormData } from '../types/hcTypes';

interface Props {
  formData: HCFormData;
  updateField: (field: keyof HCFormData, value: string) => void;
  kdigoAuto: string;
  saving: boolean;
  onSave: () => void;
  onPrint: () => void;
  onSendToReceta: () => void;
}

const InputField = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  helper,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  helper?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
    />
    {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
  </div>
);

const TextareaField = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <div>
    <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card resize-none"
    />
  </div>
);

export default function HCFormPage2({
  formData,
  updateField,
  kdigoAuto,
  saving,
  onSave,
  onPrint,
  onSendToReceta,
}: Props) {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border p-5">
      <h3 className="text-sm font-bold text-primary uppercase tracking-wide border-b-2 border-secondary pb-2 mb-4">
        Página 2 — Examen Físico, Laboratorios y Plan
      </h3>

      {/* Signos Vitales */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
          Signos Vitales
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField
            label="TA / MAP"
            id="ta"
            value={formData.ta}
            onChange={(v) => updateField('ta', v)}
            placeholder="120/80 mmHg MAP 93"
          />
          <InputField
            label="FC / FR / Sat O₂"
            id="fc"
            value={formData.fc}
            onChange={(v) => updateField('fc', v)}
            placeholder="78x' 18x' 97%"
          />
          <InputField
            label="Peso actual"
            id="peso_act"
            value={formData.peso_act}
            onChange={(v) => updateField('peso_act', v)}
            placeholder="70 kg"
          />
          <InputField
            label="Glucometría"
            id="gluco"
            value={formData.gluco}
            onChange={(v) => updateField('gluco', v)}
            placeholder="98 mg/dL"
          />
        </div>
      </div>

      {/* Examen Físico */}
      <div className="border-t border-border pt-4 mb-4">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
          Examen Físico
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField
            label="Cardio-pulmonar"
            id="ex_cardio"
            value={formData.ex_cardio}
            onChange={(v) => updateField('ex_cardio', v)}
            placeholder="Ruidos cardíacos rítmicos, sin soplos. Murmullo vesicular conservado, sin crepitantes..."
          />
          <TextareaField
            label="Abdomen / PPR / Edemas"
            id="ex_abd"
            value={formData.ex_abd}
            onChange={(v) => updateField('ex_abd', v)}
            placeholder="Abdomen blando, PPR negativo bilateral. Edema pretibial ++/++++..."
          />
        </div>
      </div>

      {/* Laboratorios */}
      <div className="border-t border-border pt-4 mb-4">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
          Laboratorios
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="K / Na / Hb / Alb / PTH"
            id="labs2"
            value={formData.labs2}
            onChange={(v) => updateField('labs2', v)}
            placeholder="K 4.8 Na 138 Hb 10.2 Alb 3.1 PTH 98"
          />
          <InputField
            label="Uroanálisis / Prot / P:C / Eco"
            id="labs4"
            value={formData.labs4}
            onChange={(v) => updateField('labs4', v)}
            placeholder="Prot 3+ Hema 2+ P:C 0.8 Eco: riñones 9cm"
          />
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
              KDIGO / CIE-10
            </label>
            <div className="flex gap-2">
              <input
                value={kdigoAuto || formData.cie10}
                readOnly
                placeholder="G3a"
                className="w-24 px-3 py-2 border border-input rounded-lg text-sm bg-muted font-bold text-accent"
              />
              <input
                id="cie10"
                value={formData.cie10}
                onChange={(e) => updateField('cie10', e.target.value)}
                placeholder="N18.3 HTA I10"
                className="flex-1 px-3 py-2 border border-input rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Análisis */}
      <div className="border-t border-border pt-4 mb-4">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
          Análisis KDIGO — Impresión Diagnóstica
        </h4>
        <TextareaField
          label="Análisis clínico"
          id="analisis"
          value={formData.analisis}
          onChange={(v) => updateField('analisis', v)}
          placeholder="ERC G3a A2 de probable origen hipertensivo-diabético. TFG en descenso vs visita previa. Proteinuria nefrótica en rango..."
          rows={4}
        />
      </div>

      {/* Plan */}
      <div className="border-t border-border pt-4 mb-4">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
          Plan Terapéutico
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField
            label="Plan de laboratorios"
            id="plan_labs"
            value={formData.plan_labs}
            onChange={(v) => updateField('plan_labs', v)}
            placeholder="BHC, BMP, Crea, BUN, K, Na, TFG, Urocultivo, Proteinuria 24h, Eco renal en 3 meses..."
            rows={4}
          />
          <TextareaField
            label="Tratamiento farmacológico"
            id="plan_tto"
            value={formData.plan_tto}
            onChange={(v) => updateField('plan_tto', v)}
            placeholder="1. Losartán 100mg VO c/día&#10;2. Amlodipino 10mg VO c/día&#10;3. Furosemida 40mg VO c/12h&#10;4. Eritropoyetina 4000UI SC 3x/sem..."
            rows={4}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border pt-4 flex flex-wrap gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-accent transition-all duration-150 active:scale-95 disabled:opacity-70"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Guardando...' : 'Guardar HC'}
        </button>
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-xl font-semibold text-sm hover:bg-muted transition-all duration-150 active:scale-95"
        >
          <Printer size={16} />
          Imprimir / PDF
        </button>
        <button
          onClick={onSendToReceta}
          className="flex items-center gap-2 px-5 py-2.5 bg-info-bg border border-info/20 text-accent rounded-xl font-semibold text-sm hover:bg-accent hover:text-white transition-all duration-150 active:scale-95"
        >
          <ArrowRight size={16} />
          Enviar a Receta
        </button>
      </div>
    </div>
  );
}