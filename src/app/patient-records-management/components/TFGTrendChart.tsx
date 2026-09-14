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
  ReferenceLine,
} from 'recharts';
import { PatientRecord } from './PatientRecordsPage';

interface Props {
  records: PatientRecord[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const tfg = payload[0].value;
    let stage = '';
    if (tfg >= 90) stage = 'G1';
    else if (tfg >= 60) stage = 'G2';
    else if (tfg >= 45) stage = 'G3a';
    else if (tfg >= 30) stage = 'G3b';
    else if (tfg >= 15) stage = 'G4';
    else stage = 'G5';
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated text-xs">
        <p className="font-semibold text-foreground truncate max-w-32">{label}</p>
        <p className="text-accent font-bold font-tabular mt-1">
          TFG: {tfg} ml/min/1.73
        </p>
        <p className="text-muted-foreground">KDIGO: {stage}</p>
      </div>
    );
  }
  return null;
};

export default function TFGTrendChart({ records }: Props) {
  const data = records
    .slice(0, 10)
    .map((r) => ({
      name: r.nombre.split(' ')[0] + ' ' + (r.nombre.split(' ')[1]?.[0] || '') + '.',
      tfg: parseInt(r.tfg) || 0,
      id: r._id,
    }))
    .reverse();

  const getBarColor = (tfg: number) => {
    if (tfg >= 60) return 'var(--success)';
    if (tfg >= 30) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          domain={[0, 120]}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={60} stroke="var(--success)" strokeDasharray="4 4" />
        <ReferenceLine y={30} stroke="var(--warning)" strokeDasharray="4 4" />
        <Bar dataKey="tfg" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-tfg-${entry.id}`}
              fill={getBarColor(entry.tfg)}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}