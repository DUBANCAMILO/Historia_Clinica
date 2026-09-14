'use client';
import React from 'react';
import { HCFormData } from '../types/hcTypes';

interface Props {
  formData: HCFormData;
  updateField: (field: keyof HCFormData, value: string) => void;
}

const InputField = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  readOnly,
  helper,
}: {
  label: string;
  id: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
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
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${
        readOnly ? 'bg-muted' : 'bg-card'
      }`}
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
      className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all bg-card resize-none"
    />
  </div>
);

export default function HCFormPage1({ formData, updateField }: Props) {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border p-5">
      <h3 className="text-sm font-bold text-primary uppercase tracking-wide border-b-2 border-secondary pb-2 mb-4">
        Página 1 — Identificación del Paciente
      </h3>

      {/* Row 1: Fecha, Hora, HC No, Ciudad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <InputField
          label="Fecha"
          id="fecha"
          type="date"
          value={formData.fecha}
          onChange={(v) => updateField('fecha', v)}
        />
        <InputField
          label="Hora"
          id="hora"
          type="time"
          value={formData.hora}
          onChange={(v) => updateField('hora', v)}
        />
        <InputField
          label="HC No."
          id="hcno"
          value={formData.hcno}
          onChange={(v) => updateField('hcno', v)}
          placeholder="001"
        />
        <InputField
          label="Ciudad"
          id="ciudad"
          value={formData.ciudad}
          onChange={(v) => updateField('ciudad', v)}
          placeholder="Bucaramanga"
        />
      </div>

      {/* Row 2: Nombre, CC, Edad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <InputField
          label="Nombre completo"
          id="nombre"
          value={formData.nombre}
          onChange={(v) => updateField('nombre', v)}
          placeholder="Apellidos y nombres"
        />
        <InputField
          label="Cédula (CC)"
          id="cc"
          value={formData.cc}
          onChange={(v) => updateField('cc', v)}
          placeholder="1234567890"
        />
        <InputField
          label="Edad (años)"
          id="edad"
          type="number"
          value={formData.edad}
          onChange={(v) => updateField('edad', v)}
          placeholder="65"
        />
      </div>

      {/* Row 3: Sexo, Cel, EPS, Acompañante */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
            Sexo
          </label>
          <select
            id="sexo"
            value={formData.sexo}
            onChange={(e) => updateField('sexo', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 bg-card"
          >
            <option value="M">Masculino (M)</option>
            <option value="F">Femenino (F)</option>
          </select>
        </div>
        <InputField
          label="Celular"
          id="cel"
          value={formData.cel}
          onChange={(v) => updateField('cel', v)}
          placeholder="300 000 0000"
        />
        <InputField
          label="EPS / Aseguradora"
          id="eps"
          value={formData.eps}
          onChange={(v) => updateField('eps', v)}
          placeholder="Sanitas, Compensar..."
        />
        <InputField
          label="Acompañante"
          id="acompanante"
          value={formData.acompanante}
          onChange={(v) => updateField('acompanante', v)}
          placeholder="Nombre y parentesco"
        />
      </div>

      {/* Anthropometría */}
      <div className="border-t border-border pt-4 mb-4">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
          Antropometría — IMC
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField
            label="Peso (kg)"
            id="peso_val"
            type="number"
            value={formData.peso_val}
            onChange={(v) => updateField('peso_val', v)}
            placeholder="70"
            helper="Para calcular IMC automático"
          />
          <InputField
            label="Talla (cm)"
            id="talla_val"
            type="number"
            value={formData.talla_val}
            onChange={(v) => updateField('talla_val', v)}
            placeholder="170"
          />
          <InputField
            label="Creatinina (mg/dL)"
            id="crea_calc"
            type="number"
            value={formData.crea_calc}
            onChange={(v) => updateField('crea_calc', v)}
            placeholder="1.4"
            helper="Para TFG automático"
          />
          <InputField
            label="BUN (mg/dL)"
            id="bun_calc"
            type="number"
            value={formData.bun_calc}
            onChange={(v) => updateField('bun_calc', v)}
            placeholder="18"
          />
        </div>
      </div>

      {/* Motivo y Enfermedad Actual */}
      <div className="border-t border-border pt-4 mb-4">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
          Motivo / Enfermedad Actual
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField
            label="Motivo de consulta"
            id="motivo"
            value={formData.motivo}
            onChange={(v) => updateField('motivo', v)}
            placeholder="Ej: Control ERC G3a, edema bilateral, control HTA..."
          />
          <TextareaField
            label="Enfermedad actual"
            id="enf_actual"
            value={formData.enf_actual}
            onChange={(v) => updateField('enf_actual', v)}
            placeholder="Descripción cronológica del padecimiento actual..."
          />
        </div>
      </div>

      {/* Antecedentes */}
      <div className="border-t border-border pt-4">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wide mb-3">
          Antecedentes Nefrológicos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="HTA / DM / ERC / Nefrotóxicos"
            id="nefrotox"
            value={formData.nefrotox}
            onChange={(v) => updateField('nefrotox', v)}
            placeholder="HTA 10 años, DM2, AINE frecuente, contraste..."
          />
          <InputField
            label="Diuresis / Edema / Alergias / Familiares"
            id="fam"
            value={formData.fam}
            onChange={(v) => updateField('fam', v)}
            placeholder="Diuresis 1500cc/día, edema +/+++, alergia penicilina..."
          />
        </div>
      </div>
    </div>
  );
}