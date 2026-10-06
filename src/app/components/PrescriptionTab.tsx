'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileDown, Loader2, Pill, Plus, Printer, Save, Search, Trash2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { HCFormData, Medication } from '../types/hcTypes';
import { applyPrintSettings } from '../../lib/printSettings';
import { printElements } from '../../lib/printDocument';
import QrAttention from './QrAttention';

interface Props {
  formData: HCFormData;
  updateField: (field: keyof HCFormData, value: string) => void;
  medications: Medication[];
  onMedicationsChange: (meds: Medication[]) => void;
  onSaveAll: (override?: Partial<HCFormData>) => Promise<void>;
  onNewHistory: () => void;
}

interface OrderItem { name: string; code: string; }
type CatalogItem = OrderItem;
interface PrescriptionRecord {
  id: string;
  historyId: string;
  patientKey: string;
  patientName: string;
  cc: string;
  date: string;
  dx: string;
  medications: Medication[];
  additionalNotes: string;
  paraclinicos: OrderItem[];
  laboratorios: OrderItem[];
  ordenesMedicas: OrderItem[];
  createdAt: string;
}

const ROUTES = ['VO', 'IV', 'IM', 'SC', 'SL', 'Tópico', 'Inhalado', 'Rectal', 'Transdérmica'];
const FREQUENCIES = ['c/día', 'c/12h', 'c/8h', 'c/6h', 'c/4h', '2x/semana', '3x/semana', 'Semanal', 'Mensual', 'Según necesidad'];
const MEDICATION_CATALOG: CatalogItem[] = [{ name: 'Losartán', code: '' }, { name: 'Amlodipino', code: '' }, { name: 'Enalapril', code: '' }, { name: 'Valsartán', code: '' }, { name: 'Candesartán', code: '' }, { name: 'Irbesartán', code: '' }, { name: 'Furosemida', code: '' }, { name: 'Hidroclorotiazida', code: '' }, { name: 'Clortalidona', code: '' }, { name: 'Espironolactona', code: '' }, { name: 'Metoprolol', code: '' }, { name: 'Carvedilol', code: '' }, { name: 'Bisoprolol', code: '' }, { name: 'Diltiazem', code: '' }, { name: 'Atorvastatina', code: '' }, { name: 'Rosuvastatina', code: '' }, { name: 'Metformina', code: '' }, { name: 'Empagliflozina', code: '' }, { name: 'Dapagliflozina', code: '' }, { name: 'Insulina NPH', code: '' }, { name: 'Insulina glargina', code: '' }, { name: 'Sitagliptina', code: '' }, { name: 'Prednisona', code: '' }, { name: 'Metilprednisolona', code: '' }, { name: 'Micofenolato', code: '' }, { name: 'Ciclofosfamida', code: '' }, { name: 'Rituximab', code: '' }, { name: 'Tacrolimus', code: '' }, { name: 'Ciclosporina', code: '' }, { name: 'Eritropoyetina', code: '' }, { name: 'Darbepoetina', code: '' }, { name: 'Carbonato de calcio', code: '' }, { name: 'Acetato de calcio', code: '' }, { name: 'Sevelamer', code: '' }, { name: 'Calcitriol', code: '' }, { name: 'Paricalcitol', code: '' }, { name: 'Hierro sacarosa', code: '' }, { name: 'Hierro carboximaltosa', code: '' }, { name: 'Bicarbonato de sodio', code: '' }, { name: 'Patiromer', code: '' }, { name: 'Sulfato ferroso', code: '' }, { name: 'Ácido fólico', code: '' }, { name: 'Omeprazol', code: '' }, { name: 'Acetaminofén', code: '' }, { name: 'Levotiroxina', code: '' }, { name: 'Alopurinol', code: '' }, { name: 'Colchicina', code: '' }, { name: 'Warfarina', code: '' }, { name: 'Apixabán', code: '' }, { name: 'Rivaroxabán', code: '' }, { name: 'Ácido acetilsalicílico', code: '' }, { name: 'Clopidogrel', code: '' }, { name: 'Pentoxifilina', code: '' }, { name: 'Nifedipino', code: '' }, { name: 'Verapamilo', code: '' }, { name: 'Clonidina', code: '' }, { name: 'Hidralazina', code: '' }, { name: 'Minoxidil', code: '' }, { name: 'Doxazosina', code: '' }, { name: 'Tamsulosina', code: '' }, { name: 'Finasterida', code: '' }, { name: 'Levocetirizina', code: '' }, { name: 'Montelukast', code: '' }, { name: 'Salbutamol', code: '' }, { name: 'Budesonida', code: '' }, { name: 'Amoxicilina', code: '' }, { name: 'Amoxicilina / ácido clavulánico', code: '' }, { name: 'Cefalexina', code: '' }, { name: 'Ciprofloxacino', code: '' }, { name: 'Fluconazol', code: '' }, { name: 'Aciclovir', code: '' }, { name: 'Gabapentina', code: '' }, { name: 'Pregabalina', code: '' }, { name: 'Tramadol', code: '' }, { name: 'Morfina', code: '' }, { name: 'Sertralina', code: '' }, { name: 'Escitalopram', code: '' }, { name: 'Quetiapina', code: '' }, { name: 'Famotidina', code: '' }, { name: 'Ondansetrón', code: '' }, { name: 'Domperidona', code: '' }];
const LAB_CATALOG: OrderItem[] = [
  { name: 'Hemograma', code: '' }, { name: 'Creatinina sérica', code: '' }, { name: 'BUN', code: '' }, { name: 'Sodio', code: '' }, { name: 'Potasio', code: '' }, { name: 'Cloro', code: '' }, { name: 'Bicarbonato', code: '' }, { name: 'Calcio total', code: '' }, { name: 'Calcio ionizado', code: '' }, { name: 'Fósforo', code: '' }, { name: 'Magnesio', code: '' }, { name: 'Albúmina', code: '' }, { name: 'Proteínas totales', code: '' }, { name: 'PTH intacta', code: '' }, { name: 'Glucemia', code: '' }, { name: 'HbA1c', code: '' }, { name: 'Perfil lipídico', code: '' }, { name: 'Colesterol total', code: '' }, { name: 'Triglicéridos', code: '' }, { name: 'Uroanálisis', code: '' }, { name: 'Sedimento urinario', code: '' }, { name: 'Relación proteína/creatinina', code: '' }, { name: 'Relación albúmina/creatinina', code: '' }, { name: 'Proteinuria 24 horas', code: '' }, { name: 'Microalbuminuria', code: '' }, { name: 'Sodio urinario', code: '' }, { name: 'Potasio urinario', code: '' }, { name: 'Calcio urinario 24 horas', code: '' }, { name: 'Gasometría arterial', code: '' }, { name: 'Ferritina', code: '' }, { name: 'Hierro sérico y saturación de transferrina', code: '' }, { name: 'Vitamina B12', code: '' }, { name: 'Ácido fólico', code: '' }, { name: 'Vitamina D', code: '' }, { name: 'TSH', code: '' }, { name: 'T4 libre', code: '' }, { name: 'Parcial de orina con cultivo', code: '' }, { name: 'Urocultivo', code: '' }, { name: 'ANCA', code: '' }, { name: 'ANA', code: '' }, { name: 'Complemento C3/C4', code: '' }, { name: 'Anti-DNA', code: '' }, { name: 'Electroforesis de proteínas', code: '' }, { name: 'Inmunofijación', code: '' }, { name: 'Serologías hepatitis B/C y VIH', code: '' }, { name: 'Tiempo de protrombina / INR', code: '' }, { name: 'Reticulocitos', code: '' }, { name: 'LDH', code: '' }, { name: 'Ácido úrico', code: '' }, { name: 'Amilasa y lipasa', code: '' }, { name: 'TGO / AST', code: '' }, { name: 'TGP / ALT', code: '' }, { name: 'Fosfatasa alcalina', code: '' }, { name: 'Bilirrubinas total y directa', code: '' }, { name: 'GGT', code: '' }, { name: 'PCR ultrasensible', code: '' }, { name: 'VSG', code: '' }, { name: 'Procalcitonina', code: '' }, { name: 'Troponina', code: '' }, { name: 'BNP / NT-proBNP', code: '' }, { name: 'Dímero D', code: '' }, { name: 'Perfil de coagulación', code: '' }, { name: 'Niveles de tacrolimus', code: '' }, { name: 'Niveles de ciclosporina', code: '' }, { name: 'Niveles de vancomicina', code: '' }, { name: 'Calprotectina fecal', code: '' }, { name: 'Sangre oculta en heces', code: '' }, { name: 'Hepatitis B: HBsAg y anti-HBs', code: '' }, { name: 'Hepatitis C: anti-HCV', code: '' }, { name: 'VIH', code: '' }, { name: 'Hemocultivos', code: '' }, { name: 'Cultivo de secreción', code: '' }, { name: 'Líquido pleural / ascítico', code: '' }, { name: 'Examen de líquido cefalorraquídeo', code: '' }, { name: 'Prueba de embarazo', code: '' }, { name: 'Electrolitos completos', code: '' }, { name: 'Perfil metabólico básico', code: '' }, { name: 'Perfil hepático', code: '' }, { name: 'Perfil tiroideo', code: '' }, { name: 'Paratohormona', code: '' }, { name: 'Cistatina C', code: '' }, { name: 'Clearance de creatinina', code: '' }, { name: 'Albúmina urinaria', code: '' }, { name: 'Creatinina urinaria', code: '' }, { name: 'Urea urinaria', code: '' }, { name: 'Osmolaridad urinaria', code: '' }, { name: 'Osmolaridad plasmática', code: '' }, { name: 'Fracción excretada de sodio', code: '' }, { name: 'Fracción excretada de urea', code: '' }, { name: 'Gasometría venosa', code: '' }, { name: 'Lactato', code: '' }, { name: 'Fibrinógeno', code: '' }, { name: 'Calcio corregido', code: '' }, { name: 'Vitamina B1', code: '' }, { name: 'Vitamina B6', code: '' }, { name: 'Zinc', code: '' }, { name: 'Cobre', code: '' }, { name: 'Electroforesis de hemoglobina', code: '' }, { name: 'Pruebas para mieloma múltiple', code: '' }, { name: 'Cortisol', code: '' }, { name: 'Aldosterona y renina', code: '' }, { name: 'Metanefrinas', code: '' }, { name: 'Catecolaminas', code: '' }, { name: 'Anticuerpos antifosfolípidos', code: '' }, { name: 'Anti-GBM', code: '' }, { name: 'Anti-PLA2R', code: '' }, { name: 'Crioglobulinas', code: '' }, { name: 'Complemento total CH50', code: '' }, { name: 'Inmunoglobulinas', code: '' }, { name: 'Tipificación sanguínea', code: '' }, { name: 'Prueba de compatibilidad', code: '' }, { name: 'Toma de muestra externa', code: '' }, { name: 'Otros laboratorios', code: '' },
];
const MEDICAL_ORDER_CATALOG: OrderItem[] = [
  { name: 'Primera vez por nefrología', code: '' }, { name: 'Primera vez por medicina interna', code: '' }, { name: 'Control por nefrología', code: '' }, { name: 'Control por medicina interna', code: '' }, { name: 'Control de resultados de laboratorios', code: '' }, { name: 'Control de presión arterial', code: '' }, { name: 'Interconsulta por nutrición', code: '' }, { name: 'Interconsulta por cardiología', code: '' }, { name: 'Interconsulta por endocrinología', code: '' }, { name: 'Remisión a urgencias', code: '' }, { name: 'Educación en enfermedad renal crónica', code: '' }, { name: 'Educación para terapia de reemplazo renal', code: '' },
];
const PARACLINIC_CATALOG: OrderItem[] = [
  { name: 'Ecografía renal', code: '' }, { name: 'Ecografía de vías urinarias', code: '' }, { name: 'Ecografía Doppler renal', code: '' }, { name: 'Ecografía abdominal total', code: '' }, { name: 'Ecografía hepatobiliar', code: '' }, { name: 'Radiografía de tórax', code: '' }, { name: 'Radiografía de abdomen', code: '' }, { name: 'Electrocardiograma', code: '' }, { name: 'Ecocardiograma transtorácico', code: '' }, { name: 'Holter de ritmo', code: '' }, { name: 'Holter de presión arterial', code: '' }, { name: 'Prueba de esfuerzo', code: '' }, { name: 'Biopsia renal', code: '' }, { name: 'Tomografía de abdomen', code: '' }, { name: 'Tomografía de tórax', code: '' }, { name: 'Urotomografía', code: '' }, { name: 'Resonancia magnética abdominal', code: '' }, { name: 'Angiorresonancia renal', code: '' }, { name: 'Densitometría ósea', code: '' }, { name: 'Fondo de ojo', code: '' }, { name: 'Endoscopia digestiva alta', code: '' }, { name: 'Colonoscopia', code: '' }, { name: 'Mamografía', code: '' }, { name: 'Citología cervicouterina', code: '' }, { name: 'Espirometría', code: '' }, { name: 'Gammagrafía renal', code: '' }, { name: 'PET-CT', code: '' }, { name: 'Cateterismo cardíaco', code: '' }, { name: 'Consulta por nefrología', code: '' }, { name: 'Consulta por cardiología', code: '' }, { name: 'Consulta por endocrinología', code: '' }, { name: 'Consulta por nutrición', code: '' }, { name: 'Terapia de reemplazo renal / educación', code: '' },
];
const RECIPE_KEY = 'nefrohc_recipes';
const NEPHROTOXIC_MEDICATIONS = ['ibuprofeno', 'naproxeno', 'diclofenaco', 'ketorolaco', 'aminoglucósidos', 'amfotericina', 'contraste yodado', 'ciclosporina', 'tacrolimus'];
const INTERACTION_RULES: Array<{ drugs: string[]; message: string }> = [
  { drugs: ['losartán', 'enalapril'], message: 'Evitar combinar IECA y ARA-II salvo indicación especializada; vigilar potasio y función renal.' },
  { drugs: ['enalapril', 'espironolactona'], message: 'Riesgo de hiperpotasemia y deterioro renal; verificar potasio y creatinina.' },
  { drugs: ['losartán', 'espironolactona'], message: 'Riesgo de hiperpotasemia; revisar función renal y potasio.' },
  { drugs: ['furosemida', 'hidroclorotiazida'], message: 'Vigilar volumen, presión arterial, sodio, potasio y función renal.' },
  { drugs: ['metformina', 'creatinina'], message: 'Confirmar TFG antes de mantener metformina; ajustar según función renal.' },
  { drugs: ['tacrolimus', 'ciclosporina'], message: 'No combinar inhibidores de calcineurina sin indicación especializada.' },
];
const DEFAULT_DOCTOR = { name: 'Dr. Hernando González Cortina', specialty: 'Medicina Interna — Nefrólogo', license: '01-6566-87', phone: '317 5153473', email: 'hergoncor@gmail.com', city: 'Bucaramanga', signatureDataUrl: '' };

const emptyMed = (): Medication => ({ code: '', id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, drug: '', dose: '', doseUnit: 'mg', quantity: '', route: 'VO', frequency: 'c/día', duration: '', notes: '', presentation: 'Tableta', maxDose: '', renalAdjustment: '', nephrotoxic: false, favorite: false });
function formatDose(med: Medication) { return med.dose ? (/[a-zA-Z]/.test(med.dose) ? med.dose : `${med.dose} ${med.doseUnit || 'mg'}`) : ''; }
function patientKey(data: HCFormData) { return (data.cc || data.nombre).trim().toLowerCase(); }
function readRecipes(): PrescriptionRecord[] { try { const value = JSON.parse(localStorage.getItem(RECIPE_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
function normalizeMedication(value: unknown): Medication {
  const item = value && typeof value === 'object' ? value as Partial<Medication> : {};
  return { id: String(item.id || `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`), drug: String(item.drug || ''), dose: String(item.dose || ''), doseUnit: String(item.doseUnit || 'mg'), quantity: String(item.quantity || ''), route: String(item.route || 'VO'), frequency: String(item.frequency || 'c/día'), duration: String(item.duration || ''), notes: String(item.notes || ''), code: String(item.code || ''), presentation: String(item.presentation || 'Tableta'), maxDose: String(item.maxDose || ''), renalAdjustment: String(item.renalAdjustment || ''), nephrotoxic: Boolean(item.nephrotoxic), favorite: Boolean(item.favorite) };
}
function normalizeOrders(value: unknown): OrderItem[] {
  if (Array.isArray(value)) return value.map((item) => { if (typeof item === 'string') return normalizeOrders(item)[0] || { name: item, code: '' }; const objectItem = item && typeof item === 'object' ? item as { name?: unknown; code?: unknown } : {}; return { name: String(objectItem.name || ''), code: String(objectItem.code || '') }; }).filter((item) => item.name);
  if (typeof value === 'string') return value.split(/\n|,/).map((entry) => { const text = entry.trim().replace(/\s+—\s+Fecha:\s+\d{4}-\d{2}-\d{2}\s*$/i, ''); const match = text.match(/^(.*?)\s*\[([^\]]+)\]\s*$/); return { name: (match ? match[1] : text).trim(), code: match ? match[2].trim() : '' }; }).filter((item) => item.name);
  return [];
}
function ordersText(items: OrderItem[]) { return items.map((item) => `${item.name}${item.code ? ` [${item.code}]` : ''}`).join('\n'); }
function fallbackCode(prefix: string, name: string) { return `${prefix}-${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)}`; }
function hydrateCatalog(items: OrderItem[], prefix: string) { return items.map((item) => ({ ...item, code: item.code || fallbackCode(prefix, item.name) })); }

export default function PrescriptionTab({ formData, updateField, medications, onMedicationsChange, onSaveAll, onNewHistory }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dx, setDx] = useState(formData.cie10 || '');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [paraclinicos, setParaclinicos] = useState<OrderItem[]>([]);
  const [laboratorios, setLaboratorios] = useState<OrderItem[]>([]);
  const [ordenesMedicas, setOrdenesMedicas] = useState<OrderItem[]>([]);
  const [labQuery, setLabQuery] = useState('');
  const [paraclinicQuery, setParaclinicQuery] = useState('');
  const [medicalOrderQuery, setMedicalOrderQuery] = useState('');
  const [recetaFecha, setRecetaFecha] = useState(formData.fecha || new Date().toISOString().split('T')[0]);
  const [doctor, setDoctor] = useState(DEFAULT_DOCTOR);
  const [recipes, setRecipes] = useState<PrescriptionRecord[]>([]);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [printing, setPrinting] = useState(false);
  const [labCatalog, setLabCatalog] = useState<OrderItem[]>(hydrateCatalog(LAB_CATALOG, 'LAB'));
  const [paraclinicCatalog, setParaclinicCatalog] = useState<OrderItem[]>(hydrateCatalog(PARACLINIC_CATALOG, 'IMG'));
  const [medicationCatalog, setMedicationCatalog] = useState<CatalogItem[]>(hydrateCatalog(MEDICATION_CATALOG, 'MED'));
  const [medicalOrderCatalog, setMedicalOrderCatalog] = useState<OrderItem[]>(hydrateCatalog(MEDICAL_ORDER_CATALOG, 'ORD'));

  useEffect(() => {
    try {
      const labs = JSON.parse(localStorage.getItem('nefrohc_catalog_laboratories') || 'null');
      const paras = JSON.parse(localStorage.getItem('nefrohc_catalog_paraclinics') || 'null');
      const meds = JSON.parse(localStorage.getItem('nefrohc_catalog_medications') || 'null');
      const orders = JSON.parse(localStorage.getItem('nefrohc_catalog_medical_orders') || 'null');
      if (Array.isArray(labs) && labs.length) setLabCatalog(labs);
      if (Array.isArray(paras) && paras.length) setParaclinicCatalog(paras);
      if (Array.isArray(orders) && orders.length) setMedicalOrderCatalog(orders.map((item) => ({ name: String(item.name || ''), code: String(item.code || '') })).filter((item) => item.name));
      if (Array.isArray(meds) && meds.length) setMedicationCatalog(meds.map((item) => typeof item === 'string' ? { name: item, code: '' } : { name: String(item.name || ''), code: String(item.code || '') }).filter((item) => item.name));
    } catch { /* usar catálogo integrado */ }
  }, []);

  useEffect(() => {
    // Al abrir una historia desde Pacientes, reconstruye la receta y las órdenes
    // guardadas dentro del registro principal. Así ningún módulo queda aislado.
    setDx(formData.cie10 || '');
    setAdditionalNotes(formData.additional_notes || '');
    setParaclinicos(normalizeOrders(formData.prescription_paraclinicos));
    setLaboratorios(normalizeOrders(formData.prescription_laboratorios));
    setOrdenesMedicas(normalizeOrders(formData.prescription_ordenes_medicas));
    setRecetaFecha(formData.fecha || new Date().toISOString().split('T')[0]);
  }, [formData.history_id, formData.prescription_id]);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const storedDoctor = localStorage.getItem('nefrohc_doctor_settings');
        if (storedDoctor) {
          const parsed = JSON.parse(storedDoctor);
          if (parsed.email === 'hergoncor@gmail.com') parsed.email = DEFAULT_DOCTOR.email;
          setDoctor({ ...DEFAULT_DOCTOR, ...parsed });
        }
        const all = readRecipes();
        const currentKey = patientKey(formData);
        const belongsToPatient = (recipe: PrescriptionRecord) => (formData.history_id && recipe.historyId === formData.history_id) || recipe.patientKey === currentKey;
        setRecipes(all.filter(belongsToPatient));
        try {
          const stored = await invoke<string[]>('load_prescriptions_json');
          const sqliteRecipes = stored.map((item) => JSON.parse(item) as PrescriptionRecord);
          const merged = Array.from(new Map([...all, ...sqliteRecipes].map((recipe) => [recipe.id, recipe])).values());
          setRecipes(merged.filter(belongsToPatient));
        } catch { /* navegador o primera ejecución */ }
      } catch { /* defaults */ }
    };
    void loadRecipes();
  }, [formData.cc, formData.nombre]);

  const knownMedications = useMemo(() => Array.from(new Set([...medicationCatalog.map((item) => item.name), ...recipes.flatMap((recipe) => (recipe.medications || []).map((med) => med.drug).filter(Boolean))])), [recipes, medicationCatalog]);
  const medicationNames = medications.map((med) => med.drug.trim().toLowerCase()).filter(Boolean);
  const interactionAlerts = INTERACTION_RULES.filter((rule) => rule.drugs.every((drug) => medicationNames.some((name) => name.includes(drug))));
  const allergyAlerts = formData.allergies.trim() && formData.allergies.toLowerCase() !== 'niega' ? medications.filter((med) => med.drug && formData.allergies.toLowerCase().includes(med.drug.toLowerCase())).map((med) => `El medicamento ${med.drug} coincide con el texto registrado en alergias.`) : [];
  const nephrotoxicAlerts = medications.filter((med) => med.nephrotoxic || NEPHROTOXIC_MEDICATIONS.some((name) => med.drug.toLowerCase().includes(name))).map((med) => `Revisar nefrotoxicidad y necesidad de ajuste para ${med.drug}.`);
  const addMed = () => { const med = emptyMed(); onMedicationsChange([...medications, med]); setExpanded(med.id); };
  const removeMed = (id: string) => { onMedicationsChange(medications.filter((med) => med.id !== id)); if (expanded === id) setExpanded(null); };
  const updateMed = useCallback((id: string, field: keyof Medication, value: string | boolean) => onMedicationsChange(medications.map((med) => med.id === id ? { ...med, [field]: value } : med)), [medications, onMedicationsChange]);
  const updateMedicationName = (id: string, value: string) => {
    const catalogItem = medicationCatalog.find((item) => item.name.toLowerCase() === value.trim().toLowerCase());
    onMedicationsChange(medications.map((med) => med.id === id ? { ...med, drug: value, ...(catalogItem ? { code: catalogItem.code } : {}) } : med));
  };

  const newRecipe = () => {
    setActiveRecipeId(null); updateField('prescription_id', ''); updateField('prescription_ordenes_medicas', ''); updateField('prescription_paraclinicos', ''); updateField('prescription_laboratorios', ''); updateField('additional_notes', ''); setDx(formData.cie10 || ''); setAdditionalNotes(''); setParaclinicos([]); setLaboratorios([]); setOrdenesMedicas([]); setLabQuery(''); setParaclinicQuery(''); setMedicalOrderQuery(''); setRecetaFecha(new Date().toISOString().split('T')[0]); onMedicationsChange([]); toast.info('Nueva orden médica lista para diligenciar');
  };
  const saveRecipe = async () => {
    if (!formData.nombre.trim()) { toast.error('Primero indique el nombre del paciente en la historia'); return; }
    const historyId = formData.history_id || `hc-${Date.now()}`;
    const record: PrescriptionRecord = { id: activeRecipeId || `rx-${Date.now()}`, historyId, patientKey: patientKey(formData), patientName: formData.nombre, cc: formData.cc, date: recetaFecha, dx, medications: medications.filter((med) => med.drug.trim()).map(normalizeMedication), additionalNotes, paraclinicos, laboratorios, ordenesMedicas, createdAt: new Date().toISOString() };
    // La fuente de guardado es la historia clínica; la pestaña de receta solo prepara el paquete.
    updateField('history_id', historyId); updateField('prescription_id', record.id); updateField('cie10', dx); updateField('additional_notes', additionalNotes); updateField('prescription_ordenes_medicas', ordersText(ordenesMedicas)); updateField('prescription_paraclinicos', ordersText(paraclinicos)); updateField('prescription_laboratorios', ordersText(laboratorios));
    await onSaveAll({ history_id: historyId, prescription_id: record.id, fecha: recetaFecha, cie10: dx, additional_notes: additionalNotes, medications: record.medications, prescription_ordenes_medicas: ordersText(ordenesMedicas), prescription_paraclinicos: ordersText(paraclinicos), prescription_laboratorios: ordersText(laboratorios) });
    // También conservamos cada receta independiente para poder consultarla,
    // copiarla y editarla sin convertirla en el registro principal del sistema.
    const savedRecipes = readRecipes();
    localStorage.setItem(RECIPE_KEY, JSON.stringify([record, ...savedRecipes.filter((item) => item.id !== record.id)]));
    try { await invoke('save_prescription_json', { payload: JSON.stringify(record) }); } catch { /* la copia local es suficiente en vista web */ }
    setRecipes([record, ...savedRecipes.filter((item) => item.id !== record.id && item.patientKey === patientKey(formData))]); setActiveRecipeId(record.id); window.dispatchEvent(new Event('nefrohc:data-updated'));
    toast.success('Historia y órdenes médicas guardadas en Pacientes');
  };
  const loadRecipe = (recipe: PrescriptionRecord) => { const loadedPara = normalizeOrders(recipe.paraclinicos); const loadedLabs = normalizeOrders(recipe.laboratorios); const loadedOrders = normalizeOrders(recipe.ordenesMedicas); setActiveRecipeId(recipe.id); setDx(recipe.dx); setAdditionalNotes(recipe.additionalNotes); setParaclinicos(loadedPara); setLaboratorios(loadedLabs); setOrdenesMedicas(loadedOrders); setRecetaFecha(recipe.date); onMedicationsChange((recipe.medications || []).map(normalizeMedication)); updateField('prescription_id', recipe.id); updateField('prescription_ordenes_medicas', ordersText(loadedOrders)); updateField('prescription_paraclinicos', ordersText(loadedPara)); updateField('prescription_laboratorios', ordersText(loadedLabs)); updateField('additional_notes', recipe.additionalNotes); };
  const copyActiveRecipe = () => { const recipe = recipes.find((item) => item.id === activeRecipeId); if (!recipe) return; const loadedPara = normalizeOrders(recipe.paraclinicos); const loadedLabs = normalizeOrders(recipe.laboratorios); const loadedOrders = normalizeOrders(recipe.ordenesMedicas); setActiveRecipeId(null); setDx(recipe.dx); setAdditionalNotes(recipe.additionalNotes); setParaclinicos(loadedPara); setLaboratorios(loadedLabs); setOrdenesMedicas(loadedOrders); setRecetaFecha(new Date().toISOString().split('T')[0]); onMedicationsChange((recipe.medications || []).map((med) => ({ ...emptyMed(), ...normalizeMedication(med), id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }))); updateField('prescription_id', ''); updateField('prescription_ordenes_medicas', ordersText(loadedOrders)); updateField('prescription_paraclinicos', ordersText(loadedPara)); updateField('prescription_laboratorios', ordersText(loadedLabs)); toast.info('Copia lista como una receta nueva'); };
  const addLab = () => { const query = labQuery.trim(); if (!query) return; const catalogItem = labCatalog.find((entry) => entry.name.toLowerCase() === query.toLowerCase() || entry.code.toLowerCase() === query.toLowerCase()); const item = catalogItem || { name: query, code: fallbackCode('LAB', query) }; if (laboratorios.some((entry) => entry.name.toLowerCase() === item.name.toLowerCase())) return; const next = [...laboratorios, item]; setLaboratorios(next); updateField('prescription_laboratorios', ordersText(next)); setLabQuery(''); };
  const addParaclinic = () => { const query = paraclinicQuery.trim(); if (!query) return; const catalogItem = paraclinicCatalog.find((entry) => entry.name.toLowerCase() === query.toLowerCase() || entry.code.toLowerCase() === query.toLowerCase()); const item = catalogItem || { name: query, code: fallbackCode('IMG', query) }; if (paraclinicos.some((entry) => entry.name.toLowerCase() === item.name.toLowerCase())) return; const next = [...paraclinicos, item]; setParaclinicos(next); updateField('prescription_paraclinicos', ordersText(next)); setParaclinicQuery(''); };
  const removeLab = (name: string) => { const next = laboratorios.filter((item) => item.name !== name); setLaboratorios(next); updateField('prescription_laboratorios', ordersText(next)); };
  const removeParaclinic = (name: string) => { const next = paraclinicos.filter((item) => item.name !== name); setParaclinicos(next); updateField('prescription_paraclinicos', ordersText(next)); };
  const addMedicalOrder = () => { const query = medicalOrderQuery.trim(); if (!query) return; const item = medicalOrderCatalog.find((entry) => entry.name.toLowerCase() === query.toLowerCase() || entry.code.toLowerCase() === query.toLowerCase()) || { name: query, code: fallbackCode('ORD', query) }; if (ordenesMedicas.some((entry) => entry.name.toLowerCase() === item.name.toLowerCase())) return; const next = [...ordenesMedicas, item]; setOrdenesMedicas(next); updateField('prescription_ordenes_medicas', ordersText(next)); setMedicalOrderQuery(''); };
  const removeMedicalOrder = (name: string) => { const next = ordenesMedicas.filter((item) => item.name !== name); setOrdenesMedicas(next); updateField('prescription_ordenes_medicas', ordersText(next)); };
  const updateOrderCode = (kind: 'lab' | 'para' | 'medical', name: string, code: string) => { if (kind === 'lab') { const next = laboratorios.map((item) => item.name === name ? { ...item, code } : item); setLaboratorios(next); updateField('prescription_laboratorios', ordersText(next)); } else if (kind === 'para') { const next = paraclinicos.map((item) => item.name === name ? { ...item, code } : item); setParaclinicos(next); updateField('prescription_paraclinicos', ordersText(next)); } else { const next = ordenesMedicas.map((item) => item.name === name ? { ...item, code } : item); setOrdenesMedicas(next); updateField('prescription_ordenes_medicas', ordersText(next)); } };
  const print = () => { setPrinting(true); applyPrintSettings(); printElements('Orden médica', ['#prescription-print-area']); window.setTimeout(() => setPrinting(false), 700); };
  const visibleRecipes = recipes.filter((recipe) => `${recipe.date} ${recipe.dx}`.toLowerCase().includes(recipeSearch.toLowerCase()));

  return <div className="space-y-4">
    {printing && <div className="print-loading-overlay no-print"><div className="print-loading-card"><Loader2 className="animate-spin text-accent" size={24} /><span>Preparando receta...</span></div></div>}

    <div className="bg-card rounded-xl border border-border shadow-card p-4 no-print">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Pill size={18} className="text-accent" /><h4 className="text-sm font-extrabold text-primary uppercase tracking-wide">Órdenes médicas vinculadas a la historia clínica</h4></div><p className="text-xs text-muted-foreground mt-1">El registro principal se guarda en Pacientes. Aquí se preparan, consultan e imprimen las órdenes médicas asociadas.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={onNewHistory} className="flex items-center gap-1.5 px-3 py-2 border border-border text-foreground rounded-lg text-xs font-bold hover:bg-muted">Nueva historia</button><button type="button" onClick={newRecipe} className="flex items-center gap-1.5 px-3 py-2 border border-border text-foreground rounded-lg text-xs font-bold hover:bg-muted"><Plus size={14} /> Limpiar orden médica</button>{activeRecipeId && <button type="button" onClick={copyActiveRecipe} className="flex items-center gap-1.5 px-3 py-2 border border-border text-foreground rounded-lg text-xs font-bold hover:bg-muted">Copiar orden médica</button>}<button type="button" onClick={saveRecipe} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-accent"><Save size={14} /> Guardar orden médica</button></div></div>
    </div>

    <div className="bg-card rounded-xl border border-border shadow-card p-4 no-print">
      <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Pill size={17} className="text-accent" /><h4 className="text-sm font-extrabold text-primary uppercase tracking-wide">Orden médica: medicamentos, laboratorios y paraclínicos</h4></div><span className="text-xs text-muted-foreground">Todo se guarda junto con la historia</span></div>
      {(interactionAlerts.length > 0 || allergyAlerts.length > 0 || nephrotoxicAlerts.length > 0) && <div className="mb-4 rounded-lg border border-warning/40 bg-warning-bg p-3 text-xs text-foreground"><div className="flex items-center gap-2 font-bold text-warning mb-1"><AlertTriangle size={15} /> Alertas de seguridad para revisar</div>{interactionAlerts.map((alert) => <p key={alert.message}>• {alert.message}</p>)}{allergyAlerts.map((alert) => <p key={alert}>• {alert}</p>)}{nephrotoxicAlerts.map((alert) => <p key={alert}>• {alert}</p>)}</div>}
      <div className="space-y-2">{medications.map((med, index) => <div key={med.id} className="border border-border rounded-lg overflow-hidden"><div className="flex items-center justify-between px-3 py-2 bg-muted cursor-pointer" onClick={() => setExpanded(expanded === med.id ? null : med.id)}><div className="flex items-center gap-2"><span className="w-6 h-6 bg-slate-700 text-white rounded-full text-xs font-bold flex items-center justify-center">{index + 1}</span><div><p className="text-sm font-bold text-foreground">{med.drug || <span className="italic text-muted-foreground">Sin medicamento</span>} {med.dose && <span className="text-accent">{formatDose(med)}</span>}</p><p className="text-xs text-muted-foreground">{med.route} · {med.frequency}{med.duration ? ` · ${med.duration}` : ''}</p></div></div><button type="button" onClick={(e) => { e.stopPropagation(); removeMed(med.id); }} className="p-1.5 text-danger hover:bg-danger-bg rounded-lg"><Trash2 size={14} /></button></div>{expanded === med.id && <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-card"><div className="col-span-2"><label className="field-label">Medicamento / principio activo *</label><input list="medication-catalog" value={med.drug} onChange={(e) => updateMedicationName(med.id, e.target.value)} placeholder="Buscar medicamento" className="field-input" /></div><div><label className="field-label">Código institucional</label><input value={med.code || ''} onChange={(e) => updateMed(med.id, 'code', e.target.value)} placeholder="Por confirmar" className="field-input" /></div><div><label className="field-label">Presentación</label><input list="presentation-catalog" value={med.presentation || ''} onChange={(e) => updateMed(med.id, 'presentation', e.target.value)} placeholder="Tableta, cápsula..." className="field-input" /></div><div><label className="field-label">Dosis</label><div className="flex"><input type="number" min="0" step="any" value={med.dose} onChange={(e) => updateMed(med.id, 'dose', e.target.value)} placeholder="100" className="field-input rounded-r-none border-r-0" /><select value={med.doseUnit || 'mg'} onChange={(e) => updateMed(med.id, 'doseUnit', e.target.value)} className="w-20 field-input rounded-l-none bg-muted"><option>mg</option><option>g</option><option>mcg</option><option>UI</option><option>mL</option></select></div></div><div><label className="field-label">Cantidad</label><input value={med.quantity} onChange={(e) => updateMed(med.id, 'quantity', e.target.value)} placeholder="30 tabletas" className="field-input" /></div><div><label className="field-label">Vía</label><select value={med.route} onChange={(e) => updateMed(med.id, 'route', e.target.value)} className="field-input">{ROUTES.map((route) => <option key={route}>{route}</option>)}</select></div><div><label className="field-label">Frecuencia</label><select value={med.frequency} onChange={(e) => updateMed(med.id, 'frequency', e.target.value)} className="field-input">{FREQUENCIES.map((frequency) => <option key={frequency}>{frequency}</option>)}</select></div><div><label className="field-label">Duración</label><input value={med.duration} onChange={(e) => updateMed(med.id, 'duration', e.target.value)} placeholder="30 días" className="field-input" /></div><div className="col-span-2"><label className="field-label">Indicaciones del medicamento</label><input value={med.notes} onChange={(e) => updateMed(med.id, 'notes', e.target.value)} placeholder="Tomar con alimentos..." className="field-input" /></div><div><label className="field-label">Dosis máxima</label><input value={med.maxDose || ''} onChange={(e) => updateMed(med.id, 'maxDose', e.target.value)} placeholder="Según ficha técnica" className="field-input" /></div><div className="col-span-2"><label className="field-label">Ajuste por TFG</label><input value={med.renalAdjustment || ''} onChange={(e) => updateMed(med.id, 'renalAdjustment', e.target.value)} placeholder="Anote el ajuste indicado para este paciente" className="field-input" /></div><label className="flex items-center gap-2 text-xs font-bold text-foreground"><input type="checkbox" checked={Boolean(med.nephrotoxic)} onChange={(e) => updateMed(med.id, 'nephrotoxic', e.target.checked)} /> Revisar nefrotoxicidad</label><label className="flex items-center gap-2 text-xs font-bold text-foreground"><input type="checkbox" checked={Boolean(med.favorite)} onChange={(e) => updateMed(med.id, 'favorite', e.target.checked)} /> Medicamento favorito</label></div>}</div>)}</div>
      <button type="button" onClick={addMed} className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-accent/60 text-accent rounded-lg text-sm font-bold hover:bg-info-bg"><Plus size={16} /> Añadir otro medicamento</button>
      <datalist id="medication-catalog">{knownMedications.map((med) => <option key={med} value={med} />)}</datalist><datalist id="presentation-catalog"><option value="Tableta" /><option value="Cápsula" /><option value="Solución oral" /><option value="Ampolla" /><option value="Frasco" /><option value="Crema" /><option value="Inhalador" /></datalist>
      <div className="mt-6 border-t border-border pt-5">
      <h4 className="text-sm font-extrabold text-primary uppercase tracking-wide mb-3">Solicitudes médicas unificadas</h4>
      <p className="text-xs text-muted-foreground mb-3">Laboratorios y paraclínicos se realizan externamente: aquí solo se registra la solicitud, nombre, código institucional, indicaciones e impresión. Los códigos del catálogo pueden editarse desde Configuración.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="field-label">Laboratorios</label>
          <div className="flex gap-2"><input list="lab-catalog" value={labQuery} onChange={(e) => setLabQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLab(); } }} placeholder="Escriba o busque un laboratorio" className="field-input" /><button type="button" onClick={addLab} className="px-3 rounded-lg bg-primary text-white text-lg font-bold" title="Agregar laboratorio">+</button></div><datalist id="lab-catalog">{labCatalog.map((item) => <option key={item.name} value={item.name} label={item.code || 'Código por configurar'} />)}</datalist>
          <div className="order-list">{laboratorios.map((item) => <div key={item.name} className="order-chip"><span><strong>{item.name}</strong><small>Código</small></span><input value={item.code} onChange={(e) => updateOrderCode('lab', item.name, e.target.value)} placeholder="Código por configurar" className="order-code-input" /><button type="button" onClick={() => removeLab(item.name)} aria-label="Quitar laboratorio">×</button></div>)}</div>
        </div>
        <div>
          <label className="field-label">Paraclínicos e imágenes</label>
          <div className="flex gap-2"><input list="paraclinic-catalog" value={paraclinicQuery} onChange={(e) => setParaclinicQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addParaclinic(); } }} placeholder="Escriba o busque un paraclínico" className="field-input" /><button type="button" onClick={addParaclinic} className="px-3 rounded-lg bg-primary text-white text-lg font-bold" title="Agregar paraclínico">+</button></div><datalist id="paraclinic-catalog">{paraclinicCatalog.map((item) => <option key={item.name} value={item.name} label={item.code || 'Código por configurar'} />)}</datalist>
          <div className="order-list">{paraclinicos.map((item) => <div key={item.name} className="order-chip"><span><strong>{item.name}</strong><small>Código</small></span><input value={item.code} onChange={(e) => updateOrderCode('para', item.name, e.target.value)} placeholder="Código por configurar" className="order-code-input" /><button type="button" onClick={() => removeParaclinic(item.name)} aria-label="Quitar paraclínico">×</button></div>)}</div>
        </div>
      </div>
      <div className="mt-5 border-t border-border pt-4"><label className="field-label">Órdenes médicas: controles, interconsultas y remisiones</label><div className="flex gap-2"><input list="medical-order-catalog" value={medicalOrderQuery} onChange={(e) => setMedicalOrderQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMedicalOrder(); } }} placeholder="Escriba o busque una orden médica" className="field-input" /><button type="button" onClick={addMedicalOrder} className="px-3 rounded-lg bg-primary text-white text-lg font-bold" title="Agregar orden médica">+</button></div><datalist id="medical-order-catalog">{medicalOrderCatalog.map((item) => <option key={item.name} value={item.name} />)}</datalist><div className="order-list">{ordenesMedicas.map((item) => <div key={item.name} className="order-chip"><span><strong>{item.name}</strong><small>Código institucional</small></span><input value={item.code} onChange={(e) => updateOrderCode('medical', item.name, e.target.value)} placeholder="Código por configurar" className="order-code-input" /><button type="button" onClick={() => removeMedicalOrder(item.name)} aria-label="Quitar orden médica">×</button></div>)}</div></div>
      <div className="mt-3"><label className="field-label">Indicaciones adicionales</label><textarea value={additionalNotes} onChange={(e) => { setAdditionalNotes(e.target.value); updateField('additional_notes', e.target.value); }} rows={3} placeholder="Escriba aquí las indicaciones para el paciente..." className="field-input resize-none" /></div>
      </div>
    </div>

    <div className="prescription-paper bg-white rounded-xl border border-slate-200 p-5 max-w-4xl print-prescription text-slate-900" id="prescription-print-area">
      <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-3"><div className="flex items-center gap-3"><img src={doctor.signatureDataUrl || '/assets/kidney-stethoscope-logo.svg'} alt="Identificación del médico" className="w-12 h-12 rounded-lg object-contain bg-slate-800 p-1" /><div><p className="font-extrabold text-slate-800 text-sm">{doctor.name}</p><p className="text-xs text-slate-500">{doctor.specialty} · RM: {doctor.license}</p><p className="text-xs text-slate-500">Cel: {doctor.phone} · {doctor.email} · {doctor.city}</p></div></div><div className="text-right"><strong className="text-[10px] text-slate-800">{recetaFecha}</strong><p className="text-[9px] text-slate-500">Orden No. {activeRecipeId ? activeRecipeId.replace('rx-', '') : 'Nueva'}</p><QrAttention data={{ patient: formData.nombre, document: formData.cc, date: recetaFecha, diagnosis: dx, summary: additionalNotes, medications: medications.filter((med) => med.drug).map((med) => `${med.drug} · ${formatDose(med)} · ${med.frequency}`), laboratories: laboratorios.map((item) => item.name), paraclinics: paraclinicos.map((item) => item.name), orders: ordenesMedicas.map((item) => item.name) }} label="Escanear" /></div></div>
      <div className="prescription-section-title">FÓRMULA MÉDICA / ORDEN AL PACIENTE</div>
      <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]"><div><b className="text-slate-500 uppercase text-[8px]">Paciente</b><p>{formData.nombre || '—'}</p></div><div><b className="text-slate-500 uppercase text-[8px]">Documento / edad</b><p>{formData.cc || '—'} {formData.edad ? `/ ${formData.edad} años` : ''}</p></div><div><b className="text-slate-500 uppercase text-[8px]">Diagnóstico</b><input value={dx} onChange={(e) => setDx(e.target.value)} placeholder="CIE-10" className="w-full border-b border-slate-300 text-[10px] bg-white text-slate-900" /></div></div>
      <section className="mb-3"><h4 className="recipe-print-heading">Medicamentos prescritos</h4>{medications.length ? <table className="clinical-print-table"><thead><tr><th>#</th><th>Medicamento</th><th>Código</th><th>Presentación</th><th>Dosis</th><th>Vía y frecuencia</th><th>Duración</th><th>Cantidad</th><th>Indicaciones</th></tr></thead><tbody>{medications.map((med, index) => <tr key={med.id}><td>{index + 1}</td><td>{med.drug || '—'}</td><td>{med.code || 'Código por configurar'}</td><td>{med.presentation || '—'}</td><td>{formatDose(med) || '—'}</td><td>{med.route} · {med.frequency}</td><td>{med.duration || '—'}</td><td>{med.quantity || '—'}</td><td>{med.notes || '—'}</td></tr>)}</tbody></table> : <p className="recipe-empty">No se han agregado medicamentos.</p>}</section>
      <div className="grid grid-cols-2 gap-3"><section><h4 className="recipe-print-heading">Laboratorios solicitados</h4><div className="recipe-print-text">{laboratorios.length ? laboratorios.map((item) => <div key={item.name}><strong>{item.name}</strong> <span>({item.code || 'Código por configurar'})</span></div>) : '—'}</div></section><section><h4 className="recipe-print-heading">Paraclínicos solicitados</h4><div className="recipe-print-text">{paraclinicos.length ? paraclinicos.map((item) => <div key={item.name}><strong>{item.name}</strong> <span>({item.code || 'Código por configurar'})</span></div>) : '—'}</div></section></div><section className="mt-3"><h4 className="recipe-print-heading">Órdenes médicas</h4><div className="recipe-print-text">{ordenesMedicas.length ? ordenesMedicas.map((item) => <div key={item.name}><strong>{item.name}</strong> <span>({item.code || 'Código por configurar'})</span></div>) : '—'}</div></section><section className="mt-3"><h4 className="recipe-print-heading">Indicaciones adicionales</h4><p className="recipe-print-text">{additionalNotes || '—'}</p></section>
      <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-3"><p className="text-[8px] text-slate-500">Documento informativo · {doctor.city}</p><div className="text-center">{doctor.signatureDataUrl ? <img src={doctor.signatureDataUrl} alt="Firma" className="w-40 h-10 object-contain mx-auto" /> : <div className="w-40 h-8 border-b border-slate-700" />}<p className="text-[9px] font-bold text-slate-800">{doctor.name}</p><p className="text-[8px] text-slate-500">RM: {doctor.license}</p></div></div>
      <div className="mt-4 flex justify-end gap-2 no-print"><button type="button" onClick={print} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-800"><Printer size={14} /> Imprimir órdenes médicas</button><button type="button" onClick={print} className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100"><FileDown size={14} /> Guardar PDF</button></div>
    </div>
  </div>;
}
