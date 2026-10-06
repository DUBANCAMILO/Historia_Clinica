import { applyPrintSettings } from './printSettings';

function waitForImages(root:ParentNode){const images=Array.from(root.querySelectorAll('img'));return Promise.all(images.map((image)=>new Promise<void>((resolve)=>{let done=false;const finish=()=>{if(done)return;done=true;window.clearTimeout(timer);image.removeEventListener('load',finish);image.removeEventListener('error',finish);resolve();};const timer=window.setTimeout(finish,3500);if(image.complete&&image.naturalWidth>0){finish();return;}image.addEventListener('load',finish,{once:true});image.addEventListener('error',finish,{once:true});try{void image.decode().then(finish).catch(()=>{});}catch{/* fallback: eventos load/error */}}))).then(()=>new Promise<void>((resolve)=>window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>resolve()))));}
async function waitForQrReady(){const started=Date.now();while(document.querySelector('.qr-placeholder')&&Date.now()-started<3500)await new Promise((resolve)=>window.setTimeout(resolve,60));}
function runInCurrentWindow(html: string, css: string) {
  document.getElementById('zapia-print-overlay')?.remove();
  document.getElementById('zapia-print-overlay-style')?.remove();
  document.body.classList.remove('zapia-printing');
  const overlay = document.createElement('div');
  overlay.id = 'zapia-print-overlay';
  overlay.innerHTML = html;
  const style = document.createElement('style');
  style.id = 'zapia-print-overlay-style';
  style.textContent = `#zapia-print-overlay{display:none}@media print{body.zapia-printing>*:not(#zapia-print-overlay){display:none!important}body.zapia-printing{margin:0!important;padding:0!important;background:#fff!important}body.zapia-printing #zapia-print-overlay,body.zapia-printing #zapia-print-overlay *{visibility:visible!important}body.zapia-printing #zapia-print-overlay{display:block!important;position:static!important;width:100%!important;height:auto!important;overflow:visible!important;background:#fff!important;color:#111827!important}body.zapia-printing #zapia-print-overlay .patient-preview-document,body.zapia-printing #zapia-print-overlay .clinical-print-sheet,body.zapia-printing #zapia-print-overlay .orders-print-page{display:block!important;position:static!important;visibility:visible!important;max-width:none!important;min-height:0!important;margin:0!important;padding:0!important;overflow:visible!important;background:#fff!important;color:#111827!important;box-shadow:none!important}body.zapia-printing #zapia-print-overlay .clinical-print-section{display:block!important;visibility:visible!important;break-inside:avoid-page}body.zapia-printing #zapia-print-overlay .clinical-print-grid{display:grid!important;visibility:visible!important;grid-template-columns:repeat(4,minmax(0,1fr))!important}body.zapia-printing #zapia-print-overlay .clinical-print-grid-wide{grid-template-columns:repeat(2,minmax(0,1fr))!important}body.zapia-printing #zapia-print-overlay .clinical-print-table{display:table!important;visibility:visible!important;width:100%!important}body.zapia-printing #zapia-print-overlay .clinical-print-table thead{display:table-header-group!important}body.zapia-printing #zapia-print-overlay .clinical-print-table tbody{display:table-row-group!important}body.zapia-printing #zapia-print-overlay .clinical-print-table tr{display:table-row!important}body.zapia-printing #zapia-print-overlay .clinical-print-table th,body.zapia-printing #zapia-print-overlay .clinical-print-table td{display:table-cell!important}body.zapia-printing #zapia-print-overlay .clinical-print-letterhead{display:grid!important;grid-template-columns:58px 1fr auto!important}body.zapia-printing #zapia-print-overlay .print-field{display:block!important;visibility:visible!important}body.zapia-printing #zapia-print-overlay img{visibility:visible!important;max-width:100%!important}body.zapia-printing #zapia-print-overlay .no-print{display:none!important}${css}}`;
  document.head.appendChild(style);
  document.body.appendChild(overlay);
  document.body.classList.add('zapia-printing');
  const cleanup = () => { document.body.classList.remove('zapia-printing'); overlay.remove(); style.remove(); window.removeEventListener('afterprint', cleanup); };
  window.addEventListener('afterprint', cleanup, { once: true });
  void waitForImages(overlay).then(()=>window.print());
  window.setTimeout(cleanup, 30000);
}

export function printElements(title: string, selectors: string[]) {
  if (typeof window === 'undefined') return;
  applyPrintSettings();
  void waitForQrReady().then(()=>{
    const clones = selectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!element) return '';
      const clone = element.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.no-print').forEach((item) => item.remove());
      clone.querySelectorAll('.print-only').forEach((item) => item.classList.remove('print-only'));
      clone.classList.remove('no-print', 'print-only', 'patient-preview-overlay');
      return clone.outerHTML;
    });
    if (!clones.some(Boolean)) { window.alert('No se encontró el documento para imprimir. Cierra la vista y vuelve a abrirla.'); return; }
    runInCurrentWindow(`<div class="zapia-print-root">${clones.join('')}</div>`, `.zapia-print-root{display:block!important;width:100%!important}.zapia-print-root .patient-preview-document,.zapia-print-root .patient-orders-document{min-height:0!important;max-width:none!important;margin:0!important;padding:0!important;box-shadow:none!important}`);
  });
}

export function printDocument(title: string, body: string) {
  if (typeof window === 'undefined') return;
  applyPrintSettings();
  let paper = 'A4'; let orientation = 'portrait'; let margin = '8mm 7mm';
  try { const settings = JSON.parse(localStorage.getItem('nefrohc_print_settings') || '{}') as { paper?: string; orientation?: string; margin?: string }; paper = settings.paper === 'Letter' ? 'letter' : settings.paper === 'receipt' ? '80mm auto' : 'A4'; orientation = settings.orientation === 'landscape' ? 'landscape' : 'portrait'; margin = settings.paper === 'receipt' ? '4mm' : settings.margin === 'compact' ? '5mm' : '8mm 7mm'; } catch { /* predeterminados */ }
  const pageSize = paper === '80mm auto' ? paper : `${paper} ${orientation}`;
  runInCurrentWindow(body, `@page{size:${pageSize};margin:${margin}}.print-header{display:flex;justify-content:space-between;gap:20px;border-bottom:3px solid #0f2a44;padding-bottom:10px;margin-bottom:12px}.print-meta{text-align:right;color:#475569;font-size:10px}.box{border:1px solid #cbd5e1;padding:8px;min-height:24px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}table{width:100%;border-collapse:collapse;font-size:9px}th,td{border:1px solid #cbd5e1;padding:5px;text-align:left;vertical-align:top}th{background:#eef5fc;color:#0f2a44;font-size:8px;text-transform:uppercase}.signature{margin:35px 0 0 auto;width:220px;border-top:1px solid #111827;padding-top:5px;text-align:center;font-size:9px}`);
}
