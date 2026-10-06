# Versión 39 — Corrección del error TS2322 en Órdenes médicas

- Se corrigió el error de TypeScript al mostrar el número de HC en el selector de pacientes, convirtiendo el valor indexado en texto seguro para React.
- Se conserva la impresión compatible con Tauri, con visibilidad explícita del documento impreso.
- Se conserva el módulo de gestión manual de Órdenes médicas, con guardar, limpiar, editar, imprimir y eliminar con confirmación.
- Las órdenes manuales siguen vinculadas a la historia del paciente, visibles desde las acciones de Pacientes y dentro de respaldos/JSON.
- Impresión manual separada por medicamentos, laboratorios, paraclínicos, otras órdenes e indicaciones.
