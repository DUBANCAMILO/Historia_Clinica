# Versión 11 — vista de historias y carga rápida

- Abrir una historia desde la tabla ahora carga todos sus datos en el formulario, en lugar de abrir una historia vacía.
- Los botones de ver y editar guardan la historia seleccionada antes de volver al módulo de historia clínica.
- Nueva HC elimina la selección anterior para comenzar en blanco.
- La lista de pacientes muestra primero la copia local inmediatamente; la lectura de SQLite se realiza en segundo plano con un límite de espera corto.
- Se eliminó la espera artificial al borrar y al iniciar sesión.
- Se retiraron referencias y configuración del generador externo; la aplicación no muestra ni carga elementos externos de ese servicio.
- Se eliminó el mapa de origen de producción para reducir tiempo y peso de carga.
- Se eliminó `package-lock.json` antiguo para que `npm install` genere uno limpio con las dependencias actuales.

Prueba con una carpeta limpia:

```powershell
npm install
npm run tauri:dev
```
