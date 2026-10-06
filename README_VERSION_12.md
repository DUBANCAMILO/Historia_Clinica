# Versión 12 — carga correcta del CLI de Tauri

Se fijó el CLI de Tauri en la versión `2.11.5` y se declaró explícitamente el binding nativo de Windows x64 como dependencia opcional. Esto evita que npm instale un binding incorrecto o incompleto.

Si aparece `Cannot find native binding` o `no es una aplicación Win32 válida`, usar una carpeta limpia y ejecutar la limpieza indicada en `INSTALACION_WINDOWS.md`.
