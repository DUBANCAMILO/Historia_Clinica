'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { ArrowLeft, Check, ImagePlus, Moon, Save, Sun, UserCog } from 'lucide-react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { DEFAULT_PRINT_SETTINGS, PrintSettings } from '../../lib/printSettings';
import { createAutomaticBackup } from '../../lib/localData';

interface CatalogOrder { name: string; code: string; }
interface DoctorSettings {
  name: string;
  specialty: string;
  license: string;
  phone: string;
  email: string;
  city: string;
  signatureDataUrl: string;
}

const DEFAULTS: DoctorSettings = {
  name: 'Dr. Hernando González Cortina',
  specialty: 'Medicina Interna - Nefrólogo',
  license: '01-6566-87',
  phone: '317 5153473',
  email: 'hergoncor@gmail.com',
  city: 'Bucaramanga',
  signatureDataUrl: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<DoctorSettings>(DEFAULTS);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [saved, setSaved] = useState(false);
  const [medicationCatalog, setMedicationCatalog] = useState('');
  const [laboratoryCatalog, setLaboratoryCatalog] = useState('');
  const [paraclinicCatalog, setParaclinicCatalog] = useState('');
  const [medicalOrderCatalog, setMedicalOrderCatalog] = useState('');
  const [printSettings, setPrintSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nefrohc_doctor_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email === 'hergoncor@gmail.com') parsed.email = DEFAULTS.email;
        setSettings({ ...DEFAULTS, ...parsed });
      }
      const savedTheme = localStorage.getItem('nefrohc_theme') as 'light' | 'dark' | null;
      if (savedTheme) setTheme(savedTheme);
      const savedPrintSettings = JSON.parse(localStorage.getItem('nefrohc_print_settings') || 'null');
      if (savedPrintSettings) setPrintSettings({ ...DEFAULT_PRINT_SETTINGS, ...savedPrintSettings });
      const meds = JSON.parse(localStorage.getItem('nefrohc_catalog_medications') || '[]') as Array<string | CatalogOrder>;
      const labs = JSON.parse(localStorage.getItem('nefrohc_catalog_laboratories') || '[]') as CatalogOrder[];
      const paras = JSON.parse(localStorage.getItem('nefrohc_catalog_paraclinics') || '[]') as CatalogOrder[];
      const orders = JSON.parse(localStorage.getItem('nefrohc_catalog_medical_orders') || '[]') as CatalogOrder[];
      if (meds.length) setMedicationCatalog(meds.map((item) => typeof item === 'string' ? item : `${item.name}${item.code ? ` | ${item.code}` : ''}`).join('\n'));
      if (labs.length) setLaboratoryCatalog(labs.map((item) => `${item.name} | ${item.code}`).join('\n'));
      if (paras.length) setParaclinicCatalog(paras.map((item) => `${item.name} | ${item.code}`).join('\n'));
      if (orders.length) setMedicalOrderCatalog(orders.map((item) => `${item.name} | ${item.code}`).join('\n'));
    } catch { /* defaults */ }
  }, []);

  const update = (field: keyof DoctorSettings, value: string) => setSettings((prev) => ({ ...prev, [field]: value }));
  const parseOrders = (text: string): CatalogOrder[] => text.split(/\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const parts = line.split('|').map((part) => part.trim()); return { name: parts[0] || '', code: parts[1] || '' }; }).filter((item) => item.name);
  const importCatalog = async (event: ChangeEvent<HTMLInputElement>, target: 'medications' | 'laboratories' | 'paraclinics' | 'medical-orders') => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
      const lines = rows.slice(1).map((row) => { const cells = Array.isArray(row) ? row.map((cell) => String(cell ?? '').trim()) : []; return target === 'medications' ? `${cells[0] || ''}${cells[1] ? ` | ${cells[1]}` : ''}` : `${cells[0] || ''} | ${cells[1] || ''}`; }).filter((line) => line.trim() && !line.startsWith('|'));
      if (target === 'medications') setMedicationCatalog(lines.join('\n')); else if (target === 'laboratories') setLaboratoryCatalog(lines.join('\n')); else if (target === 'paraclinics') setParaclinicCatalog(lines.join('\n')); else setMedicalOrderCatalog(lines.join('\n'));
      setSaved(true); window.setTimeout(() => setSaved(false), 2200);
    } catch { window.alert('No se pudo leer el archivo. Usa la primera columna para el nombre y la segunda para el código.'); }
    event.target.value = '';
  };
  const save = () => {
    localStorage.setItem('nefrohc_doctor_settings', JSON.stringify(settings));
    localStorage.setItem('nefrohc_catalog_medications', JSON.stringify(parseOrders(medicationCatalog)));
    localStorage.setItem('nefrohc_catalog_laboratories', JSON.stringify(parseOrders(laboratoryCatalog)));
    localStorage.setItem('nefrohc_catalog_paraclinics', JSON.stringify(parseOrders(paraclinicCatalog)));
    localStorage.setItem('nefrohc_catalog_medical_orders', JSON.stringify(parseOrders(medicalOrderCatalog)));
    localStorage.setItem('nefrohc_theme', theme);
    localStorage.setItem('nefrohc_print_settings', JSON.stringify(printSettings));
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.dispatchEvent(new Event('nefrohc:settings-updated'));
    window.dispatchEvent(new Event('nefrohc:catalogs-updated'));
    void createAutomaticBackup('Configuración y firma guardadas');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  const changeSignature = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update('signatureDataUrl', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div><Link href="/" className="inline-flex items-center gap-2 text-sm text-accent hover:underline mb-2"><ArrowLeft size={16} /> Volver a la historia</Link><h1 className="text-2xl font-extrabold text-primary">Configuración del consultorio</h1><p className="text-sm text-muted-foreground mt-1">Estos datos aparecen en la historia clínica y en la impresión.</p></div>
            <UserCog className="text-accent" size={34} />
          </div>

          <section className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-primary border-b border-border pb-3 mb-4">Datos del médico</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([['name', 'Nombre completo'], ['specialty', 'Especialidad'], ['license', 'Registro médico'], ['phone', 'Teléfono'], ['email', 'Correo'], ['city', 'Ciudad']] as const).map(([field, label]) => <label key={field} className="block"><span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">{label}</span><input value={settings[field]} onChange={(e) => update(field, e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" /></label>)}
            </div>
          </section>

          <section className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-primary border-b border-border pb-3 mb-4">Firma para documentos</h2>
            <div className="flex flex-wrap items-center gap-5">
              <div className="w-64 h-28 border-2 border-dashed border-border rounded-xl bg-muted flex items-center justify-center overflow-hidden">{settings.signatureDataUrl ? <img src={settings.signatureDataUrl} alt="Firma cargada" className="max-w-full max-h-full object-contain" /> : <span className="text-sm text-muted-foreground">Sin firma cargada</span>}</div>
              <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-accent"><ImagePlus size={17} /> Subir firma<input type="file" accept="image/png,image/jpeg" onChange={changeSignature} className="hidden" /></label>
              <p className="w-full text-xs text-muted-foreground">Usa PNG/JPG. Después de subirla, pulsa «Guardar configuración»: quedará guardada en este equipo y se incluirá en los respaldos.</p>
            </div>
          </section>

          <section className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-primary border-b border-border pb-3 mb-2">Catálogos y códigos institucionales</h2>
            <p className="text-xs text-muted-foreground mb-4">Una línea por elemento con el formato: nombre | código institucional. Deja el código vacío si aún no está confirmado; no se generan códigos automáticamente. Importa Excel/CSV con nombre en la primera columna y código en la segunda. Estos catálogos alimentan el autocompletado de la receta.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <label className="block"><span className="field-label">Medicamentos</span><span className="inline-flex items-center gap-1 text-xs text-accent font-bold cursor-pointer mb-1">Importar Excel/CSV<input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => void importCatalog(e, 'medications')} className="hidden" /></span><textarea value={medicationCatalog} onChange={(e) => setMedicationCatalog(e.target.value)} rows={8} placeholder="Losartán | código por confirmar\nFurosemida | código por confirmar\n..." className="w-full px-3 py-2 border border-input rounded-lg bg-card text-sm resize-y" /></label>
              <label className="block"><span className="field-label">Laboratorios</span><span className="inline-flex items-center gap-1 text-xs text-accent font-bold cursor-pointer mb-1">Importar Excel/CSV<input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => void importCatalog(e, 'laboratories')} className="hidden" /></span><textarea value={laboratoryCatalog} onChange={(e) => setLaboratoryCatalog(e.target.value)} rows={8} placeholder="Creatinina | Código por confirmar" className="w-full px-3 py-2 border border-input rounded-lg bg-card text-sm resize-y" /></label>
              <label className="block"><span className="field-label">Paraclínicos / procedimientos</span><span className="inline-flex items-center gap-1 text-xs text-accent font-bold cursor-pointer mb-1">Importar Excel/CSV<input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => void importCatalog(e, 'paraclinics')} className="hidden" /></span><textarea value={paraclinicCatalog} onChange={(e) => setParaclinicCatalog(e.target.value)} rows={8} placeholder="Ecografía renal | Código por confirmar" className="w-full px-3 py-2 border border-input rounded-lg bg-card text-sm resize-y" /></label><label className="block"><span className="field-label">Órdenes médicas (controles, remisiones, interconsultas)</span><span className="inline-flex items-center gap-1 text-xs text-accent font-bold cursor-pointer mb-1">Importar Excel/CSV<input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => void importCatalog(e, 'medical-orders')} className="hidden" /></span><textarea value={medicalOrderCatalog} onChange={(e) => setMedicalOrderCatalog(e.target.value)} rows={8} placeholder="Cita de control por nefrología | Código por confirmar" className="w-full px-3 py-2 border border-input rounded-lg bg-card text-sm resize-y" /></label>
            </div>
          </section>

          <section className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-primary border-b border-border pb-3 mb-4">Apariencia</h2>
            <div className="flex flex-wrap gap-3"><button onClick={() => setTheme('light')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold ${theme === 'light' ? 'bg-primary text-white border-primary' : 'border-border text-foreground'}`}><Sun size={17} /> Claro</button><button onClick={() => setTheme('dark')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold ${theme === 'dark' ? 'bg-primary text-white border-primary' : 'border-border text-foreground'}`}><Moon size={17} /> Oscuro</button></div>
          </section>

          <section className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-primary border-b border-border pb-3 mb-4">Formato de impresión</h2>
            <p className="text-xs text-muted-foreground mb-4">La configuración se aplica a historia clínica, órdenes médicas y vista de pacientes.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block"><span className="field-label">Tamaño de hoja</span><select value={printSettings.paper} onChange={(e) => setPrintSettings({ ...printSettings, paper: e.target.value as PrintSettings['paper'] })} className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-sm"><option value="A4">A4</option><option value="Letter">Carta / Letter</option><option value="receipt">Térmica 80 mm</option></select></label>
              <label className="block"><span className="field-label">Orientación</span><select value={printSettings.orientation} onChange={(e) => setPrintSettings({ ...printSettings, orientation: e.target.value as PrintSettings['orientation'] })} className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-sm"><option value="portrait">Vertical</option><option value="landscape">Horizontal</option></select></label>
              <label className="block"><span className="field-label">Márgenes</span><select value={printSettings.margin} onChange={(e) => setPrintSettings({ ...printSettings, margin: e.target.value as PrintSettings['margin'] })} className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-sm"><option value="normal">Normales</option><option value="compact">Compactos</option></select></label>
            </div>
          </section>

          <div className="flex justify-end"><button onClick={save} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-accent">{saved ? <Check size={18} /> : <Save size={18} />} {saved ? 'Guardado' : 'Guardar configuración'}</button></div>
        </div>
      </div>
    </AppLayout>
  );
}
