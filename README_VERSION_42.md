# NefroHC v42 — exportación nativa y mantenimiento de versión

- Se corrigió la exportación JSON/CSV para la aplicación de escritorio: muestra el diálogo nativo de Windows para elegir carpeta y nombre, escribe el archivo desde Tauri y muestra la ruta guardada. En vista web conserva la descarga del navegador.
- Cancelar el diálogo ya no indica falsamente que se exportó; los errores de escritura se muestran en la página.
- El JSON completo incorpora configuraciones del consultorio, firma, apariencia, órdenes y catálogo de órdenes médicas; la restauración repone esos datos y avisa a los módulos para que se actualicen.
- Las lecturas locales de estadísticas e historiales de respaldo ahora toleran JSON dañado; si el historial interno se queda sin espacio, una exportación externa ya guardada no se reporta como fallida.
- Se corrige la limpieza de órdenes externas al usar «Eliminar todo».
- Versión de producto elevada a 0.1.1 y API de Tauri fijada en 2.12.0 para evitar el desfase que bloqueó el empaquetado anterior.

## Pruebas pendientes en Windows

La compilación Rust/Tauri y el diálogo nativo no se pueden ejecutar en este entorno. Tras extraer en una carpeta v42 nueva, instala dependencias, ejecuta `npm run type-check`, abre con `npm run tauri:dev`, prueba JSON y CSV eligiendo una ruta y verifica que los archivos abran antes de generar el instalador.

No desinstales v41 antes de instalar v42; conserva la misma identidad de aplicación para mantener los datos locales y crea una copia de respaldo independiente antes de cualquier cambio.
