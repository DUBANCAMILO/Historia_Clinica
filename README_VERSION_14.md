# Versión 14 — receta compacta e instalador

- La receta usa una escala y estructura visual cercana a la historia clínica.
- Se redujeron logo, títulos, márgenes, sombras y tamaños para que quepa mejor en una hoja clínica.
- Se agregó el título `FÓRMULA MÉDICA / ORDEN AL PACIENTE` con el mismo estilo de secciones de la historia.
- Se ocultó el indicador negro de desarrollo de Next.js (la N flotante); tampoco aparecerá en el instalador de producción.
- La configuración de Tauri sigue lista para generar NSIS.

Para crear el instalador desde Windows Developer PowerShell:

```powershell
npm install --include=optional
npm run tauri:build
```

El instalador queda en `src-tauri\\target\\release\\bundle\\nsis\\`.
