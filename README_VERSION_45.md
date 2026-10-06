# NefroHC v45 — ajuste de alergias y QR

- El campo de alergias de la historia del paciente usa el mismo ancho de columna que los demás campos de identificación y ajusta el texto dentro de la celda.
- Se compactó el resumen QR y se limitaron los textos/líneas para evitar exceder la capacidad del código y que no se genere.
- La generación del QR usa una clave estable de datos; si falla, el error queda registrado para diagnóstico.
- Conserva los ajustes de salto de texto de impresión incluidos en v44.
- Versión de producto: 0.1.4.

Pendiente: ejecutar npm install, npm run type-check y probar en Windows tanto vista previa/impresión como escaneo del QR antes de generar instalador.
