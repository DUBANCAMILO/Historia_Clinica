# Versión 36 — Impresión compatible con Tauri

- Se eliminó la dependencia de ventanas emergentes para imprimir.
- Historia clínica, vista de Pacientes y Órdenes médicas ahora crean una capa de impresión dentro de la misma ventana y llaman al diálogo nativo de impresión.
- Esto evita que Tauri/WebView bloquee la impresión.
- Se conserva la limpieza de controles, menús, overlays y clases de pantalla.
- Se conserva la separación por categorías y el QR superior junto al título.
- La impresión de órdenes externas también usa el mismo flujo local.
