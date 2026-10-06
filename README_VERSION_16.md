# Versión 16 — recetas persistentes en SQLite

- Se agregó la tabla local `local_prescriptions`.
- Una misma persona puede tener múltiples recetas independientes.
- Cada receta guarda paciente, fecha, diagnóstico, medicamentos, laboratorios, paraclínicos e indicaciones.
- Se agregaron comandos Tauri para guardar, consultar y eliminar recetas.
- La interfaz conserva una copia local para la versión web y usa SQLite cuando corre como escritorio.
- El autocompletado combina catálogos clínicos y medicamentos registrados previamente.
- La impresión de receta mantiene formato compacto tipo historia clínica.

Para probar el escritorio:

```powershell
npm install --include=optional
npm run tauri:dev
```

Para crear el instalador:

```powershell
npm run tauri:build
```
