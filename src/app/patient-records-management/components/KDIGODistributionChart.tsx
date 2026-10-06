'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PatientRecord } from './PatientRecordsPage';

interface Props {
  records: PatientRecord[];
}

const KDIGO_COLORS: Record<string, string> = {
  G1: 'var(--success)',
  G2: '#84cc16',
  G3a: 'var(--warning)',
  G3b: '#f97316',
  G4: '#ef4444',
  G5: 'var(--danger)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated text-xs">
        <p className="font-bold text-foreground">Estadio {label}</p>
        <p className="text-accent font-tabular mt-1">
          {payload[0].value} paciente{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export default function KDIGODistributionChart({ records }: Props) {
  const counts = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5'].map((g) => ({
    stage: g,
    count: records.filter((r) => r.kdigo === g).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={counts} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 600 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[5, 5, 0, 0]}>
          {counts.map((entry) => (
            <Cell
              key={`kdigo-bar-${entry.stage}`}
              fill={KDIGO_COLORS[entry.stage] || 'var(--muted)'}
              fillOpacity={0.9}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}