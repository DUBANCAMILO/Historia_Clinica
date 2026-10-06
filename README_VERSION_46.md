# NefroHC v46 — paquete de prueba interna

**Producto:** 0.1.5 · **Fecha de validación:** 2026-10-05.  
**Estado:** compilado e instalado para prueba interna en Windows con datos ficticios. **No aprobado para producción clínica.**

## Resultado probado

- `npm run type-check`: pasó en Windows después de corregir el import `Clock` y sincronizar SQLite durante la restauración.
- `npm run tauri:dev`: abrió sin errores después del parche de restauración.
- Se crearon copias automáticas JSON/SQLite. JSON legible con 2 historias; snapshot SQLite `integrity_check=ok` y registro ficticio presente.
- Se restauró el JSON después de eliminar el registro ficticio; volvió a mostrarse en Pacientes y el SQLite activo quedó íntegro con 2 historias.
- La firma persistió tras reinicio de desarrollo, aparece en impresión y el usuario reportó que sigue visible tras instalar.
- QR escaneable y texto largo ficticio de alergias sin desbordamiento, según confirmación del usuario.
- `npm run tauri:build` generó NSIS v0.1.5 de 3,54 MiB; se instaló sobre la versión previa con **Do not uninstall** y el usuario reportó que los datos siguen visibles.

Detalles y límites: `docs/ESTADO_ENTREGA.md` y `docs/REGISTRO_PRUEBAS_WINDOWS_V46.md`.

## Instalador Windows

```text
C:\Users\kamil\OneDrive\Escritorio\historia-clinica-desktop-integrada-v46\src-tauri\target\release\bundle\nsis\Historia Clínica_0.1.5_x64-setup.exe
```

**SHA-256 reportado por PowerShell:**

```text
5973DF7F5B8A35C7983EF770F2CC12DFE7FFAB4BAC2F754C0E4CDAFF5300B788
```

El instalador está en el equipo Windows del consultorio. El ZIP del proyecto contiene fuente y documentación; no incluye ese binario de Windows.

## Cambios de v46

- Respaldo local automático JSON + snapshot SQLite, copia forzada previa a operaciones destructivas y estado de ruta/error.
- Restauración JSON que sincroniza historias/recetas con el espejo SQLite dentro de una transacción.
- Impresión desde Pacientes usando configuración local y firma guardada.
- Manual de usuario, documentación técnica, instrucciones de instalación y registro de pruebas, en Markdown y Word donde corresponde.

## Riesgos y trabajo pendiente

- La instalación de dependencias reportó 14 vulnerabilidades npm (13 altas, 1 crítica), cinco scripts pendientes y paquetes deprecados. Revisar el audit con actualización controlada; no usar `npm audit fix --force`.
- Login/contraseñas siguen en texto claro y la cuenta demo está en el código; Tauri mantiene CSP `null`.
- Respaldo local no cifrado por la aplicación; SQLite es un espejo parcial y `localStorage` sigue siendo fuente inmediata.
- Falta prueba de retención de 30 pares, timer cronometrado, falta de espacio/permisos, exportaciones y restauración de todas las colecciones, impresora/PDF y revisión clínica/legal/seguridad.
- El registro `PACIENTE DE PRUEBA — NO REAL` y texto de alergia ficticio pueden seguir en la instalación; retirarlos antes de cualquier uso distinto de pruebas.

**No usar con datos clínicos reales hasta cerrar los bloqueadores y obtener validación profesional.**
