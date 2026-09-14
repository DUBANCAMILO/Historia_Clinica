'use client';
import React, { useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { HCFormData } from '../types/hcTypes';

interface Props {
  formData: HCFormData;
  onTfgChange: (v: string) => void;
  onImcChange: (v: string) => void;
  onKdigoChange: (v: string) => void;
  onImcInterpChange: (v: string) => void;
  onPesoActChange: (v: string) => void;
}

function calcIMC(peso: number, talla: number) {
  let t = talla;
  if (t > 3) t = t / 100;
  const imc = peso / (t * t);
  let interp = '';
  if (imc < 18.5) interp = 'Bajo peso';
  else if (imc < 25) interp = 'Normal';
  else if (imc < 30) interp = 'Sobrepeso';
  else interp = 'Obesidad';
  return { imc: imc.toFixed(1), interp };
}

function calcTFG(crea: number, edad: number, sexo: string) {
  const k = sexo === 'F' ? 0.7 : 0.9;
  const a = sexo === 'F' ? -0.241 : -0.302;
  const scr_k = crea / k;
  const min = Math.min(scr_k, 1);
  const max = Math.max(scr_k, 1);
  const eGFR =
    142 *
    Math.pow(min, a) *
    Math.pow(max, -1.2) *
    Math.pow(0.9938, edad) *
    (sexo === 'F' ? 1.012 : 1);
  const tfg = Math.round(eGFR);
  let g = '';
  if (tfg >= 90) g = 'G1';
  else if (tfg >= 60) g = 'G2';
  else if (tfg >= 45) g = 'G3a';
  else if (tfg >= 30) g = 'G3b';
  else if (tfg >= 15) g = 'G4';
  else g = 'G5';
  return { tfg: `${tfg} ml/min/1.73`, kdigo: g };
}

export default function CalculatorsSection({
  formData,
  onTfgChange,
  onImcChange,
  onKdigoChange,
  onImcInterpChange,
  onPesoActChange,
}: Props) {
  const peso = parseFloat(formData.peso_val);
  const talla = parseFloat(formData.talla_val);
  const crea = parseFloat(formData.crea_calc);
  const edad = parseFloat(formData.edad);
  const sexo = formData.sexo;

  const imcResult =
    peso > 0 && talla > 0 ? calcIMC(peso, talla) : null;
  const tfgResult =
    crea > 0 && edad > 0 ? calcTFG(crea, edad, sexo) : null;

  useEffect(() => {
    if (imcResult) {
      onImcChange(imcResult.imc);
      onImcInterpChange(imcResult.interp);
      if (peso > 0) onPesoActChange(`${peso} kg`);
    }
  }, [imcResult?.imc]);

  useEffect(() => {
    if (tfgResult) {
      onTfgChange(tfgResult.tfg);
      onKdigoChange(tfgResult.kdigo);
    }
  }, [tfgResult?.tfg]);

  const getTfgColor = (tfg: string) => {
    const val = parseInt(tfg);
    if (val >= 60) return 'text-success';
    if (val >= 30) return 'text-warning';
    return 'text-danger';
  };

  const getKdigoColor = (g: string) => {
    if (g === 'G1' || g === 'G2') return 'bg-success-bg text-success border-success/20';
    if (g === 'G3a') return 'bg-warning-bg text-warning border-warning/20';
    if (g === 'G3b') return 'bg-orange-50 text-orange-600 border-orange-200';
    return 'bg-danger-bg text-danger border-danger/20';
  };

  return (
    <div className="bg-card rounded-xl border-2 border-dashed border-accent/40 p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-accent" />
        <h3 className="text-sm font-bold text-primary uppercase tracking-wide">
          Calculadoras NEFRO — TFG e IMC (Automático)
        </h3>
      </div>

      {/* IMC Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Peso (kg)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="70"
            value={formData.peso_val}
            onChange={(e) => {
              const val = e.target.value;
              // triggers parent update via formData
              const event = new CustomEvent('peso_val', { detail: val });
            }}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            readOnly
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ingresar en Página 1
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Talla (cm)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="170"
            value={formData.talla_val}
            readOnly
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none bg-muted"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            IMC
          </label>
          <div
            className={`px-3 py-2 rounded-lg text-center font-bold text-lg font-tabular border ${
              imcResult
                ? 'bg-info-bg border-info/20 text-accent' :'bg-muted border-border text-muted-foreground'
            }`}
          >
            {imcResult ? imcResult.imc : '--'}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Interpretación
          </label>
          <div className="px-3 py-2 bg-muted rounded-lg text-sm text-foreground border border-border">
            {imcResult ? imcResult.interp : '--'}
          </div>
        </div>
      </div>

      {/* TFG Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Creatinina (mg/dL)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="1.2"
            value={formData.crea_calc}
            readOnly
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">Ingresar en Labs</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Edad / Sexo
          </label>
          <div className="px-3 py-2 bg-muted rounded-lg text-sm border border-border font-tabular">
            {formData.edad ? `${formData.edad}a / ${formData.sexo}` : '--'}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            TFG CKD-EPI 2021
          </label>
          <div
            className={`px-3 py-2 rounded-lg text-center font-bold text-base font-tabular border ${
              tfgResult
                ? `bg-info-bg border-info/20 ${getTfgColor(tfgResult.tfg)}`
                : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            {tfgResult ? tfgResult.tfg : '--'}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            KDIGO G (auto)
          </label>
          <div
            className={`px-3 py-2 rounded-lg text-center font-bold text-lg border ${
              tfgResult ? getKdigoColor(tfgResult.kdigo) : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            {tfgResult ? tfgResult.kdigo : '--'}
          </div>
        </div>
      </div>
    </div>
  );
}