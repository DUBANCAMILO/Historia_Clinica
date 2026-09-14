'use client';
import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { PatientRecord } from './PatientRecordsPage';

interface Props {
  record: PatientRecord;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  record,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-modal border border-border w-full max-w-md animate-slide-up">
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-bg rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Eliminar historia clínica</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-foreground mb-2">
            Estás por eliminar la historia clínica de:
          </p>
          <div className="bg-muted rounded-xl p-3 mb-4">
            <p className="font-semibold text-foreground">{record.nombre}</p>
            <p className="text-xs text-muted-foreground mt-1">
              CC: {record.cc} · Fecha: {record.fecha} · KDIGO: {record.kdigo}
            </p>
          </div>
          <p className="text-xs text-danger bg-danger-bg border border-danger/20 rounded-lg px-3 py-2">
            Esta operación eliminará permanentemente todos los datos clínicos de este paciente.
          </p>
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-all active:scale-95 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-danger text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <AlertTriangle size={15} />
            )}
            {loading ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}