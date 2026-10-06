# Versión 8 — receta y carga

Cambios de esta entrega:

- La receta ya no hereda el plan médico como indicaciones. `Indicaciones adicionales` inicia vacío para que el médico lo escriba.
- Las indicaciones se guardan en `additional_notes` y se imprimen en la receta.
- La receta usa una hoja de alto contraste blanco/gris, incluso con el tema oscuro activo.
- Se redujeron los fondos azul brillante, sombras y resaltados.
- La receta usa los datos configurados del médico y su firma.
- Corregido el correo del médico a `hergoncor123@gmail.com`.
- Se agregó una migración del campo `additional_notes` al esquema clínico.
- La pantalla de carga del login pasó de 2.4 segundos a aproximadamente 0.76 segundos.
- Se mantienen la impresión independiente de historia y receta, el guardado SQLite y la configuración de tema/firma.

Prueba:

```powershell
npm install
npm run tauri:dev
```

El primer arranque de Tauri puede tardar por la compilación inicial de Rust. Los siguientes arranques normalmente son más rápidos.
