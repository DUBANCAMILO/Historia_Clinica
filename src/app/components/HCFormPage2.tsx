'use client';
import React from 'react';
import { HCFormData } from '../types/hcTypes';

interface Props {
  formData: HCFormData;
  updateField: (field: keyof HCFormData, value: string) => void;
  kdigoAuto: string;
}


const InputField = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  helper,
  suffix,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  helper?: string;
  suffix?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
      {label}
    </label>
    <div className="flex">
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`min-w-0 flex-1 px-3 py-2 border border-input ${suffix ? 'rounded-l-lg rounded-r-none border-r-0' : 'rounded-lg'} text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card`} />
      {suffix && <span className="inline-flex items-center px-3 py-2 border border-input rounded-r-lg bg-muted text-xs font-bold text-muted-foreground whitespace-nowrap">{suffix}</span>}
    </div>
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

export default function HCFormPage2({ formData, updateField, kdigoAuto }: Props) {
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
            placeholder="120/80 MAP 93"
            suffix="mmHg"
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
            placeholder="70"
            suffix="kg"
          />
          <InputField
            label="Glucometría"
            id="gluco"
            value={formData.gluco}
            onChange={(v) => updateField('gluco', v)}
            placeholder="98"
            suffix="mg/dL"
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

      {/* Los resultados de laboratorios y paraclínicos se realizan externamente. */}
      <div className="border-t border-border pt-4 mb-4">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Resultados externos</h4>
        <p className="text-xs text-muted-foreground rounded-lg border border-info/30 bg-info-bg p-3">NefroHC no captura ni carga resultados de laboratorios o paraclínicos. Registre las solicitudes, códigos e indicaciones en la pestaña <strong>Órdenes médicas</strong>; allí se imprimen por separado para su realización externa.</p>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">KDIGO / CIE-10</label>
          <div className="flex gap-2">
            <input value={kdigoAuto || formData.cie10} readOnly placeholder="G3a" className="w-24 px-3 py-2 border border-input rounded-lg text-sm bg-muted font-bold text-accent" />
            <input id="cie10" value={formData.cie10} onChange={(e) => updateField('cie10', e.target.value)} placeholder="N18.3 HTA I10" className="flex-1 px-3 py-2 border border-input rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-accent/40" />
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

    </div>
  );
}