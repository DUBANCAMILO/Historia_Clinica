'use client';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Printer, FileDown } from 'lucide-react';
import CalculatorsSection from './CalculatorsSection';
import HCFormPage1 from './HCFormPage1';
import HCFormPage2 from './HCFormPage2';
import PrescriptionTab from './PrescriptionTab';
import RiskAlertPanel from './RiskAlertPanel';
import { HCFormData, defaultHCFormData, Medication, RiskAlert } from '../types/hcTypes';

export default function ClinicalHistoryPage() {
  const [activeTab, setActiveTab] = useState<'hc' | 'receta'>('hc');
  const [formData, setFormData] = useState<HCFormData>(defaultHCFormData);
  const [tfgValue, setTfgValue] = useState('');
  const [imcValue, setImcValue] = useState('');
  const [kdigoAuto, setKdigoAuto] = useState('');
  const [imcInterp, setImcInterp] = useState('');
  const [saving, setSaving] = useState(false);

  const updateField = useCallback(
    (field: keyof HCFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleMedicationsChange = useCallback((meds: Medication[]) => {
    setFormData((prev) => ({ ...prev, medications: meds }));
  }, []);

  const handleAlertsChange = useCallback((alerts: RiskAlert[]) => {
    setFormData((prev) => ({ ...prev, riskAlerts: alerts }));
  }, []);

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre del paciente es requerido');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const existing = JSON.parse(localStorage.getItem('hcs_hgc') || '[]');
    const record = {
      ...formData,
      tfg: tfgValue,
      imc: imcValue,
      kdigo: kdigoAuto,
      _id: `hc-${Date.now()}`,
      _savedAt: new Date().toISOString(),
    };
    existing.push(record);
    localStorage.setItem('hcs_hgc', JSON.stringify(existing));
    setSaving(false);
    toast.success(`Historia clínica de ${formData.nombre} guardada correctamente`);
  };

  const handleSendToReceta = () => {
    setActiveTab('receta');
    toast.info('Datos enviados a la receta');
  };

  const handlePrint = () => window.print();

  const tabs = [
    { key: 'hc' as const, label: '1. Historia Clínica' },
    { key: 'receta' as const, label: '2. Receta / Medicamentos' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-4 lg:pl-6 pl-16 no-print">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4 flex-1">
            <img
              src="/assets/kidney-stethoscope-logo.svg"
              alt="NefroHC logo — riñón con estetoscopio"
              className="w-14 h-14 rounded-xl object-contain bg-white/10 p-1.5 shrink-0"
            />
            <div className="flex-1 text-center">
              <h1 className="text-xl font-extrabold leading-tight text-center tracking-tight">
                Dr. Hernando González Cortina
              </h1>
              <p className="text-blue-200 text-xs text-center font-semibold mt-0.5">
                Medicina Interna - Nefrólogo | RM: 01-6566-87 | Cel: 317 5153473 |
                herrgoncor123@gmail.com | Bucaramanga
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
              {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('hcs_hgc') || '[]').length : 0}{' '}HC
            </span>
          </div>
        </div>
      </div>

      {/* Print Header — only visible when printing */}
      <div className="print-header hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '3px solid #0f2a44', paddingBottom: '12px', marginBottom: '16px' }}>
          <img
            src="/assets/kidney-stethoscope-logo.svg"
            alt="Logo"
            style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'contain', background: '#0f2a44', padding: '6px' }}
          />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f2a44', textAlign: 'center' }}>
              Dr. Hernando González Cortina
            </div>
            <div style={{ fontSize: '11px', color: '#475569', textAlign: 'center', fontWeight: '600' }}>
              Medicina Interna - Nefrólogo | RM: 01-6566-87 | Cel: 317 5153473 | herrgoncor123@gmail.com | Bucaramanga
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 no-print">
          {tabs.map((t) => (
            <button
              key={`tab-${t.key}`}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95 border ${
                activeTab === t.key
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'hc' && (
          <div className="space-y-5">
            <CalculatorsSection
              formData={formData}
              onTfgChange={setTfgValue}
              onImcChange={setImcValue}
              onKdigoChange={setKdigoAuto}
              onImcInterpChange={setImcInterp}
              onPesoActChange={(v) => updateField('peso_act', v)}
            />

            <RiskAlertPanel
              tfg={tfgValue}
              kdigo={kdigoAuto}
              ta={formData.ta}
              gluco={formData.gluco}
              labs2={formData.labs2}
              crea={formData.crea_calc}
              alerts={formData.riskAlerts}
              onAlertsChange={handleAlertsChange}
            />

            <HCFormPage1 formData={formData} updateField={updateField} />
            <HCFormPage2
              formData={formData}
              updateField={updateField}
              kdigoAuto={kdigoAuto}
              saving={saving}
              onSave={handleSave}
              onPrint={handlePrint}
              onSendToReceta={handleSendToReceta}
            />

            {/* PDF Actions for HC */}
            <div className="flex flex-wrap gap-3 no-print">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-accent transition-all duration-150 active:scale-95"
              >
                <Printer size={16} />
                Imprimir Historia Clínica
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-primary text-primary rounded-xl font-semibold text-sm hover:bg-muted transition-all duration-150 active:scale-95"
              >
                <FileDown size={16} />
                Guardar como PDF
              </button>
            </div>
          </div>
        )}

        {activeTab === 'receta' && (
          <PrescriptionTab
            formData={formData}
            updateField={updateField}
            medications={formData.medications}
            onMedicationsChange={handleMedicationsChange}
          />
        )}
      </div>
    </div>
  );
}