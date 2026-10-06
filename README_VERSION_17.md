# Versión 17 — enlace bidireccional de historia y receta

- Laboratorios y paraclínicos se agregan uno por uno mediante un botón `+`.
- Cada examen tiene nombre y código interno editable/configurable para el catálogo institucional.
- Se ampliaron los catálogos de laboratorio e imagen.
- La receta queda vinculada al `history_id` de la historia.
- Guardar la receta actualiza la historia con sus órdenes y medicamentos.
- Guardar la historia crea o actualiza automáticamente la receta vinculada cuando hay prescripción u órdenes.
- La impresión de la historia incluye una sección completa de receta y órdenes vinculadas.
- La impresión de la receta conserva formato compacto, códigos y todos los medicamentos.
- Las recetas se guardan y consultan en SQLite mediante Tauri, además de la copia local.
- Se corrigió el ciclo de vida de la receta para poder crear varias y volver a cargarlas.
