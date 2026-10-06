'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { PatientRecord } from './PatientRecordsPage';

const TFGTrendChart = dynamic(() => import('./TFGTrendChart'), { ssr: false });
const KDIGODistributionChart = dynamic(() => import('./KDIGODistributionChart'), { ssr: false });

interface Props {
  records: PatientRecord[];
}

export default function PatientChartsSection({ records }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground">
            TFG por Paciente (ml/min/1.73 m²)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Función renal — últimas consultas registradas
          </p>
        </div>
        <TFGTrendChart records={records} />
      </div>
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground">
            Distribución por Estadio KDIGO
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clasificación CKD — todos los pacientes
          </p>
        </div>
        <KDIGODistributionChart records={records} />
      </div>
    </div>
  );
}