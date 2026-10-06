export interface PrintSettings { paper: 'A4' | 'Letter' | 'receipt'; orientation: 'portrait' | 'landscape'; margin: 'compact' | 'normal'; }
export const DEFAULT_PRINT_SETTINGS: PrintSettings = { paper: 'A4', orientation: 'portrait', margin: 'normal' };
export function applyPrintSettings() {
  if (typeof document === 'undefined') return;
  let settings = DEFAULT_PRINT_SETTINGS;
  try { settings = { ...DEFAULT_PRINT_SETTINGS, ...JSON.parse(localStorage.getItem('nefrohc_print_settings') || '{}') }; } catch { /* valores predeterminados */ }
  const size = settings.paper === 'Letter' ? 'letter' : settings.paper === 'receipt' ? '80mm auto' : 'A4';
  const margin = settings.paper === 'receipt' ? '4mm' : settings.margin === 'compact' ? '5mm' : '8mm 7mm';
  let style = document.getElementById('nefrohc-print-settings') as HTMLStyleElement | null;
  if (!style) { style = document.createElement('style'); style.id = 'nefrohc-print-settings'; document.head.appendChild(style); }
  style.textContent = `@media print { @page { size: ${size} ${settings.orientation}; margin: ${margin}; } }`;
}
