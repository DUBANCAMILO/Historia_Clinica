# Registro de pruebas Windows — NefroHC v46

**Fecha del ensayo:** 2026-10-05 · **Producto:** 0.1.5 · **Entorno:** Windows x64, Developer PowerShell for Visual Studio, Node 24.19.0.

> Evidencias transcritas de las salidas y confirmaciones del usuario. Las pruebas funcionales se hicieron con un registro identificado explícitamente como ficticio. No equivalen a certificación clínica, de seguridad ni legal.

## Resultados observados

| Prueba | Evidencia / resultado |
|---|---|
| Instalación de paquetes | `npm install --include=optional` terminó con 485 paquetes instalados. Reportó 14 vulnerabilidades (13 high, 1 critical), paquetes deprecados y cinco scripts pendientes de aprobación. |
| Generación Prisma | `prisma generate` terminó correctamente durante `pretype-check`, `prebuild` y build. |
| TypeScript | `npm run type-check` pasó después de corregir el import de `Clock` y añadir la sincronización SQLite de restauración. `tsc --noEmit` volvió al prompt sin error. |
| App de desarrollo | `npm run tauri:dev` abrió inicialmente y volvió a abrir sin errores tras el parche Rust `restore_snapshot_mirror`. |
| Backup automático | En `%APPDATA%\co.nefrohc.desktop\automatic-backups` se observaron pares JSON/SQLite. Se listaron 12 pares; una copia de seguridad de la carpeta tuvo 50 archivos y 5.284.180 bytes. |
| Lectura JSON | `ConvertFrom-Json` pudo leer el archivo probado; mostraba 2 historias y coincidencia del nombre ficticio `PACIENTE DE PRUEBA`. |
| SQLite del snapshot | Node `node:sqlite`: `PRAGMA integrity_check` dio `ok`; se encontró 1 registro ficticio en `local_history_documents`. |
| Restauración | Se eliminó solo el registro ficticio. Se seleccionó el JSON comprobado; la vista previa mostró 2 historias, se confirmó la restauración y el usuario reportó que volvieron el registro y la información. |
| SQLite activo después de restaurar | Node `node:sqlite`: `PRAGMA integrity_check` dio `ok`; la tabla espejo contenía 2 historias, incluida 1 coincidencia ficticia. |
| Firma | La firma se vio en Configuración e impresión, persistió tras cerrar/reabrir `tauri:dev` y el usuario informó que seguía visible tras instalar. |
| QR | En la historia impresa el usuario informó que el QR aparecía y se podía escanear. No se registró captura del contenido escaneado ni prueba con más lectores/dispositivos. |
| Alergias | En el registro ficticio se probó un texto largo claramente marcado como dato de prueba; el usuario informó que no se desbordó en impresión. |
| Compilación Next.js | `npm run tauri:build` ejecutó `next build`: compilación correcta, 13/13 páginas estáticas y exportación finalizada. El proceso indica que omitió validación de tipos y lint; el type-check se ejecutó por separado. |
| Rust/Tauri | Perfil release terminado: `Finished release profile [optimized]` tras 6 min 26 s. Se reportaron 5 warnings no fatales. |
| NSIS | Se generó `Historia Clínica_0.1.5_x64-setup.exe`, tamaño reportado 3,54 MiB. |
| Instalación | Se eligió `Do not uninstall` para conservar la versión previa. El instalador finalizó y se abrió la app. El usuario indicó que la veía bien y confirmó que registro/firma seguían visibles. |
| SHA-256 del instalador | `5973DF7F5B8A35C7983EF770F2CC12DFE7FFAB4BAC2F754C0E4CDAFF5300B788`. |

## Archivos de respaldo de prueba

La ruta observada fue:

```text
C:\Users\kamil\AppData\Roaming\co.nefrohc.desktop\automatic-backups
```

La copia preventiva antes de instalar se copió a:

```text
C:\Users\kamil\AppData\Local\NefroHC-pre-upgrade-v46
```

La copia contiene datos no cifrados por NefroHC; debe mantenerse privada y no ubicarse en carpetas sincronizadas/compartidas si incluye datos identificables.

## Datos ficticios que pueden seguir en la app

El registro `PACIENTE DE PRUEBA — NO REAL` fue restaurado para comprobar recuperación y se editó con un texto ficticio de maquetación en Alergias. Confirmar su fila exacta y eliminarlo antes de cualquier operación distinta de pruebas. No confundir esta limpieza con autorización para borrar otros pacientes.

## Fuera del alcance

- Retención efectiva de 30 pares, intervalo de 5 minutos cronometrado fuera del módulo de backup, fallos por espacio/permisos y rollback ante fallo.
- Restauración en equipo/perfil separado; exportación/restauración exhaustiva de órdenes, catálogos, recetas, evolución y preferencias de un conjunto clínico representativo.
- Impresión física o PDF en múltiples formatos, páginas largas, saltos de página, hojas separadas por categorías, QR con diferentes teléfonos y órdenes médicas completas.
- Auditoría completa de `npm audit`, corrección de vulnerabilidades, endurecimiento de autenticación/CSP y revisión de normativas.
- Uso con pacientes reales.
