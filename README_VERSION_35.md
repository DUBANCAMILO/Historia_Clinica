# Versión 35 — Corrección definitiva de impresión en Pacientes y Órdenes

- La impresión desde Gestión de Pacientes ahora usa una ventana documental aislada.
- Se eliminaron del documento de impresión las clases de ventana, modal, overlay, controles y estados de pantalla.
- Se redujeron las causas de hojas en blanco y desbordamientos.
- Se aplicó el mismo método a Historia clínica, vista del ojo, Órdenes médicas y orden impresa.
- Cada bloque de órdenes comienza de forma controlada y mantiene sus categorías.
- El QR se ubicó dentro de la línea superior junto al título HISTORIA CLÍNICA o al título de la orden, no debajo del documento.
- Se mantiene la configuración de hoja, orientación y márgenes.
- La ventana de impresión se abre directamente desde el clic para evitar bloqueos del navegador/Tauri.
- JSON y CSV continúan usando descarga real con ancla agregada al documento.
