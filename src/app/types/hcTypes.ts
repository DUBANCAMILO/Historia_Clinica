export interface Medication {
  id: string;
  drug: string;
  dose: string;
  doseUnit: string;
  quantity: string;
  route: string;
  frequency: string;
  duration: string;
  notes: string;
  /** código institucional confirmado para el medicamento; vacío si aún no ha sido confirmado. */
  code?: string;
  presentation: string;
  maxDose: string;
  renalAdjustment: string;
  nephrotoxic: boolean;
  favorite: boolean;
}

export interface RiskAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  triggeredAt: string;
}

export interface HCFormData {
  history_id: string;
  prescription_id: string;
  fecha: string;
  hora: string;
  hcno: string;
  ciudad: string;
  nombre: string;
  cc: string;
  edad: string;
  sexo: string;
  cel: string;
  eps: string;
  acompanante: string;
  allergies: string;
  motivo: string;
  enf_actual: string;
  nefrotox: string;
  fam: string;
  peso_val: string;
  talla_val: string;
  crea_calc: string;
  bun_calc: string;
  ta: string;
  fc: string;
  peso_act: string;
  gluco: string;
  ex_cardio: string;
  ex_abd: string;
  labs2: string;
  labs4: string;
  cie10: string;
  analisis: string;
  plan_labs: string;
  plan_tto: string;
  additional_notes: string;
  prescription_ordenes_medicas: string;
  prescription_laboratorios: string;
  prescription_paraclinicos: string;
  medications: Medication[];
  riskAlerts: RiskAlert[];
}

export const defaultHCFormData: HCFormData = {
  history_id: '',
  prescription_id: '',
  fecha: new Date().toISOString().split('T')[0],
  hora: '',
  hcno: '',
  ciudad: 'Bucaramanga',
  nombre: '',
  cc: '',
  edad: '',
  sexo: 'M',
  cel: '',
  eps: '',
  acompanante: '',
  allergies: '',
  motivo: '',
  enf_actual: '',
  nefrotox: '',
  fam: '',
  peso_val: '',
  talla_val: '',
  crea_calc: '',
  bun_calc: '',
  ta: '',
  fc: '',
  peso_act: '',
  gluco: '',
  ex_cardio: '',
  ex_abd: '',
  labs2: '',
  labs4: '',
  cie10: '',
  analisis: '',
  plan_labs: '',
  plan_tto: '',
  additional_notes: '',
  prescription_ordenes_medicas: '',
  prescription_laboratorios: '',
  prescription_paraclinicos: '',
  medications: [],
  riskAlerts: [],
};