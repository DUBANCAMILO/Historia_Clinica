# Version integrada de escritorio

Esta entrega integra los cambios solicitados para las pruebas:

- La historia clínica queda con solo dos botones inferiores: **Imprimir historia** y **Guardar historia**.
- La impresión de la historia usa una plantilla clínica independiente de la pantalla de captura y conserva todos los campos por secciones.
- La receta se imprime en un formato diferente al formulario médico.
- La impresión muestra encabezado, datos del paciente, signos vitales, laboratorios, TFG/KDIGO, análisis, plan, medicamentos, alertas y firma.
- La ventana de impresión muestra una pantalla de carga mientras prepara el documento.
- Se retiraron los scripts externos que podían crear elementos flotantes no deseados.
- Los medicamentos se agregan con **Añadir otro medicamento** al final de la lista, sin regresar al inicio.
- Se agregó Configuración del consultorio para cambiar nombre, especialidad, registro, teléfono, correo, ciudad, tema claro/oscuro y firma del médico.
- La firma cargada aparece en la historia y en la receta.
- La migración SQLite agrega `local_history_documents`.
- Guardar historia en Tauri persiste el documento en SQLite; la versión web mantiene un respaldo en localStorage.
- La lista de pacientes intenta cargar también las historias guardadas en SQLite.
- Se mantienen los respaldos SQLite y se corrigió el ciclo de vida de `rusqlite::backup::Backup`.
- Se agregaron comandos Tauri `save_history_json` y `load_history_json`.

## Instalación de prueba en Windows

Abrir **Developer PowerShell for Visual Studio 2026** en la carpeta del proyecto:

```powershell
npm install
npm run tauri:dev
```

## Instalador EXE

```powershell
npm run tauri:build
```

El instalador se crea dentro de `src-tauri/target/release/bundle/nsis/`.

Antes de usarlo con pacientes reales, hacer pruebas de respaldo/restauración y definir credenciales, permisos y política de protección de datos del consultorio.
