'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Download, Upload, FileJson, FileText, CheckCircle, AlertTriangle,
  Database, RefreshCw, Trash2, Clock, Shield, History, Play, Pause,
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
const AUTO_BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function getStats(): ExportStats {
  if (typeof window === 'undefined') return { hcs: 0, recetas: 0, valoraciones: 0 };
  return {
    hcs: JSON.parse(localStorage.getItem('hcs_hgc') || '[]').length,
    recetas: JSON.parse(localStorage.getItem('recetas_hgc') || '[]').length,
    valoraciones: JSON.parse(localStorage.getItem('valoraciones_hgc') || '[]').length,
  };
}

function getAllData() {
  return {
    hcs: JSON.parse(localStorage.getItem('hcs_hgc') || '[]'),
    recetas: JSON.parse(localStorage.getItem('recetas_hgc') || '[]'),
    valoraciones: JSON.parse(localStorage.getItem('valoraciones_hgc') || '[]'),
    exportedAt: new Date().toISOString(),
    version: '2.1',
  };
}

function hcsToCSV(hcs: Record<string, unknown>[]): string {
  if (!hcs.length) return '';
  const headers = ['fecha','hora','hcno','nombre','cc','edad','sexo','cel','eps','ciudad','motivo','enf_actual','nefrotox','fam','ta','fc','peso_act','gluco','labs2','labs4','cie10','analisis','plan_labs','plan_tto','tfg','imc','kdigo'];
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = hcs.map((r) => headers.map((h) => escape(r[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function getBackupHistory(): BackupEntry[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(BACKUP_HISTORY_KEY) || '[]');
}

function saveBackupToHistory(entry: BackupEntry) {
  const history = getBackupHistory();
  // Keep last 20 backups
  const updated = [entry, ...history].slice(0, 20);
  localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(updated));
}

function createBackupEntry(type: 'manual\' | \'auto', label?: string): BackupEntry {
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
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [restorePreview, setRestorePreview] = useState<{ hcs: number; recetas: number; valoraciones: number } | null>(null);
  const [pendingRestoreData, setPendingRestoreData] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const autoBackupRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setStats(getStats());
    setBackupHistory(getBackupHistory());
  }, []);

  const refreshStats = useCallback(() => {
    setStats(getStats());
    setBackupHistory(getBackupHistory());
  }, []);

  const showMsg = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  // Auto-backup timer
  useEffect(() => {
    if (autoBackupEnabled) {
      autoBackupRef.current = setInterval(() => {
        const entry = createBackupEntry('auto');
        saveBackupToHistory(entry);
        setLastAutoBackup(new Date().toLocaleTimeString('es-CO'));
        setBackupHistory(getBackupHistory());
      }, AUTO_BACKUP_INTERVAL_MS);
    } else {
      if (autoBackupRef.current) clearInterval(autoBackupRef.current);
    }
    return () => { if (autoBackupRef.current) clearInterval(autoBackupRef.current); };
  }, [autoBackupEnabled]);

  const handleManualBackup = () => {
    const entry = createBackupEntry('manual');
    saveBackupToHistory(entry);
    setBackupHistory(getBackupHistory());
    showMsg('success', 'Respaldo manual creado y guardado en el historial');
  };

  const exportJSON = () => {
    const data = getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NefroHC_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    // Also save to history
    const entry = createBackupEntry('manual', 'Exportación JSON');
    saveBackupToHistory(entry);
    setBackupHistory(getBackupHistory());
    showMsg('success', `Exportados ${stats.hcs} HC, ${stats.recetas} recetas y ${stats.valoraciones} valoraciones`);
  };

  const exportCSV = () => {
    const hcs = JSON.parse(localStorage.getItem('hcs_hgc') || '[]');
    const csv = hcsToCSV(hcs);
    if (!csv) { showMsg('error', 'No hay historias clínicas para exportar'); return; }
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NefroHC_historias_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg('success', `${hcs.length} historias clínicas exportadas en CSV`);
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

  const confirmRestore = () => {
    if (!pendingRestoreData) return;
    try {
      const data = JSON.parse(pendingRestoreData);
      if (data.hcs) localStorage.setItem('hcs_hgc', JSON.stringify(data.hcs));
      if (data.recetas) localStorage.setItem('recetas_hgc', JSON.stringify(data.recetas));
      if (data.valoraciones) localStorage.setItem('valoraciones_hgc', JSON.stringify(data.valoraciones));
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
        if (!data.hcs && !data.recetas && !data.valoraciones) {
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

  const clearAll = () => {
    if (!confirm('¿Eliminar TODOS los datos? Esta acción no se puede deshacer.')) return;
    // Auto-backup before clearing
    const entry = createBackupEntry('auto', 'Auto-respaldo antes de borrar');
    saveBackupToHistory(entry);
    localStorage.removeItem('hcs_hgc');
    localStorage.removeItem('recetas_hgc');
    localStorage.removeItem('valoraciones_hgc');
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
                  Medicina Interna - Nefrólogo | RM: 01-6566-87 | Cel: 317 5153473 | herrgoncor123@gmail.com | Bucaramanga
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

          {/* Auto-Backup Control */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${autoBackupEnabled ? 'bg-success/10' : 'bg-muted'}`}>
                  <Clock size={20} className={autoBackupEnabled ? 'text-success' : 'text-muted-foreground'} />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary text-sm">Respaldo Automático</h3>
                  <p className="text-xs text-muted-foreground">
                    {autoBackupEnabled
                      ? `Activo — cada 5 minutos${lastAutoBackup ? ` · Último: ${lastAutoBackup}` : ''}`
                      : 'Desactivado — activa para respaldos automáticos cada 5 min'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManualBackup}
                  className="flex items-center gap-2 px-4 py-2 bg-muted border border-border text-foreground rounded-xl text-xs font-bold hover:bg-secondary transition-all"
                >
                  <History size={14} />
                  Respaldo ahora
                </button>
                <button
                  onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    autoBackupEnabled
                      ? 'bg-success text-white hover:bg-green-700' :'bg-primary text-white hover:bg-accent'
                  }`}
                >
                  {autoBackupEnabled ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Activar</>}
                </button>
              </div>
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