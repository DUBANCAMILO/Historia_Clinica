# Versión 25 — historia como destino principal

- La receta ya no guarda directamente en el módulo independiente de recetas.
- `Guardar en Pacientes` envía el paquete actual a la historia clínica y actualiza la ficha del paciente.
- El registro de la receta se mantiene solo como referencia interna para impresión y copia, no como destino principal.
- Se retiró la etiqueta CUPS y se conservaron códigos institucionales internos legibles.
- La receta conserva Presentación y Dosis; no existe Concentración separada.
- La impresión separa medicamentos, laboratorios, paraclínicos y órdenes médicas.
- Se mantiene una sola solicitud médica con categorías separadas en la impresión.
- Se corrigió el manejo para que el paquete actual enviado desde la receta tenga prioridad sobre datos antiguos.
- Se mantiene la limpieza de seguimiento, órdenes pendientes y documentos externos.
