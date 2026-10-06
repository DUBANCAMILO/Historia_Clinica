'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardList, Loader2, Pill, Printer, Save, Settings2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import CalculatorsSection from './CalculatorsSection';
import HCFormPage1 from './HCFormPage1';
import HCFormPage2 from './HCFormPage2';
import PrescriptionTab from './PrescriptionTab';
import RiskAlertPanel from './RiskAlertPanel';
import { HCFormData, defaultHCFormData, Medication, RiskAlert } from '../types/hcTypes';
import { createAutomaticBackup, recordAudit } from '../../lib/localData';
import { applyPrintSettings } from '../../lib/printSettings';
import { printElements } from '../../lib/printDocument';
import QrAttention from './QrAttention';
import MedicalOrdersPrintPages from './MedicalOrdersPrintPages';

interface DoctorSettings {
  name: string;
  specialty: string;
  license: string;
  phone: string;
  email: string;
  city: string;
  signatureDataUrl: string;
}

const DEFAULT_DOCTOR: DoctorSettings = {
  name: 'Dr. Hernando González Cortina',
  specialty: 'Medicina Interna - Nefrólogo',
  license: '01-6566-87',
  phone: '317 5153473',
  email: 'hergoncor@gmail.com',
  city: 'Bucaramanga',
  signatureDataUrl: '',
};

function nextHistoryNumber(): string {
  try {
    const records = JSON.parse(localStorage.getItem('hcs_hgc') || '[]') as Array<{ hcno?: string }>;
    const used = new Set(records.map((record) => Number.parseInt(record.hcno || '', 10)).filter(Number.isFinite));
    let number = 1;
    while (used.has(number)) number += 1;
    return String(number).padStart(3, '0');
  } catch {
    return '001';
  }
}

function formatDose(medication: Medication): string {
  if (!medication.dose) return '—';
  return /[a-zA-Z]/.test(medication.dose) ? medication.dose : `${medication.dose} ${medication.doseUnit || 'mg'}`;
}

function PrintValue({ label, value }: { label: string; value?: string | number | null }) {
  const text = value === undefined || value === null || value === '' ? '—' : String(value);
  return (
    <div className="print-field">
      <dt>{label}</dt>
      <dd>{text}</dd>
    </div>
  );
}

function ClinicalPrintSheet({ data, tfg, imc, kdigo, doctor }: { data: HCFormData; tfg: string; imc: string; kdigo: string; doctor: DoctorSettings }) {
  return (
    <article className="clinical-print-sheet print-only">
      <header className="clinical-print-letterhead">
        <img src="/assets/kidney-stethoscope-logo.svg" alt="NefroHC" />
        <div>
          <h1>{doctor.name}</h1>
          <p>{doctor.specialty} · RM: {doctor.license}</p>
          <p>Cel: {doctor.phone} · {doctor.email} · {doctor.city}</p>
        </div>
        <div className="clinical-print-meta">
          <div className="clinical-print-title-row"><strong>HISTORIA CLÍNICA</strong><QrAttention data={{ patient: data.nombre, document: data.cc, date: data.fecha, diagnosis: data.cie10, summary: data.analisis, medications: data.medications.filter((med) => med.drug).map((med) => `${med.drug} · ${formatDose(med)} · ${med.frequency}`), laboratories: data.prescription_laboratorios.split(/\n/).filter(Boolean), paraclinics: data.prescription_paraclinicos.split(/\n/).filter(Boolean), orders: data.prescription_ordenes_medicas.split(/\n/).filter(Boolean) }} label="" /></div>
          <span>HC No. {data.hcno || '—'}</span>
          <span>{data.fecha || '—'} {data.hora || ''}</span>
        </div>
      </header>

      <section className="clinical-print-section">
        <h2>1. Identificación del paciente</h2>
        <dl className="clinical-print-grid">
          <PrintValue label="Nombre completo" value={data.nombre} />
          <PrintValue label="Documento" value={data.cc} />
          <PrintValue label="Edad" value={data.edad ? `${data.edad} años` : ''} />
          <PrintValue label="Sexo" value={data.sexo} />
          <PrintValue label="Celular" value={data.cel} />
          <PrintValue label="EPS / Aseguradora" value={data.eps} />
          <PrintValue label="Ciudad" value={data.ciudad} />
          <PrintValue label="Acompañante" value={data.acompanante} />
          <PrintValue label="Alergias / reacciones adversas" value={data.allergies} />
        </dl>
      </section>

      <section className="clinical-print-section">
        <h2>2. Motivo y antecedentes</h2>
        <dl className="clinical-print-grid clinical-print-grid-wide">
          <PrintValue label="Motivo de consulta" value={data.motivo} />
          <PrintValue label="Enfermedad actual" value={data.enf_actual} />
          <PrintValue label="Antecedentes nefrológicos / nefrotóxicos" value={data.nefrotox} />
          <PrintValue label="Diuresis, edemas, alergias y familiares" value={data.fam} />
        </dl>
      </section>

      <section className="clinical-print-section">
        <h2>3. Datos clínicos, antropometría y signos vitales</h2>
        <dl className="clinical-print-grid">
          <PrintValue label="Peso / talla" value={`${data.peso_val || '—'} kg / ${data.talla_val || '—'} cm`} />
          <PrintValue label="IMC" value={imc} />
          <PrintValue label="Creatinina" value={data.crea_calc ? `${data.crea_calc} mg/dL` : ''} />
          <PrintValue label="BUN" value={data.bun_calc ? `${data.bun_calc} mg/dL` : ''} />
          <PrintValue label="TA / MAP" value={data.ta} />
          <PrintValue label="FC / FR / Sat O₂" value={data.fc} />
          <PrintValue label="Peso actual" value={data.peso_act} />
          <PrintValue label="Glucometría" value={data.gluco} />
        </dl>
      </section>

      <section className="clinical-print-section">
        <h2>4. Examen físico y laboratorios</h2>
        <dl className="clinical-print-grid clinical-print-grid-wide">
          <PrintValue label="Examen cardio-pulmonar" value={data.ex_cardio} />
          <PrintValue label="Abdomen / PPR / edemas" value={data.ex_abd} />
          <PrintValue label="Resultados de laboratorios y paraclínicos" value="Se realizan externamente; consultar las órdenes vinculadas." />
          <PrintValue label="TFG CKD-EPI 2021" value={tfg ? `${tfg} ml/min/1.73 m²` : ''} />
          <PrintValue label="Clasificación KDIGO" value={kdigo} />
          <PrintValue label="CIE-10" value={data.cie10} />
        </dl>
      </section>

      <section className="clinical-print-section">
        <h2>5. Análisis e impresión diagnóstica</h2>
        <p className="clinical-print-paragraph">{data.analisis || '—'}</p>
      </section>

      <section className="clinical-print-section">
        <h2>6. Plan médico</h2>
        <dl className="clinical-print-grid clinical-print-grid-wide">
          <PrintValue label="Plan de laboratorios" value={data.plan_labs} />
          <PrintValue label="Tratamiento farmacológico indicado" value={data.plan_tto} />
          <PrintValue label="Laboratorios de la orden médica" value={data.prescription_laboratorios} />
          <PrintValue label="Paraclínicos de la orden médica" value={data.prescription_paraclinicos} />
          <PrintValue label="Órdenes médicas" value={data.prescription_ordenes_medicas} />
          <PrintValue label="Indicaciones adicionales" value={data.additional_notes} />
        </dl>
      </section>

      <section className="clinical-print-section">
        <h2>7. Medicamentos e indicaciones</h2>
        {data.medications.length ? (
          <table className="clinical-print-table">
            <thead><tr><th>#</th><th>Medicamento</th><th>Código</th><th>Presentación</th><th>Dosis</th><th>Vía</th><th>Frecuencia</th><th>Duración</th><th>Cantidad</th><th>Indicaciones</th></tr></thead>
            <tbody>{data.medications.map((med, index) => <tr key={med.id}><td>{index + 1}</td><td>{med.drug || '—'}</td><td>{med.code || 'Código por configurar'}</td><td>{med.presentation || '—'}</td><td>{formatDose(med)}</td><td>{med.route || '—'}</td><td>{med.frequency || '—'}</td><td>{med.duration || '—'}</td><td>{med.quantity || '—'}</td><td>{med.notes || '—'}</td></tr>)}</tbody>
          </table>
        ) : <p className="clinical-print-paragraph">No se registraron medicamentos.</p>}
      </section>

      <section className="clinical-print-section">
        <h2>8. Órdenes médicas vinculadas</h2>
        <PrintValue label="Número de orden médica" value={data.prescription_id} />
        <div className="clinical-print-grid clinical-print-grid-wide">
          <PrintValue label="Laboratorios (realización externa)" value={data.prescription_laboratorios} />
          <PrintValue label="Paraclínicos / exámenes (realización externa)" value={data.prescription_paraclinicos} />
          <PrintValue label="Órdenes médicas" value={data.prescription_ordenes_medicas} />
          <PrintValue label="Indicaciones para el paciente" value={data.additional_notes} />
        </div>
      </section>

      <section className="clinical-print-section">
        <h2>9. Alertas clínicas registradas</h2>
        {data.riskAlerts.length ? <ul className="clinical-print-list">{data.riskAlerts.map((alert: RiskAlert) => <li key={alert.id}><strong>{alert.category}:</strong> {alert.message}</li>)}</ul> : <p className="clinical-print-paragraph">No se registraron alertas.</p>}
      </section>

      <footer className="clinical-print-signature">
        {doctor.signatureDataUrl ? <img src={doctor.signatureDataUrl} alt="Firma del profesional" /> : <div className="signature-line" />}
        <strong>{doctor.name}</strong>
        <span>{doctor.specialty} · RM: {doctor.license}</span>
      </footer>
    </article>
  );
}

export default function ClinicalHistoryPage() {
  const [activeTab, setActiveTab] = useState<'hc' | 'receta'>('hc');
  const [formData, setFormData] = useState<HCFormData>(defaultHCFormData);
  const [tfgValue, setTfgValue] = useState('');
  const [imcValue, setImcValue] = useState('');
  const [kdigoAuto, setKdigoAuto] = useState('');
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [doctor, setDoctor] = useState<DoctorSettings>(DEFAULT_DOCTOR);
  const [draftAvailable, setDraftAvailable] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nefrohc_doctor_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email === 'hergoncor@gmail.com') parsed.email = DEFAULT_DOCTOR.email;
        setDoctor({ ...DEFAULT_DOCTOR, ...parsed });
      }
      const selectedRaw = localStorage.getItem('nefrohc_selected_history');
      if (selectedRaw) {
        const selected = JSON.parse(selectedRaw) as Partial<HCFormData> & { tfg?: string; imc?: string; kdigo?: string };
        setFormData({ ...defaultHCFormData, ...selected, medications: selected.medications || [], riskAlerts: selected.riskAlerts || [], additional_notes: selected.additional_notes || '' });
        setTfgValue(selected.tfg || '');
        setImcValue(selected.imc || '');
        setKdigoAuto(selected.kdigo || '');
      } else {
        setFormData((previous) => ({ ...previous, hcno: previous.hcno || nextHistoryNumber() }));
        setDraftAvailable(Boolean(localStorage.getItem('nefrohc_draft_history')));
      }
    } catch { /* use defaults when storage is unavailable */ }
  }, []);

  useEffect(() => {
    if (!formData.nombre.trim()) return;
    const timer = window.setTimeout(() => { try { localStorage.setItem('nefrohc_draft_history', JSON.stringify({ formData, tfgValue, imcValue, kdigoAuto, savedAt: new Date().toISOString() })); } catch { /* no bloquear el formulario */ } }, 700);
    return () => window.clearTimeout(timer);
  }, [formData, tfgValue, imcValue, kdigoAuto]);

  const updateField = useCallback((field: keyof HCFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleMedicationsChange = useCallback((meds: Medication[]) => setFormData((prev) => ({ ...prev, medications: meds })), []);
  const handleAlertsChange = useCallback((alerts: RiskAlert[]) => setFormData((prev) => ({ ...prev, riskAlerts: alerts })), []);

  const restoreDraft = useCallback(() => {
    try { const draft = JSON.parse(localStorage.getItem('nefrohc_draft_history') || 'null'); if (draft?.formData) { setFormData({ ...defaultHCFormData, ...draft.formData, medications: draft.formData.medications || [], riskAlerts: draft.formData.riskAlerts || [] }); setTfgValue(draft.tfgValue || ''); setImcValue(draft.imcValue || ''); setKdigoAuto(draft.kdigoAuto || ''); setDraftAvailable(false); toast.success('Borrador recuperado'); } } catch { toast.error('No se pudo recuperar el borrador'); }
  }, []);

  const handleNewHistory = useCallback(() => {
    localStorage.removeItem('nefrohc_draft_history');
    setDraftAvailable(false);
    setFormData({ ...defaultHCFormData, hcno: nextHistoryNumber(), fecha: new Date().toISOString().split('T')[0], medications: [], riskAlerts: [] });
    setTfgValue(''); setImcValue(''); setKdigoAuto(''); setActiveTab('hc');
    localStorage.removeItem('nefrohc_selected_history');
    toast.info('Nueva historia clínica lista para diligenciar');
  }, []);

  const handleSave = async (override: Partial<HCFormData> = {}) => {
    // La pestaña de receta puede guardar y solicitar la HC en la misma acción;
    // usamos el estado entregado por ella para no depender de un render intermedio.
    const dataToSave: HCFormData = { ...formData, ...override };
    if (!dataToSave.nombre.trim()) { toast.error('El nombre del paciente es requerido'); return; }
    setSaving(true);
    try {
      let existing: Array<Record<string, unknown>> = [];
      try {
        const parsed = JSON.parse(localStorage.getItem('hcs_hgc') || '[]');
        existing = Array.isArray(parsed) ? parsed : [];
      } catch {
        existing = [];
      }
      const historyId = dataToSave.history_id || `hc-${Date.now()}`;
      const source = dataToSave;
      const saved = {
        ...source,
        history_id: historyId,
        hcno: source.hcno || nextHistoryNumber(),
        tfg: tfgValue,
        imc: imcValue,
        kdigo: kdigoAuto,
        _id: historyId,
        _savedAt: new Date().toISOString(),
      };
      const hasPrescription = source.medications.some((med) => med.drug.trim()) || Boolean(source.prescription_laboratorios.trim()) || Boolean(source.prescription_paraclinicos.trim()) || Boolean(source.prescription_ordenes_medicas.trim());
      const linkedPrescriptionId = hasPrescription ? (source.prescription_id || `rx-${Date.now()}`) : '';
      saved.prescription_id = linkedPrescriptionId;
      // Siempre se guarda primero en el almacenamiento local para que la prueba
      // funcione tanto en navegador como dentro de Tauri.
      localStorage.setItem('hcs_hgc', JSON.stringify([...existing.filter((item) => item._id !== historyId), saved]));
      if (hasPrescription) {
        const externalOrders = JSON.parse(localStorage.getItem('nefrohc_external_orders') || '[]') as Array<Record<string, unknown>>;
        const orderId = `ord-${historyId}`;
        const orderText = (value: string) => value || '';
        const medicationText = source.medications.filter((med) => med.drug.trim()).map((med) => `${med.drug} · ${med.presentation || ''} · ${formatDose(med)} · ${med.route} · ${med.frequency}${med.duration ? ` · ${med.duration}` : ''}`).join('\\n');
        const categories = ['medications', 'prescription_laboratorios', 'prescription_paraclinicos', 'prescription_ordenes_medicas'].filter((key) => key === 'medications' ? source.medications.length > 0 : Boolean(source[key as keyof HCFormData])).map((key) => key === 'medications' ? 'Medicamentos' : key === 'prescription_laboratorios' ? 'Laboratorios' : key === 'prescription_paraclinicos' ? 'Paraclínicos' : 'Órdenes médicas');
        const externalOrder = { id: orderId, historyId, patientName: source.nombre, document: source.cc, date: source.fecha, status: 'Creada', categories, medications: medicationText, laboratories: orderText(source.prescription_laboratorios), paraclinics: orderText(source.prescription_paraclinicos), medicalOrders: orderText(source.prescription_ordenes_medicas) };
        localStorage.setItem('nefrohc_external_orders', JSON.stringify([externalOrder, ...externalOrders.filter((item) => item.id !== orderId)]));
      } else {
        try {
          const externalOrders = JSON.parse(localStorage.getItem('nefrohc_external_orders') || '[]') as Array<{ historyId?: string }>;
          localStorage.setItem('nefrohc_external_orders', JSON.stringify(externalOrders.filter((item) => item.historyId !== historyId)));
        } catch { /* no bloquear el guardado de la historia */ }
      }
      setFormData((previous) => ({ ...previous, ...source, history_id: historyId, hcno: saved.hcno, prescription_id: linkedPrescriptionId }));
      try {
        const evolution = JSON.parse(localStorage.getItem('nefro_evolution') || '{}') as Record<string, Array<{ fecha: string; tfg: number; creatinina: number; potasio: number; hemoglobina: number; proteinuria: number; calcio: number; fosforo: number; pth: number }>>;
        const metric = (text: string, labels: string[]) => { const match = text.match(new RegExp(`(?:${labels.join('|')})\\s*[:=]?\\s*([0-9]+(?:[.,][0-9]+)?)`, 'i')); return match ? Number.parseFloat(match[1].replace(',', '.')) : 0; };
        const evolutionKey = source.cc || source.nombre;
        const points = (evolution[evolutionKey] || []).filter((point) => point.fecha !== source.fecha);
        evolution[evolutionKey] = [...points, { fecha: source.fecha, tfg: Number.parseFloat(tfgValue) || 0, creatinina: Number.parseFloat(source.crea_calc) || 0, potasio: metric(source.labs2, ['K', 'Potasio']), hemoglobina: metric(source.labs2, ['Hb', 'Hemoglobina']), proteinuria: metric(source.labs4, ['Prot', 'Proteinuria', 'P:C']), calcio: metric(source.labs2, ['Ca', 'Calcio']), fosforo: metric(source.labs2, ['P', 'Fósforo']), pth: metric(source.labs2, ['PTH']) }].sort((a, b) => a.fecha.localeCompare(b.fecha));
        localStorage.setItem('nefro_evolution', JSON.stringify(evolution));
      } catch { /* la historia no depende de las gráficas */ }
      createAutomaticBackup(`Historia ${saved.hcno} guardada`);
      recordAudit(existing.some((item) => item._id === historyId) ? 'UPDATE' : 'CREATE', 'Historia clínica', historyId, `Historia ${saved.hcno} de ${saved.nombre}`);
      let savedInSqlite = false;
      try {
        await invoke('save_history_json', { payload: JSON.stringify(saved) });
        savedInSqlite = true;
      } catch (error) {
        console.warn('SQLite no disponible; se conserva la copia local', error);
      }
      localStorage.removeItem('nefrohc_draft_history');
      setDraftAvailable(false);
      window.dispatchEvent(new Event('nefrohc:data-updated'));
      toast.success(savedInSqlite ? 'Historia guardada en SQLite y en la copia local' : 'Historia guardada en la copia local');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible guardar la historia clínica');
    } finally { setSaving(false); }
  };

  const handlePrint = () => {
    setPrinting(true);
    applyPrintSettings();
    printElements('Historia clínica y órdenes médicas', ['.clinical-print-sheet', '.medical-orders-print-pages']);
    window.setTimeout(() => setPrinting(false), 900);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void handleSave(); } if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') { event.preventDefault(); handlePrint(); } if (event.altKey && event.key === '1') setActiveTab('hc'); if (event.altKey && event.key === '2') setActiveTab('receta'); };
    window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown);
  });

  const historySections = [formData.nombre, formData.cc, formData.motivo, formData.analisis, formData.plan_tto].filter(Boolean).length;
  const recipeItems = formData.medications.filter((med) => med.drug.trim()).length + formData.prescription_laboratorios.split(/\n/).filter(Boolean).length + formData.prescription_paraclinicos.split(/\n/).filter(Boolean).length + formData.prescription_ordenes_medicas.split(/\n/).filter(Boolean).length;
  const tabs = [
    { key: 'hc' as const, number: '01', label: 'Historia clínica', subtitle: 'Identificación, examen, análisis y plan', progress: `${historySections}/5`, icon: ClipboardList },
    { key: 'receta' as const, number: '02', label: 'Órdenes médicas', subtitle: 'Medicamentos, laboratorios y solicitudes', progress: `${recipeItems} ítems`, icon: Pill },
  ];

  return (
    <div className="min-h-screen bg-background">
      {printing && <div className="print-loading-overlay no-print"><div className="print-loading-card"><Loader2 className="animate-spin text-accent" size={30} /><span>Preparando documento...</span></div></div>}
      <div className="clinical-topbar bg-primary text-white px-6 py-4 lg:pl-6 pl-16 no-print">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4 flex-1"><img src="/assets/kidney-stethoscope-logo.svg" alt="NefroHC" className="w-14 h-14 rounded-xl object-contain bg-white/10 p-1.5 shrink-0" /><div className="flex-1 text-center"><h1 className="text-xl font-extrabold leading-tight">{doctor.name}</h1><p className="text-blue-200 text-xs text-center font-semibold mt-0.5">{doctor.specialty} | RM: {doctor.license} | Cel: {doctor.phone} | {doctor.email} | {doctor.city}</p></div></div>
          <div className="flex items-center gap-2 shrink-0"><a href="/settings" className="p-2 rounded-lg hover:bg-white/10" title="Configuración"><Settings2 size={18} /></a></div>
        </div>
      </div>
      <div className="clinical-view-banner no-print"><div><span className="clinical-view-kicker">Nueva atención</span><h2>{formData.nombre || 'Historia clínica en blanco'}</h2><p>{formData.nombre ? `HC ${formData.hcno || 'pendiente'} · ${formData.cc || 'Documento pendiente'}` : 'Comienza una atención y guarda todo en Pacientes.'}</p></div><div className="clinical-view-actions">{draftAvailable && <button type="button" onClick={restoreDraft} className="clinical-draft-button">Recuperar borrador</button>}<button type="button" onClick={handleNewHistory}>Limpiar</button><button type="button" onClick={() => setActiveTab('hc')}>Historia</button><button type="button" onClick={() => setActiveTab('receta')}>Órdenes médicas</button></div></div>

      <div className="clinical-page max-w-screen-2xl mx-auto px-4 lg:px-8 py-6">
        <div className="clinical-tabs clinical-step-tabs mb-6 no-print"><div className="clinical-step-tabs-inner">{tabs.map((tab, index) => { const Icon = tab.icon; const active = activeTab === tab.key; const complete = tab.key === 'hc' ? historySections === 5 : recipeItems > 0; return <React.Fragment key={tab.key}><button type="button" onClick={() => setActiveTab(tab.key)} className={`clinical-step-tab ${active ? 'is-active' : ''} ${complete ? 'is-complete' : ''}`} aria-current={active ? 'step' : undefined}><span className="clinical-step-number">{complete ? <CheckCircle2 size={16} /> : tab.number}</span><span className="clinical-step-icon"><Icon size={18} /></span><span className="clinical-step-copy"><strong>{tab.label}</strong><small>{tab.subtitle}</small></span><span className="clinical-step-progress">{tab.progress}</span></button>{index < tabs.length - 1 && <span className="clinical-step-arrow"><ArrowRight size={17} /></span>}</React.Fragment>; })}</div><div className="clinical-patient-context"><span className="clinical-context-dot" /><span>{formData.nombre || 'Paciente nuevo'}</span><span className="clinical-context-separator">•</span><span>{formData.cc || 'Documento pendiente'}</span><span className="clinical-context-separator">•</span><span>HC {formData.hcno || 'nueva'}</span><span className="clinical-context-spacer" /><span className="clinical-save-hint">Guarda desde cualquier pestaña</span></div></div>

        {activeTab === 'hc' && <>
          <div className="clinical-editor-shell clinical-workspace space-y-5 no-print">
            <CalculatorsSection formData={formData} onTfgChange={setTfgValue} onImcChange={setImcValue} onKdigoChange={setKdigoAuto} onImcInterpChange={() => {}} onPesoActChange={(v) => updateField('peso_act', v)} />
            <RiskAlertPanel tfg={tfgValue} kdigo={kdigoAuto} ta={formData.ta} gluco={formData.gluco} labs2={formData.labs2} crea={formData.crea_calc} alerts={formData.riskAlerts} onAlertsChange={handleAlertsChange} />
            <HCFormPage1 formData={formData} updateField={updateField} />
            <HCFormPage2 formData={formData} updateField={updateField} kdigoAuto={kdigoAuto} />
            <div className="clinical-actions border-t border-border pt-5 flex flex-wrap justify-end gap-3">
              <button onClick={handleNewHistory} className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-xl font-semibold text-sm hover:bg-muted">Nueva historia</button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-card border-2 border-primary text-primary rounded-xl font-semibold text-sm hover:bg-muted active:scale-95"><Printer size={16} /> Imprimir historia</button>
              <button onClick={() => void handleSave()} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-accent active:scale-95 disabled:opacity-70">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? 'Guardando...' : 'Guardar historia + órdenes médicas'}</button>
            </div>
          </div>
          <ClinicalPrintSheet data={formData} tfg={tfgValue} imc={imcValue} kdigo={kdigoAuto} doctor={doctor} />
          <MedicalOrdersPrintPages patient={formData.nombre} document={formData.cc} date={formData.fecha} diagnosis={formData.cie10} medications={formData.medications.filter((med) => med.drug.trim())} laboratories={formData.prescription_laboratorios.split(/\n/).filter(Boolean)} paraclinics={formData.prescription_paraclinicos.split(/\n/).filter(Boolean)} orders={formData.prescription_ordenes_medicas.split(/\n/).filter(Boolean)} />
        </>}

        {activeTab === 'receta' && <PrescriptionTab formData={formData} updateField={updateField} medications={formData.medications} onMedicationsChange={handleMedicationsChange} onSaveAll={handleSave} onNewHistory={handleNewHistory} />}
      </div>
    </div>
  );
}
