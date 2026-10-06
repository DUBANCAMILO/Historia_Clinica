'use client';
import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';
import { RiskAlert } from '../types/hcTypes';

interface Props {
  tfg: string;
  kdigo: string;
  ta: string;
  gluco: string;
  labs2: string;
  crea: string;
  alerts: RiskAlert[];
  onAlertsChange: (alerts: RiskAlert[]) => void;
}

function generateAlerts(props: Omit<Props, 'alerts' | 'onAlertsChange'>): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const now = new Date().toISOString();
  const tfgNum = parseFloat(props.tfg);
  const glucoNum = parseFloat(props.gluco);
  const creaNum = parseFloat(props.crea);

  // TFG / KDIGO alerts
  if (!isNaN(tfgNum)) {
    if (tfgNum < 15) {
      alerts.push({ id: 'tfg-g5', type: 'critical', category: 'Renal', message: `TFG ${tfgNum} ml/min — KDIGO G5: Falla renal. Evaluar diálisis urgente.`, triggeredAt: now });
    } else if (tfgNum < 30) {
      alerts.push({ id: 'tfg-g4', type: 'critical', category: 'Renal', message: `TFG ${tfgNum} ml/min — KDIGO G4: ERC severa. Preparar acceso vascular.`, triggeredAt: now });
    } else if (tfgNum < 45) {
      alerts.push({ id: 'tfg-g3b', type: 'warning', category: 'Renal', message: `TFG ${tfgNum} ml/min — KDIGO G3b: ERC moderada-severa. Ajustar dosis de medicamentos.`, triggeredAt: now });
    } else if (tfgNum < 60) {
      alerts.push({ id: 'tfg-g3a', type: 'warning', category: 'Renal', message: `TFG ${tfgNum} ml/min — KDIGO G3a: ERC moderada. Monitoreo cada 3 meses.`, triggeredAt: now });
    }
  }

  // TA / HTA crisis
  if (props.ta) {
    const taMatch = props.ta.match(/(\d+)\s*\/\s*(\d+)/);
    if (taMatch) {
      const sys = parseInt(taMatch[1]);
      const dia = parseInt(taMatch[2]);
      if (sys >= 180 || dia >= 120) {
        alerts.push({ id: 'hta-crisis', type: 'critical', category: 'Cardiovascular', message: `TA ${props.ta} — Crisis hipertensiva. Manejo urgente requerido.`, triggeredAt: now });
      } else if (sys >= 160 || dia >= 100) {
        alerts.push({ id: 'hta-grado2', type: 'warning', category: 'Cardiovascular', message: `TA ${props.ta} — HTA grado 2. Ajustar tratamiento antihipertensivo.`, triggeredAt: now });
      }
    }
  }

  // Glucemia
  if (!isNaN(glucoNum)) {
    if (glucoNum > 400) {
      alerts.push({ id: 'gluco-crisis', type: 'critical', category: 'Metabólico', message: `Glucemia ${glucoNum} mg/dL — Hiperglucemia severa. Evaluar cetoacidosis.`, triggeredAt: now });
    } else if (glucoNum > 250) {
      alerts.push({ id: 'gluco-high', type: 'warning', category: 'Metabólico', message: `Glucemia ${glucoNum} mg/dL — Hiperglucemia. Ajustar hipoglucemiantes.`, triggeredAt: now });
    } else if (glucoNum < 70) {
      alerts.push({ id: 'gluco-low', type: 'critical', category: 'Metabólico', message: `Glucemia ${glucoNum} mg/dL — Hipoglucemia. Manejo inmediato.`, triggeredAt: now });
    }
  }

  // Creatinina
  if (!isNaN(creaNum) && creaNum > 8) {
    alerts.push({ id: 'crea-high', type: 'critical', category: 'Renal', message: `Creatinina ${creaNum} mg/dL — Valor crítico. Evaluar diálisis de urgencia.`, triggeredAt: now });
  }

  // Labs (K)
  if (props.labs2) {
    const kMatch = props.labs2.match(/K\s*([\d.]+)/i);
    if (kMatch) {
      const k = parseFloat(kMatch[1]);
      if (k >= 6.0) {
        alerts.push({ id: 'k-high', type: 'critical', category: 'Electrolitos', message: `Potasio ${k} mEq/L — Hipercalemia severa. Riesgo arrítmico. Manejo urgente.`, triggeredAt: now });
      } else if (k >= 5.5) {
        alerts.push({ id: 'k-mod', type: 'warning', category: 'Electrolitos', message: `Potasio ${k} mEq/L — Hipercalemia moderada. Restricción dietaria y ajuste de IECA/ARA.`, triggeredAt: now });
      } else if (k < 3.0) {
        alerts.push({ id: 'k-low', type: 'warning', category: 'Electrolitos', message: `Potasio ${k} mEq/L — Hipocalemia. Suplementar y revisar diuréticos.`, triggeredAt: now });
      }
    }
    const hbMatch = props.labs2.match(/Hb\s*([\d.]+)/i);
    if (hbMatch) {
      const hb = parseFloat(hbMatch[1]);
      if (hb < 8) {
        alerts.push({ id: 'hb-low', type: 'critical', category: 'Hematológico', message: `Hemoglobina ${hb} g/dL — Anemia severa. Evaluar transfusión / EPO.`, triggeredAt: now });
      } else if (hb < 10) {
        alerts.push({ id: 'hb-mod', type: 'warning', category: 'Hematológico', message: `Hemoglobina ${hb} g/dL — Anemia moderada. Iniciar/ajustar EPO.`, triggeredAt: now });
      }
    }
  }

  return alerts;
}

const iconMap = {
  critical: <AlertTriangle size={16} className="text-danger shrink-0 mt-0.5" />,
  warning: <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />,
  info: <Info size={16} className="text-accent shrink-0 mt-0.5" />,
};

const bgMap = {
  critical: 'bg-danger-bg border-danger/30',
  warning: 'bg-warning-bg border-warning/30',
  info: 'bg-info-bg border-info/30',
};

const textMap = {
  critical: 'text-danger',
  warning: 'text-warning',
  info: 'text-accent',
};

export default function RiskAlertPanel({ tfg, kdigo, ta, gluco, labs2, crea, alerts, onAlertsChange }: Props) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const generated = generateAlerts({ tfg, kdigo, ta, gluco, labs2, crea });
    onAlertsChange(generated);
    setDismissed([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tfg, kdigo, ta, gluco, labs2, crea]);

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  const criticalCount = visible.filter((a) => a.type === 'critical').length;

  if (alerts.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert size={18} className={criticalCount > 0 ? 'text-danger' : 'text-warning'} />
        <h4 className="text-sm font-extrabold text-primary uppercase tracking-wide">
          Alertas de Riesgo del Paciente
        </h4>
        {visible.length > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${criticalCount > 0 ? 'bg-danger text-white' : 'bg-warning text-white'}`}>
            {visible.length}
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-xs text-success font-semibold text-center py-2">✓ Sin alertas activas</p>
      ) : (
        <div className="space-y-2">
          {visible.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border ${bgMap[alert.type]}`}
            >
              {iconMap[alert.type]}
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold uppercase tracking-wide ${textMap[alert.type]}`}>
                  {alert.category}
                </span>
                <p className="text-xs text-foreground mt-0.5">{alert.message}</p>
              </div>
              <button
                onClick={() => setDismissed((d) => [...d, alert.id])}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
