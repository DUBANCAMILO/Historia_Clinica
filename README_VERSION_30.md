# Versión 30 — Integración completa de historia, módulos e impresión

- La historia clínica vuelve a ser la fuente principal y se sincroniza con Pacientes, Receta y Órdenes externas.
- Cada receta se conserva de forma independiente para consultarla, copiarla y editarla sin convertirla en el registro principal.
- Al abrir una historia desde Pacientes, se reconstruyen sus medicamentos, laboratorios, paraclínicos y órdenes.
- Al eliminar una historia, también se limpian sus recetas y órdenes externas vinculadas.
- Agenda integrada con pacientes existentes mediante búsqueda/autocompletado y constancia imprimible.
- Impresión completa desde Historia clínica, vista de Pacientes, Receta, Órdenes externas y Agenda.
- La vista de Pacientes imprime la historia completa: identificación, antecedentes, signos vitales, examen, análisis, plan, receta, órdenes, alertas y evolución.
- Las copias automáticas incluyen historias, recetas, citas y órdenes externas.
- Se eliminaron los datos de pacientes ficticios de la gestión real de Pacientes; ahora solo aparecen registros guardados localmente o en SQLite.
