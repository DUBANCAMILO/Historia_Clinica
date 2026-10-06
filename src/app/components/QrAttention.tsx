'use client';
import React, { useEffect, useState } from 'react';
import { createAttentionQr, QrAttentionData } from '../../lib/qrAttention';
export type { QrAttentionData } from '../../lib/qrAttention';
export default function QrAttention({ data, label = 'Escanear para resumen' }: { data: QrAttentionData; label?: string }) {
  const dataKey = JSON.stringify(data);
  const [src, setSrc] = useState('');
  useEffect(() => {
    let active = true;
    setSrc('');
    try {
      const stableData = JSON.parse(dataKey) as QrAttentionData;
      void createAttentionQr(stableData).then((url) => {
        if (active) setSrc(url);
      }).catch((error: unknown) => {
        console.error('No se pudo generar el QR de la atención.', error);
        if (active) setSrc('');
      });
    } catch (error) {
      console.error('No se pudieron preparar los datos del QR.', error);
      setSrc('');
    }
    return () => { active = false; };
  }, [dataKey]);
  return <div className="qr-attention-box">{src ? <img src={src} alt="Código QR de resumen básico de atención" /> : <div className="qr-placeholder">QR</div>}{label && <span>{label}</span>}</div>;
}
