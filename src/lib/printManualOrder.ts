import { printDocument } from './printDocument';
import { createAttentionQr } from './qrAttention';
import { getDoctorPrintSettings } from './doctorPrintSettings';
export interface ManualMedicationForPrint { name:string; presentation:string; dose:string; route:string; frequency:string; duration:string; quantity:string; instructions:string; }
export interface ManualOrderForPrint { patientName:string; document:string; encounterDate:string; orderDate:string; diagnosis:string; status:string; medications:ManualMedicationForPrint[]; laboratories:string; paraclinics:string; medicalOrders:string; notes:string; }
function esc(value:unknown){const map:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};return String(value??'').replace(/[&<>"']/g,(char)=>map[char]||char);}
function lines(value:string){return value.split(/\n/).map((line)=>line.trim()).filter(Boolean);}
export async function printManualOrder(order:ManualOrderForPrint){
 const meds=order.medications.filter((item)=>item.name.trim());
 const doctor=getDoctorPrintSettings();
 let qr='';
 try{qr=await createAttentionQr({patient:order.patientName,document:order.document,date:order.orderDate,diagnosis:order.diagnosis,summary:order.notes,medications:meds.map((m)=>`${m.name} · ${m.presentation} · ${m.dose} · ${m.frequency}`),laboratories:lines(order.laboratories),paraclinics:lines(order.paraclinics),orders:lines(order.medicalOrders)});}catch{/* El impreso completo funciona aunque el dispositivo no genere el QR. */}
 const header=(title:string)=>`<header class="clinical-print-letterhead"><img src="/assets/kidney-stethoscope-logo.svg" alt="NefroHC"><div><h1>${esc(doctor.name)}</h1><p>${esc(doctor.specialty)} · RM: ${esc(doctor.license)}</p><p>Cel: ${esc(doctor.phone)} · ${esc(doctor.city)}</p></div><div class="clinical-print-meta"><div class="clinical-print-title-row"><strong>${esc(title.toUpperCase())}</strong>${qr?`<img class="manual-order-qr" src="${qr}" alt="QR resumen"/>`:''}</div><span>${esc(order.patientName)}</span><span>CC ${esc(order.document)} · ${esc(order.orderDate)}</span><span>Estado: ${esc(order.status)}</span></div></header>`;
 const list=(items:string[])=>`<ul class="orders-print-list">${items.map((item)=>`<li>${esc(item)}</li>`).join('')}</ul>`;
 const footer=`<footer class="clinical-print-signature">${doctor.signatureDataUrl?`<img src="${esc(doctor.signatureDataUrl)}" alt="Firma de ${esc(doctor.name)}">`:'<div class="signature-line"></div>'}<strong>${esc(doctor.name)}</strong><span>${esc(doctor.specialty)} · RM: ${esc(doctor.license)}</span></footer>`;
 const pages:string[]=[];
 if(meds.length)pages.push(`<section class="manual-print-sheet">${header('Medicamentos')}<div class="manual-print-body"><h2>Fórmula médica</h2><table class="clinical-print-table"><thead><tr><th>Medicamento</th><th>Presentación</th><th>Dosis</th><th>Vía</th><th>Frecuencia</th><th>Duración</th><th>Cantidad</th><th>Indicaciones</th></tr></thead><tbody>${meds.map((m)=>`<tr><td>${esc(m.name)}</td><td>${esc(m.presentation)}</td><td>${esc(m.dose)}</td><td>${esc(m.route)}</td><td>${esc(m.frequency)}</td><td>${esc(m.duration)}</td><td>${esc(m.quantity)}</td><td>${esc(m.instructions)}</td></tr>`).join('')}</tbody></table></div>${footer}</section>`);
 if(order.laboratories.trim())pages.push(`<section class="manual-print-sheet">${header('Laboratorios externos')}<div class="manual-print-body"><h2>Laboratorios externos solicitados</h2>${list(lines(order.laboratories))}</div>${footer}</section>`);
 if(order.paraclinics.trim())pages.push(`<section class="manual-print-sheet">${header('Paraclínicos')}<div class="manual-print-body"><h2>Paraclínicos y exámenes solicitados</h2>${list(lines(order.paraclinics))}</div>${footer}</section>`);
 if(order.medicalOrders.trim())pages.push(`<section class="manual-print-sheet">${header('Órdenes médicas')}<div class="manual-print-body"><h2>Otras órdenes médicas</h2>${list(lines(order.medicalOrders))}</div>${footer}</section>`);
 if(order.notes.trim())pages.push(`<section class="manual-print-sheet">${header('Indicaciones')}<div class="manual-print-body"><h2>Indicaciones adicionales</h2><p class="clinical-print-paragraph">${esc(order.notes)}</p></div>${footer}</section>`);
 if(!pages.length) return;
 printDocument('Orden médica',pages.join(''));
}
