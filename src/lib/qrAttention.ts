export interface QrAttentionData { patient:string; document:string; date:string; diagnosis?:string; summary?:string; medications?:string[]; laboratories?:string[]; paraclinics?:string[]; orders?:string[]; }

function escapeHtml(value:string){const entities:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};return String(value||'').replace(/[&<>"']/g,(character)=>entities[character]||character);}
function clipped(value:string|undefined,max:number,fallback='No registrado'){const text=String(value||'').trim();return escapeHtml(text ? text.slice(0,max) : fallback);}
function shortList(items:string[]=[]){return items.slice(0,2).map((item)=>`<li>${clipped(item,40)}</li>`).join('')||'<li>No registrado</li>';}
function attentionHtml(data:QrAttentionData){
  // QR compacto para mantenerse dentro de la capacidad de lectura de teléfonos.
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Resumen NefroHC</title></head><body><h1>Resumen básico de atención</h1><p><b>Dr. Hernando González Cortina</b><br>Medicina Interna - Nefrólogo · Bucaramanga</p><p><b>Paciente:</b> ${clipped(data.patient,60)}<br><b>Documento:</b> ${clipped(data.document,24)}<br><b>Fecha:</b> ${clipped(data.date,20)}<br><b>Diagnóstico:</b> ${clipped(data.diagnosis,70)}</p><h2>Resumen</h2><p>${clipped(data.summary,120,'Consulte la historia clínica con el profesional tratante.')}</p><h2>Medicamentos</h2><ul>${shortList(data.medications)}</ul><h2>Laboratorios</h2><ul>${shortList(data.laboratories)}</ul><h2>Paraclínicos</h2><ul>${shortList(data.paraclinics)}</ul><h2>Órdenes</h2><ul>${shortList(data.orders)}</ul><p>Información generada localmente. No reemplaza la historia clínica ni las indicaciones médicas.</p></body></html>`;
}
export async function createAttentionQr(data:QrAttentionData){
  const module=await import('qrcode');
  const html=attentionHtml(data);
  const payload=`data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`;
  return module.toDataURL(payload,{width:256,margin:2,errorCorrectionLevel:'M'});
}
