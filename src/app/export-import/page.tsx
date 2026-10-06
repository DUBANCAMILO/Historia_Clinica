'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { invoke } from '@tauri-apps/api/core';
import { createAutomaticBackup, recordAudit } from '../../lib/localData';
import {
  Download, Upload, FileJson, FileText, CheckCircle, AlertTriangle, Clock,
  Database, RefreshCw, Trash2, Shield, History,
  ChevronDown, ChevronUp, Info,
} from 'lucide-react';

interface ExportStats {
  hcs: number;
  recetas: number;
  valoraciones: number;
}

interface BackupEntry {
  id: string;
  timestamp: string;
  label: string;
  type: 'manual' | 'auto';
  hcs: number;
  recetas: number;
  valoraciones: number;
  data: string; // JSON string
}

const BACKUP_HISTORY_KEY = 'nefro_backup_history';

function readStorage<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw) as T;}catch{return fallback;}}
function readArray<T>(key:string,fallbackKey?:string):T[]{const value=readStorage<unknown>(key,fallbackKey?readStorage<unknown>(fallbackKey,[]):[]);return Array.isArray(value)?value as T[]:[];}
function getStats(): ExportStats {
  if (typeof window === 'undefined') return { hcs: 0, recetas: 0, valoraciones: 0 };
  return {hcs:readArray('hcs_hgc').length,recetas:readArray('nefrohc_recipes','recetas_hgc').length,valoraciones:readArray('valoraciones_hgc').length};
}
function getAllData() {
  return {
    hcs:readArray('hcs_hgc'),recetas:readArray('nefrohc_recipes','recetas_hgc'),audit:readArray('nefro_audit_logs'),autoBackups:readArray('nefro_auto_backups'),nefroEvolution:readStorage('nefro_evolution',{}),
    catalogs:{medications:readArray('nefrohc_catalog_medications'),laboratories:readArray('nefrohc_catalog_laboratories'),paraclinics:readArray('nefrohc_catalog_paraclinics'),medicalOrders:readArray('nefrohc_catalog_medical_orders')},
    valoraciones:readArray('valoraciones_hgc'),ordenesMedicas:readArray('nefrohc_external_orders'),ordenesManuales:readArray('nefrohc_manual_orders'),
    doctorSettings:readStorage('nefrohc_doctor_settings',{}),printSettings:readStorage('nefrohc_print_settings',{}),theme:readStorage('nefrohc_theme','light'),
    exportedAt:new Date().toISOString(),version:'2.2',
  };
}
function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.style.display = 'none'; anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); window.setTimeout(() => { anchor.remove(); URL.revokeObjectURL(url); }, 1000); }
async function saveExportFile(filename:string,content:string,extension:'json'|'csv',mime:string):Promise<string|null>{if(typeof window!=='undefined'&&'__TAURI_INTERNALS__' in window)return await invoke<string|null>('save_export_file',{fileName:filename,content,extension});downloadBlob(new Blob([content],{type:mime}),filename);return 'browser-download';}
function localDateStamp(){const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}

function hcsToCSV(hcs: Record<string, unknown>[]): string {
  const headers = ['fecha','hora','hcno','nombre','cc','edad','sexo','cel','eps','ciudad','allergies','motivo','enf_actual','nefrotox','fam','ta','fc','peso_act','gluco','labs2','labs4','cie10','analisis','plan_labs','plan_tto','prescription_laboratorios','prescription_paraclinicos','prescription_ordenes_medicas','tfg','imc','kdigo'];
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = hcs.map((r) => headers.map((h) => escape(r[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function getBackupHistory(): BackupEntry[] { return readArray<BackupEntry>(BACKUP_HISTORY_KEY); }
function saveBackupToHistory(entry: BackupEntry):boolean { try { const updated=[entry,...getBackupHistory()].slice(0,20);localStorage.setItem(BACKUP_HISTORY_KEY,JSON.stringify(updated));return true; } catch { return false; } }

function createBackupEntry(type: 'manual' | 'auto', label?: string): BackupEntry {
  const data = getAllData();
  return {
    id: `bk-${Date.now()}`,
    timestamp: new Date().toISOString(),
    label: label || (type === 'auto' ? 'Auto-respaldo' : 'Respaldo manual'),
    type,
    hcs: data.hcs.length,
    recetas: data.recetas.length,
    valoraciones: data.valoraciones.length,
    data: JSON.stringify(data),
  };
}

export default function ExportImportPage() {
  const [stats, setStats] = useState<ExportStats>({ hcs: 0, recetas: 0, valoraciones: 0 });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupEntry[]>([]);
  const [lastBackupPath, setLastBackupPath] = useState<string | null>(null);
  const [lastBackupSqlitePath, setLastBackupSqlitePath] = useState<string | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [restorePreview, setRestorePreview] = useState<{ hcs: number; recetas: number; valoraciones: number } | null>(null);
  const [pendingRestoreData, setPendingRestoreData] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStats(getStats());
    setBackupHistory(getBackupHistory());
    try {
      const saved = JSON.parse(localStorage.getItem('nefrohc_last_safety_backup') || 'null') as { path?: string; sqlitePath?: string | null; confirmedAt?: number } | null;
      if (saved?.path) setLastBackupPath(saved.path);
      if (saved?.sqlitePath) setLastBackupSqlitePath(saved.sqlitePath);
      if (saved?.confirmedAt) setLastBackupTime(new Date(saved.confirmedAt).toLocaleString('es-CO'));
      const failed = JSON.parse(localStorage.getItem('nefrohc_last_safety_backup_error') || 'null') as { message?: string } | null;
      if (failed?.message) setBackupError(failed.message);
    } catch { /* estado visual solamente */ }
    const onBackupStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: string; sqlitePath?: string | null; confirmedAt?: number; error?: string }>).detail;
      if (detail?.error) { setBackupError(detail.error); return; }
      if (detail?.path) setLastBackupPath(detail.path);
      if (detail?.sqlitePath) setLastBackupSqlitePath(detail.sqlitePath);
      if (detail?.confirmedAt) setLastBackupTime(new Date(detail.confirmedAt).toLocaleString('es-CO'));
      setBackupError(null);
    }; 
    window.addEventListener('nefrohc:backup-status', onBackupStatus);
    return () => window.removeEventListener('nefrohc:backup-status', onBackupStatus);
  }, []);

  const refreshStats = useCallback(() => {
    setStats(getStats());
    setBackupHistory(getBackupHistory());
  }, []);

  const showMsg = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const handleManualBackup = async () => {
    const entry = createBackupEntry('manual');
    const historySaved = saveBackupToHistory(entry);
    const path = await createAutomaticBackup('Respaldo manual solicitado', true);
    recordAudit('BACKUP', 'Respaldo', entry.id, 'Respaldo manual completo solicitado');
    setBackupHistory(getBackupHistory());
    if (path) {
      setLastBackupPath(path.path);
      setLastBackupSqlitePath(path.sqlitePath);
      setLastBackupTime(new Date(path.confirmedAt).toLocaleString('es-CO'));
      setBackupError(null);
      showMsg('success', path.reused ? `Se verificó el respaldo existente: ${path.path}` : `Respaldo JSON${path.sqlitePath ? ' y SQLite' : ''} guardado en: ${path.path}`);
    } else if ('__TAURI_INTERNALS__' in window) {
      showMsg('error', 'No se confirmó el respaldo JSON/SQLite en el escritorio. La anotación del historial no es una copia de datos; revisa el error, permisos y espacio disponible.');
    } else {
      showMsg(historySaved ? 'info' : 'error', historySaved ? 'La alternativa del navegador intentó guardar un snapshot local limitado; no se verificó un archivo externo.' : 'No se pudo guardar el snapshot local; exporta un JSON a otra carpeta y revisa el espacio disponible.');
    }
  };

  const exportJSON = async () => {
    try {
      const data=getAllData();const filename=`NefroHC_backup_${localDateStamp()}.json`;
      const savedPath=await saveExportFile(filename,JSON.stringify(data,null,2),'json','application/json;charset=utf-8');
      if(savedPath===null){showMsg('info','Exportación cancelada; no se guardó ningún archivo.');return;}
      const entry=createBackupEntry('manual','Exportación JSON');const historySaved=saveBackupToHistory(entry);setBackupHistory(getBackupHistory());
      recordAudit('EXPORT','Datos','local',`Exportación JSON de ${data.hcs.length} historias y ${data.recetas.length} recetas`);
      const destination=savedPath==='browser-download'?'Respaldo JSON descargado.':`Respaldo JSON guardado: ${savedPath}`;
      showMsg('success',historySaved?destination:`${destination} El historial interno no guardó una copia adicional por falta de espacio.`);
    }catch{showMsg('error','No se pudo guardar el respaldo JSON. Intenta elegir otra carpeta o revisa el espacio disponible.');}
  };

  const exportCSV = async () => {
    try {
      const hcs=readArray<Record<string,unknown>>('hcs_hgc');const csv=String.fromCharCode(0xFEFF)+hcsToCSV(hcs);const filename=`NefroHC_historias_${localDateStamp()}.csv`;
      const savedPath=await saveExportFile(filename,csv,'csv','text/csv;charset=utf-8;');
      if(savedPath===null){showMsg('info','Exportación cancelada; no se guardó ningún archivo.');return;}
      recordAudit('EXPORT','Historias clínicas','local',`Exportación CSV de ${hcs.length} historias`);
      showMsg('success',savedPath==='browser-download'?`${hcs.length} historias descargadas en CSV.`:`CSV guardado: ${savedPath}`);
    }catch{showMsg('error','No se pudo guardar el CSV. Intenta elegir otra carpeta o revisa el espacio disponible.');}
  };

  const restoreFromEntry = (entry: BackupEntry) => {
    try {
      const data = JSON.parse(entry.data);
      setPendingRestoreData(entry.data);
      setRestorePreview({ hcs: data.hcs?.length ?? 0, recetas: data.recetas?.length ?? 0, valoraciones: data.valoraciones?.length ?? 0 });
    } catch {
      showMsg('error', 'Error al leer el respaldo seleccionado');
    }
  };

  const confirmRestore = async () => {
    if (!pendingRestoreData) return;
    try {
      const safetyPath = await createAutomaticBackup('Antes de restaurar respaldo', true);
      if ('__TAURI_INTERNALS__' in window && !safetyPath) {
        showMsg('error', 'Restauración cancelada: no se pudo crear primero el respaldo de seguridad.');
        return;
      }
      const data = JSON.parse(pendingRestoreData);
      if ('__TAURI_INTERNALS__' in window) {
        try {
          await invoke('restore_snapshot_mirror', { payload: pendingRestoreData });
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error);
          showMsg('error', `Restauración cancelada: no se pudo sincronizar la copia SQLite. ${detail}`);
          return;
        }
      }
      if (Array.isArray(data.hcs)) localStorage.setItem('hcs_hgc', JSON.stringify(data.hcs));
      if (Array.isArray(data.recetas)) localStorage.setItem('nefrohc_recipes', JSON.stringify(data.recetas));
      if (Array.isArray(data.autoBackups)) localStorage.setItem('nefro_auto_backups', JSON.stringify(data.autoBackups));
      if (Array.isArray(data.valoraciones)) localStorage.setItem('valoraciones_hgc', JSON.stringify(data.valoraciones));
      if (Array.isArray(data.ordenesExternas) || Array.isArray(data.ordenesMedicas)) localStorage.setItem('nefrohc_external_orders', JSON.stringify(data.ordenesExternas || data.ordenesMedicas));
      if (Array.isArray(data.ordenesManuales)) localStorage.setItem('nefrohc_manual_orders', JSON.stringify(data.ordenesManuales));
      if (data.printSettings) localStorage.setItem('nefrohc_print_settings', JSON.stringify(data.printSettings));
      if (data.doctorSettings) localStorage.setItem('nefrohc_doctor_settings', JSON.stringify(data.doctorSettings));
      if (data.theme) { localStorage.setItem('nefrohc_theme', String(data.theme)); document.documentElement.classList.toggle('dark', data.theme === 'dark'); }
      if (data.audit) localStorage.setItem('nefro_audit_logs', JSON.stringify(data.audit));
      if (data.nefroEvolution) localStorage.setItem('nefro_evolution', JSON.stringify(data.nefroEvolution));
      if (data.catalogs) {
        localStorage.setItem('nefrohc_catalog_medications', JSON.stringify(data.catalogs.medications || []));
        localStorage.setItem('nefrohc_catalog_laboratories', JSON.stringify(data.catalogs.laboratories || []));
        localStorage.setItem('nefrohc_catalog_paraclinics', JSON.stringify(data.catalogs.paraclinics || []));
        if (data.catalogs.medicalOrders) localStorage.setItem('nefrohc_catalog_medical_orders', JSON.stringify(data.catalogs.medicalOrders));
      }
      window.dispatchEvent(new Event('nefrohc:data-updated'));
      window.dispatchEvent(new Event('nefrohc:settings-updated'));
      recordAudit('RESTORE', 'Respaldo', 'local', 'Restauración de respaldo confirmada');
      refreshStats();
      setPendingRestoreData(null);
      setRestorePreview(null);
      showMsg('success', `Restaurados: ${data.hcs?.length ?? 0} HC, ${data.recetas?.length ?? 0} recetas, ${data.valoraciones?.length ?? 0} valoraciones`);
    } catch {
      showMsg('error', 'Error al restaurar los datos');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const recognized=['hcs','recetas','valoraciones','ordenesMedicas','ordenesManuales','ordenesExternas'].some((key)=>Array.isArray(data[key]));
        if (!recognized) {
          showMsg('error', 'Archivo inválido: no contiene datos NefroHC');
          setImporting(false);
          return;
        }
        // Show preview before restoring
        setPendingRestoreData(ev.target?.result as string);
        setRestorePreview({ hcs: data.hcs?.length ?? 0, recetas: data.recetas?.length ?? 0, valoraciones: data.valoraciones?.length ?? 0 });
        showMsg('info', 'Archivo válido. Revise la vista previa y confirme la restauración.');
      } catch {
        showMsg('error', 'Error al leer el archivo. Verifique que sea un JSON válido de NefroHC.');
      }
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const clearAll = async () => {
    if (!confirm('¿Eliminar TODOS los datos? Esta acción no se puede deshacer.')) return;
    const safetyPath = await createAutomaticBackup('Antes de eliminar todos los datos', true);
    if ('__TAURI_INTERNALS__' in window && !safetyPath) {
      showMsg('error', 'No se eliminó ningún dato porque falló el respaldo de seguridad.');
      return;
    }
    const entry = createBackupEntry('auto', 'Auto-respaldo antes de borrar');
    saveBackupToHistory(entry);
    localStorage.removeItem('hcs_hgc');
    localStorage.removeItem('nefrohc_recipes');
    localStorage.removeItem('nefrohc_manual_orders');
    localStorage.removeItem('nefrohc_external_orders');
    localStorage.removeItem('nefro_evolution');
    localStorage.removeItem('recetas_hgc');
    localStorage.removeItem('valoraciones_hgc');
    localStorage.removeItem('nefro_audit_logs');
    window.dispatchEvent(new Event('nefrohc:data-updated'));
    refreshStats();
    showMsg('success', 'Todos los datos eliminados. Se creó un respaldo automático de seguridad.');
  };

  const deleteHistoryEntry = (id: string) => {
    const updated = getBackupHistory().filter((e) => e.id !== id);
    localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(updated));
    setBackupHistory(updated);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    } catch { return iso; }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 lg:pl-6 pl-16 no-print">
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            <div className="flex items-center gap-4">
              <img
                src="/assets/kidney-stethoscope-logo.svg"
                alt="NefroHC logo"
                className="w-14 h-14 rounded-xl object-contain bg-white/10 p-1.5 shrink-0"
              />
              <div className="text-center flex-1">
                <h1 className="text-xl font-extrabold leading-tight text-center">
                  Dr. Hernando González Cortina
                </h1>
                <p className="text-blue-200 text-xs text-center font-semibold">
                  Medicina Interna - Nefrólogo | RM: 01-6566-87 | Cel: 317 5153473 | hergoncor@gmail.com | Bucaramanga
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8">
          {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                <Shield size={24} className="text-accent" />
                Centro de Respaldo y Recuperación
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Gestión completa de copias de seguridad, restauración validada e historial de respaldos
              </p>
            </div>
            <button
              onClick={refreshStats}
              className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-all"
            >
              <RefreshCw size={14} />
              Actualizar
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-semibold ${
              message.type === 'success' ? 'bg-success-bg text-success border border-success/20' :
              message.type === 'info'? 'bg-info-bg text-accent border border-accent/20' : 'bg-danger-bg text-danger border border-danger/20'
            }`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : message.type === 'info' ? <Info size={18} /> : <AlertTriangle size={18} />}
              {message.text}
            </div>
          )}

          {/* Restore Preview Modal */}
          {restorePreview && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-md w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-warning-bg rounded-xl flex items-center justify-center">
                    <AlertTriangle size={20} className="text-warning" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-primary text-base">Confirmar Restauración</h3>
                    <p className="text-xs text-muted-foreground">Los datos actuales serán reemplazados</p>
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-4 mb-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Datos a restaurar:</p>
                  <div className="flex justify-between text-sm"><span className="text-foreground">Historias Clínicas</span><span className="font-bold text-accent">{restorePreview.hcs}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-foreground">Recetas</span><span className="font-bold text-success">{restorePreview.recetas}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-foreground">Valoraciones</span><span className="font-bold text-warning">{restorePreview.valoraciones}</span></div>
                </div>
                <p className="text-xs text-warning font-semibold mb-4 p-3 bg-warning-bg rounded-lg border border-warning/20">
                  ⚠️ Esta acción reemplazará los datos actuales ({stats.hcs} HC, {stats.recetas} recetas, {stats.valoraciones} valoraciones).
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setPendingRestoreData(null); setRestorePreview(null); }} className="flex-1 px-4 py-2.5 bg-muted border border-border text-foreground rounded-xl font-semibold text-sm hover:bg-secondary transition-all">
                    Cancelar
                  </button>
                  <button onClick={confirmRestore} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-accent transition-all">
                    Confirmar Restauración
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Historias Clínicas', value: stats.hcs, color: 'text-accent', bg: 'bg-info-bg', border: 'border-accent/20' },
              { label: 'Recetas', value: stats.recetas, color: 'text-success', bg: 'bg-success-bg', border: 'border-success/20' },
              { label: 'Valoraciones', value: stats.valoraciones, color: 'text-warning', bg: 'bg-warning-bg', border: 'border-warning/20' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-5 border ${s.border}`}>
                <div className="flex items-center gap-3">
                  <Database size={22} className={s.color} />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Auto-backup runs from the authenticated application shell. */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success/10">
                  <Shield size={20} className="text-success" />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary text-sm">Respaldo automático activo</h3>
                  <p className="text-xs text-muted-foreground">Al iniciar sesión, después de guardar cambios y cada 5 minutos. Conserva hasta 30 copias locales de JSON y SQLite.</p>
                  {lastBackupTime && <p className="text-xs text-success mt-1">Último respaldo confirmado por la aplicación: {lastBackupTime}</p>}
                  {lastBackupPath && <p className="text-[10px] text-muted-foreground mt-1 break-all">JSON: {lastBackupPath}</p>}
                  {lastBackupSqlitePath && <p className="text-[10px] text-muted-foreground mt-1 break-all">SQLite: {lastBackupSqlitePath}</p>}
                  {backupError && <p role="alert" className="text-xs text-destructive mt-2">Falló el último respaldo: {backupError}</p>}
                </div>
              </div>
              <button onClick={() => void handleManualBackup()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-accent transition-all">
                <History size={14} /> Crear respaldo ahora
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Export */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Download size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary text-base">Exportar Datos</h3>
                  <p className="text-xs text-muted-foreground">Descarga un respaldo portátil</p>
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={exportJSON} className="w-full flex items-center gap-4 px-5 py-4 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-accent transition-all duration-150 active:scale-95">
                  <FileJson size={22} />
                  <div className="text-left">
                    <p className="font-bold">Exportar JSON completo</p>
                    <p className="text-xs opacity-80">HC + Recetas + Valoraciones — restauración 1 clic</p>
                  </div>
                </button>
                <button onClick={exportCSV} className="w-full flex items-center gap-4 px-5 py-4 bg-card border-2 border-border text-foreground rounded-xl font-semibold text-sm hover:bg-muted transition-all duration-150 active:scale-95">
                  <FileText size={22} className="text-success" />
                  <div className="text-left">
                    <p className="font-bold">Exportar CSV (Historias)</p>
                    <p className="text-xs text-muted-foreground">Compatible con Excel / Google Sheets</p>
                  </div>
                </button>
              </div>
              <div className="mt-4 p-3 bg-info-bg rounded-lg border border-info/20">
                <p className="text-xs text-accent font-semibold">
                  💡 El JSON incluye todos los datos y permite restauración completa. El CSV solo incluye historias clínicas.
                </p>
              </div>
            </div>

            {/* Import / Restore */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                  <Upload size={20} className="text-success" />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary text-base">Restaurar desde Archivo</h3>
                  <p className="text-xs text-muted-foreground">Importa un respaldo JSON previo</p>
                </div>
              </div>
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent hover:bg-info-bg/50 transition-all duration-150"
                onClick={() => fileRef.current?.click()}
              >
                {importing ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw size={32} className="text-accent animate-spin" />
                    <p className="text-sm font-semibold text-accent">Validando archivo...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={32} className="text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">Haz clic para seleccionar archivo</p>
                    <p className="text-xs text-muted-foreground">Solo archivos .json de NefroHC</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              <div className="mt-4 p-3 bg-warning-bg rounded-lg border border-warning/20">
                <p className="text-xs text-warning font-semibold">
                  ⚠️ Se mostrará una vista previa antes de restaurar. Los datos actuales serán reemplazados.
                </p>
              </div>
            </div>
          </div>

          {/* Backup History Log */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <History size={20} className="text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-primary text-base">Historial de Respaldos</h3>
                  <p className="text-xs text-muted-foreground">{backupHistory.length} respaldos guardados localmente</p>
                </div>
              </div>
              {showHistory ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
            </button>

            {showHistory && (
              <div className="mt-4">
                {backupHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <History size={28} className="mx-auto mb-2 opacity-30" />
                    <p>No hay respaldos en el historial</p>
                    <p className="text-xs mt-1">Crea un respaldo manual o activa el automático</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {backupHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.type === 'auto' ? 'bg-accent/10' : 'bg-primary/10'}`}>
                            {entry.type === 'auto' ? <Clock size={14} className="text-accent" /> : <Shield size={14} className="text-primary" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{entry.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(entry.timestamp)} · {entry.hcs} HC · {entry.recetas} Rx · {entry.valoraciones} Val
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${entry.type === 'auto' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                            {entry.type === 'auto' ? 'Auto' : 'Manual'}
                          </span>
                          <button
                            onClick={() => restoreFromEntry(entry)}
                            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-accent transition-all"
                          >
                            Restaurar
                          </button>
                          <button
                            onClick={() => deleteHistoryEntry(entry.id)}
                            className="p-1.5 text-danger hover:bg-danger-bg rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-card rounded-2xl border border-danger/30 shadow-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-danger-bg rounded-xl flex items-center justify-center">
                  <Trash2 size={20} className="text-danger" />
                </div>
                <div>
                  <h3 className="font-extrabold text-danger text-base">Zona de Peligro</h3>
                  <p className="text-xs text-muted-foreground">Eliminar todos los datos permanentemente (se crea respaldo automático antes)</p>
                </div>
              </div>
              <button
                onClick={clearAll}
                className="px-5 py-2.5 bg-danger text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all duration-150 active:scale-95"
              >
                Eliminar todo
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}