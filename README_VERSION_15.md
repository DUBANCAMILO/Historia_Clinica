# Versión 15 — recetas por paciente y ordenes

- Cada paciente puede tener varias recetas independientes.
- Se puede crear una nueva receta sin borrar la historia clínica.
- Las recetas guardadas se consultan por fecha y diagnóstico.
- Cada receta conserva medicamentos, dosis, vía, frecuencia, duración, cantidad e indicaciones.
- Se agregaron solicitudes de laboratorios y paraclínicos/imágenes.
- Medicamentos, laboratorios y paraclínicos tienen autocompletado mediante catálogos y registros previos del consultorio.
- La impresión de receta compacta incluye medicamentos, laboratorios, paraclínicos, indicaciones y firma.
- Se corrigió la apertura de historias guardadas: ver/editar ya carga los datos reales y no una historia vacía.
- El módulo de pacientes pinta la copia local de inmediato y consulta SQLite en segundo plano.
- Se ocultó el indicador negro de desarrollo.
