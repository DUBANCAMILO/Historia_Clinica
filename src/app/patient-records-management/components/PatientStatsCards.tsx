'use client';
import React, { useMemo } from 'react';
import { Users, Activity, AlertTriangle, Calendar } from 'lucide-react';
import { PatientRecord } from './PatientRecordsPage';
import Icon from '@/components/ui/AppIcon';


interface Props {
  records: PatientRecord[];
  filtered: PatientRecord[];
}

export default function PatientStatsCards({ records, filtered }: Props) {
  const totalPatients = records.length;

  const avgTfg = useMemo(() => {
    const vals = records
      .map((r) => parseInt(r.tfg))
      .filter((v) => !isNaN(v));
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [records]);

  const g3plus = records.filter((r) =>
    ['G3a', 'G3b', 'G4', 'G5'].includes(r.kdigo)
  ).length;

  const thisMonth = records.filter((r) => {
    const d = new Date(r.fecha);
    const now = new Date('2026-09-07');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const cards = [
    {
      key: 'stat-total',
      label: 'Total Pacientes',
      value: totalPatients.toString(),
      icon: Users,
      color: 'text-accent',
      bg: 'bg-info-bg',
      border: 'border-info/20',
      trend: null,
    },
    {
      key: 'stat-tfg',
      label: 'TFG Promedio',
      value: `${avgTfg}`,
      unit: 'ml/min',
      icon: Activity,
      color: avgTfg >= 60 ? 'text-success' : avgTfg >= 30 ? 'text-warning' : 'text-danger',
      bg: avgTfg >= 60 ? 'bg-success-bg' : avgTfg >= 30 ? 'bg-warning-bg' : 'bg-danger-bg',
      border: avgTfg >= 60 ? 'border-success/20' : avgTfg >= 30 ? 'border-warning/20' : 'border-danger/20',
      trend: null,
    },
    {
      key: 'stat-g3plus',
      label: 'ERC G3 o mayor',
      value: g3plus.toString(),
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning-bg',
      border: 'border-warning/20',
      trend: `${Math.round((g3plus / totalPatients) * 100)}% del total`,
    },
    {
      key: 'stat-month',
      label: 'Este mes (Sep)',
      value: thisMonth.toString(),
      icon: Calendar,
      color: 'text-accent',
      bg: 'bg-info-bg',
      border: 'border-info/20',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-start justify-between`}
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {c.label}
              </p>
              <p className={`text-3xl font-bold font-tabular ${c.color}`}>
                {c.value}
                {c.unit && (
                  <span className="text-sm font-medium ml-1">{c.unit}</span>
                )}
              </p>
              {c.trend && (
                <p className="text-xs text-muted-foreground mt-1">{c.trend}</p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${c.bg}`}>
              <Icon size={20} className={c.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function useMemo<T>(factory: () => T, deps: React.DependencyList): T {
  return React.useMemo(factory, deps);
}