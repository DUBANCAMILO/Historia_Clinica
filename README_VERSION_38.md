# Versión 38 — Impresión de historias y gestión manual de órdenes

- Se corrigió la impresión en blanco desde la vista del paciente: el overlay de impresión ahora fuerza visibilidad explícita de su contenido y restablece grid, tablas, encabezados y campos que las reglas globales de impresión ocultaban.
- Antes de cada impresión se limpian overlays anteriores para evitar duplicados o restos de una impresión anterior.
- Se añadió el módulo independiente **Órdenes médicas** en el menú y en Inicio para gestión manual.
- La gestión permite seleccionar y vincular una historia/paciente existente, crear, guardar, editar, limpiar, imprimir y eliminar órdenes con confirmación.
- Cada orden manual incluye medicamentos, laboratorios externos, paraclínicos, otras órdenes, indicaciones, diagnóstico, fecha y estado.
- Cada categoría de la impresión manual se organiza en una hoja/documento separado.
- Las órdenes manuales se enlazan con el historial del paciente y aparecen también en el icono de Órdenes médicas de Pacientes.
- Se agrega respaldo automático al guardar y antes de eliminar órdenes manuales.
- Exportación/importación JSON y respaldos automáticos ahora incluyen las órdenes manuales.
