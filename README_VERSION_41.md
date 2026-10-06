# Versión 41 — Firma y QR en impresión de órdenes

Corrección solicitada tras probar v40:

- La impresión de órdenes manuales ahora carga la firma configurada en Ajustes (`nefrohc_doctor_settings`) en lugar de mostrar únicamente una línea en blanco.
- El nombre, especialidad, registro, teléfono y ciudad de la cabecera y firma se leen de la configuración guardada.
- Se redujo el contenido codificado en el QR para evitar superar la capacidad del código y dejarlo vacío.
- La impresión espera a que los QR de la vista estén generados y que las imágenes (firma, QR y logo) terminen de cargar antes de abrir el diálogo.
- Se aplicó la misma carga de firma y espera del QR a las órdenes impresas desde Pacientes y desde las hojas de Órdenes médicas.

Importante: para que aparezca la firma manuscrita, debe estar cargada y guardada en Configuración del consultorio > Firma para documentos. Esta versión requiere `npm run type-check` y pruebas en Windows; todavía no se ha confirmado el instalador.
