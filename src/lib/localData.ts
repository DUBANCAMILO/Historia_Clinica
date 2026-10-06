export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'BACKUP' | 'RESTORE' | 'VIEW';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  actor: string;
  at: string;
  summary: string;
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** A versioned, credential-free snapshot of all user and clinic data held by the UI. */
export function buildSafetyBackupSnapshot() {
  return {
    hcs: readLocal<unknown[]>('hcs_hgc', []),
    recetas: readLocal<unknown[]>('nefrohc_recipes', readLocal<unknown[]>('recetas_hgc', [])),
    valoraciones: readLocal<unknown[]>('valoraciones_hgc', []),
    ordenesExternas: readLocal<unknown[]>('nefrohc_external_orders', []),
    ordenesManuales: readLocal<unknown[]>('nefrohc_manual_orders', []),
    nefroEvolution: readLocal<Record<string, unknown>>('nefro_evolution', {}),
    audit: readLocal<unknown[]>('nefro_audit_logs', []),
    catalogs: {
      medications: readLocal<unknown[]>('nefrohc_catalog_medications', []),
      laboratories: readLocal<unknown[]>('nefrohc_catalog_laboratories', []),
      paraclinics: readLocal<unknown[]>('nefrohc_catalog_paraclinics', []),
      medicalOrders: readLocal<unknown[]>('nefrohc_catalog_medical_orders', []),
    },
    doctorSettings: readLocal<Record<string, unknown>>('nefrohc_doctor_settings', {}),
    printSettings: readLocal<Record<string, unknown>>('nefrohc_print_settings', {}),
    theme: readLocal<string>('nefrohc_theme', 'light'),
    exportedAt: new Date().toISOString(),
    version: '3.0',
  };
}

export function recordAudit(action: AuditAction, entity: string, entityId: string, summary: string) {
  if (typeof window === 'undefined') return;
  try {
    const session = JSON.parse(localStorage.getItem('nefrohc_session') || '{}') as { email?: string; name?: string };
    const current = JSON.parse(localStorage.getItem('nefro_audit_logs') || '[]') as AuditEntry[];
    const entry: AuditEntry = { id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, action, entity, entityId, actor: session.name || session.email || 'Sistema local', at: new Date().toISOString(), summary };
    localStorage.setItem('nefro_audit_logs', JSON.stringify([entry, ...current].slice(0, 1000)));
  } catch { /* almacenamiento local no disponible */ }
}

/** Saves a local safety copy and, in the Tauri desktop app, a durable snapshot outside localStorage. */
export interface SafetyBackupResult { path: string; sqlitePath: string | null; confirmedAt: number; reused: boolean; }

export async function createAutomaticBackup(reason = 'Guardado automático', force = false): Promise<SafetyBackupResult | null> {
  if (typeof window === 'undefined') return null;
  const snapshot = buildSafetyBackupSnapshot();
  const serialized = JSON.stringify(snapshot);
  const isDesktop = '__TAURI_INTERNALS__' in window;

  // Browser-only fallback. In the desktop app the full snapshots live as files, avoiding localStorage quota limits.
  if (!isDesktop) {
    try {
      const current = readLocal<Array<{ id: string; createdAt: string; reason: string; data: string }>>('nefro_auto_backups', []);
      localStorage.setItem('nefro_auto_backups', JSON.stringify([{ id: `auto-${Date.now()}`, createdAt: snapshot.exportedAt, reason, data: serialized }, ...current].slice(0, 2)));
    } catch { /* no detener el guardado clínico por un respaldo local */ }
    return null;
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke<SafetyBackupResult>('create_safety_backup', { payload: serialized, force });
    try {
      localStorage.setItem('nefrohc_last_safety_backup', JSON.stringify({ ...result, reason }));
      localStorage.removeItem('nefrohc_last_safety_backup_error');
    } catch { /* el respaldo externo ya quedó escrito */ }
    window.dispatchEvent(new CustomEvent('nefrohc:backup-status', { detail: { ...result, reason } }));
    return result;
  } catch (error) {
    console.error('No se pudo crear el respaldo automático fuera de la aplicación.', error);
    const message = error instanceof Error ? error.message : String(error);
    try { localStorage.setItem('nefrohc_last_safety_backup_error', JSON.stringify({ message, at: new Date().toISOString(), reason })); } catch { /* el evento aún informa el fallo en la pantalla abierta */ }
    window.dispatchEvent(new CustomEvent('nefrohc:backup-status', { detail: { error: message, reason } }));
    return null;
  }
}
