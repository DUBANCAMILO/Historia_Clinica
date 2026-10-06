# Estado de entrega de NefroHC

**Corte:** 2026-10-05 21:21 -05 · **Rama:** v46 · **Producto:** 0.1.5.

## Dictamen

**La v46 está compilada e instalada como versión de prueba interna, pero no aprobada para producción clínica.** Las pruebas funcionales realizadas en Windows confirman creación y restauración de respaldos JSON/SQLite, firma, QR, ajuste del texto de alergias, build NSIS e instalación sobre la versión anterior sin desinstalarla primero. El alcance sigue siendo acotado y quedan bloqueadores de seguridad y validaciones operativas.

No registrar datos clínicos reales con esta compilación. Mantener los ensayos con datos ficticios hasta corregir autenticación, CSP y vulnerabilidades, y recibir revisión clínica, jurídica y de protección de datos.

## Pruebas realizadas en el Windows del consultorio

| Prueba | Resultado observado |
|---|---|
| `npm install --include=optional` en v46 | Terminó; 485 paquetes. Reportó 14 vulnerabilidades: 13 altas y 1 crítica. Cinco paquetes mostraron scripts pendientes de aprobación. |
| `npm run type-check` | Pasó después de agregar la importación `Clock` y aplicar el ajuste de restauración del espejo SQLite. `tsc --noEmit` terminó sin errores. |
| `npm run tauri:dev` | Abrió sin errores, también después de aplicar el ajuste de restauración. |
| Copias automáticas | En `AppData\Roaming\co.nefrohc.desktop\automatic-backups` se observaron pares JSON/SQLite; se listaron 12 pares y el directorio de prueba copiado a una carpeta local tuvo 50 archivos y 5.284.180 bytes. |
| JSON automático | `ConvertFrom-Json` lo leyó correctamente. El snapshot comprobado incluía 2 historias y el registro ficticio. |
| SQLite del snapshot | `PRAGMA integrity_check` devolvió `ok`; se encontró 1 documento de prueba. |
| Restauración JSON | Se eliminó el registro ficticio, se seleccionó el snapshot verificado y se confirmó la vista previa de 2 historias. El registro y la información volvieron a mostrarse. |
| SQLite activo tras restaurar | `PRAGMA integrity_check` devolvió `ok`; se encontraron 2 historias y el registro ficticio. |
| Firma | Se vio en Configuración e impresión; persistió al cerrar y volver a abrir la aplicación de desarrollo. El usuario reporta que sigue visible tras instalar v46. |
| QR e impresión | El usuario reporta que el QR aparece y puede escanearse; un texto largo ficticio en Alergias no se desbordó en impresión. |
| `npm run tauri:build` | Next.js exportó correctamente; Rust compiló en perfil release. Se generó NSIS de 3,54 MiB. Rust produjo 5 advertencias no fatales. |
| Instalador | Se instaló sobre la versión existente usando **Do not uninstall**. El usuario informa que la aplicación abre y que los datos/firma se ven bien. |
| Copia previa a actualización | Se copiaron 50 archivos de respaldo a `C:\Users\kamil\AppData\Local\NefroHC-pre-upgrade-v46`; no está cifrada y sigue en el mismo equipo. |

### Instalador generado

```text
C:\Users\kamil\OneDrive\Escritorio\historia-clinica-desktop-integrada-v46\src-tauri\target\release\bundle\nsis\Historia Clínica_0.1.5_x64-setup.exe
```

**Tamaño reportado:** 3,54 MiB  
**SHA-256 reportado por PowerShell:**

```text
5973DF7F5B8A35C7983EF770F2CC12DFE7FFAB4BAC2F754C0E4CDAFF5300B788
```

El ZIP de fuentes/documentación y el instalador son artefactos distintos. El instalador está en la máquina Windows del consultorio; este documento no incluye el binario.

## Cambios incluidos en v46

- Respaldo automático en Tauri al iniciar sesión, tras cambios de datos/configuración y cada cinco minutos mientras la app está abierta; conserva hasta 30 pares locales JSON/SQLite y evita duplicados idénticos.
- Copia previa forzada antes de eliminar historias/órdenes, borrar todo o restaurar; en escritorio, si falla la copia se cancela la operación protegida.
- Restauración JSON actualiza el almacenamiento de interfaz y sincroniza las tablas espejo de historias/recetas en SQLite dentro de una transacción.
- La firma guardada en Configuración se incluye en snapshots JSON y se usa en las impresiones probadas.
- Se corrigió la vista previa de historia desde Pacientes para usar la firma/configuración local.

## Pendiente o no cubierto por las pruebas

- Verificar explícitamente la frecuencia periódica de cinco minutos sin visitar la pantalla de respaldos, la política de retención de 30 pares y los casos de falta de espacio/permisos.
- Probar todos los tipos y tamaños de exportación, recetas/órdenes, restauración de catálogos/evolución/configuración y fallo/rollback de almacenamiento en datos sintéticos completos.
- Impresión física/PDF en varios tamaños de página, paginación extensa, hojas separadas de categorías y lectura del QR con distintos teléfonos/lectores.
- Verificar firma y preservación de todas las colecciones en una restauración sobre una copia limpia o un segundo perfil/PC.
- Revisar el instalador con antivirus/SmartScreen y validar desinstalación/reparación por separado. No desinstalar la aplicación anterior para esta prueba.
- Analizar la salida completa de `npm audit` y resolver las vulnerabilidades con actualizaciones revisadas; no usar `npm audit fix --force`.

## Bloqueadores de uso clínico real

1. Usuarios/contraseñas de demostración se guardan y validan en el cliente/localStorage; no constituyen autenticación segura. Hay una cuenta de demostración en el código.
2. La configuración Tauri mantiene `csp: null`.
3. El `npm install` v46 reportó 14 vulnerabilidades (13 altas, 1 crítica) y paquetes con scripts pendientes de aprobación. No se analizaron ni corrigieron aquí.
4. Los respaldos locales JSON/SQLite no están cifrados por NefroHC. La copia previa de prueba permanece en el mismo equipo.
5. `localStorage` sigue siendo la fuente inmediata principal y SQLite un espejo parcial. No es una arquitectura de operación multiusuario ni de alta disponibilidad.
6. Requiere revisión del responsable clínico, seguridad, protección de datos y cumplimiento colombiano aplicable a historias clínicas y datos sensibles.

## Estado del dato ficticio

El registro `PACIENTE DE PRUEBA — NO REAL` y el texto ficticio de maquetación en Alergias se recuperaron como parte de la prueba y pueden seguir en la instalación. **Eliminar ese dato de prueba antes de cualquier uso distinto de pruebas**; confirmar la fila exacta antes de borrarla.

## Documentación incluida

- `docs/MANUAL_USUARIO.md` y `docs/NefroHC_Manual_Usuario.docx`.
- `docs/DOCUMENTACION_TECNICA.md` y `docs/NefroHC_Documentacion_Tecnica.docx`.
- Este estado de entrega y `docs/REGISTRO_PRUEBAS_WINDOWS_V46.md`.

**Conclusión:** v46 cuenta con instalador generado y validación funcional inicial en un equipo Windows con datos ficticios. No es apta para datos clínicos reales ni equivale a una certificación clínica, legal o de seguridad.
