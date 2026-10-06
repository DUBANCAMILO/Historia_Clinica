# Versión 13 — compatibilidad con el registro npm

Se quitó la versión exacta del CLI de Tauri que no está disponible en algunos registros npm. El proyecto vuelve a usar `@tauri-apps/cli: ^2.0.0`, la misma configuración que permitió instalar y ejecutar Tauri anteriormente.

En la carpeta limpia:

```powershell
npm install --include=optional
npm run tauri:dev
```
