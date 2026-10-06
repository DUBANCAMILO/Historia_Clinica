# Documentación técnica — NefroHC

**Versión de trabajo:** v46 · 0.1.5. Compilada, instalada y sometida a pruebas funcionales iniciales en Windows con datos ficticios; no aprobada para producción clínica. Resultados y límites en `ESTADO_ENTREGA.md` y `REGISTRO_PRUEBAS_WINDOWS_V46.md`.

## 1. Arquitectura

- **Interfaz:** Next.js 15, React 19, TypeScript y Tailwind CSS; aplicación de cliente empaquetada para escritorio.
- **Contenedor de escritorio:** Tauri 2, con comandos nativos en Rust.
- **Persistencia de interfaz/datos:** `localStorage` continúa siendo la fuente inmediata de la mayoría de los módulos. Las historias y recetas también tienen comandos de espejo en SQLite local.
- **SQLite:** `rusqlite` usa una base `historia-clinica.sqlite3` bajo el directorio de datos de Tauri. La inicialización ejecuta `database/migrations/001_initial/up.sql`.
- **Sin servicio remoto:** el diseño es local; no hay sincronización central ni carga automática a nube configurada.
- **Identificador de aplicación:** `co.nefrohc.desktop`. No cambiarlo para actualizar la instalación existente y conservar el directorio local de datos.

## 2. Persistencia y estructura de datos

Claves principales de `localStorage`:

| Clave | Uso |
|---|---|
| `hcs_hgc` | Historias clínicas y lista principal de pacientes |
| `nefrohc_recipes` / legado `recetas_hgc` | Recetas y medicamentos vinculados |
| `nefrohc_external_orders` | Resumen de órdenes externas |
| `nefrohc_manual_orders` | Órdenes médicas manuales vinculadas a historias |
| `valoraciones_hgc` | Valoraciones |
| `nefro_evolution` | Series para gráficos de evolución renal |
| `nefrohc_doctor_settings` | Datos de consultorio y firma como data URL |
| `nefrohc_print_settings` | Papel, orientación y márgenes |
| `nefrohc_catalog_*` | Catálogos de medicamentos, laboratorios, paraclínicos y órdenes |
| `nefro_audit_logs` | Auditoría local |

Las claves de sesión y usuarios (`nefrohc_users`, `nefrohc_session`, `nefrohc_runtime_session`) se excluyen intencionalmente de los respaldos clínicos. No se deben incluir contraseñas en exportaciones.

## 3. Firma del médico

`src/app/settings/page.tsx` convierte una imagen PNG/JPG a data URL mediante `FileReader`, conserva el dato en estado y solo lo persiste al pulsar **Guardar configuración**, bajo `nefrohc_doctor_settings`. `src/lib/doctorPrintSettings.ts` lee y valida el dato para las páginas de impresión. El snapshot de seguridad incluye esa configuración, por lo que preserva la firma. En v46, `PatientPreviewModal.tsx` también consume estos ajustes y escucha `nefrohc:settings-updated`. En la prueba del usuario la firma apareció en Configuración e impresión, persistió tras reiniciar `tauri:dev` y siguió visible después de instalar v46.

## 4. Respaldo automático implementado en esta versión

### Flujo

1. `components/AppLayout.tsx` inicia el servicio al detectar una sesión de ejecución, llama al respaldo al inicio, escucha `nefrohc:data-updated` y `nefrohc:settings-updated`, y consulta de nuevo cada cinco minutos.
2. `src/lib/localData.ts` construye un snapshot versionado con historias, recetas, órdenes, catálogos, evolución, auditoría, preferencias y firma; no incluye usuarios/contraseñas. En Tauri invoca `create_safety_backup`; en vista web guarda una copia local limitada como alternativa.
3. `src-tauri/src/db.rs::create_safety_backup` valida JSON, guarda el snapshot como `.json`, copia SQLite mediante la API online backup de rusqlite a un `.sqlite3` hermano, compara el contenido sin `exportedAt` para evitar duplicados y conserva hasta 30 pares recientes.
4. La pantalla **Respaldo y restauración** muestra ruta/hora del último guardado y permite forzar un snapshot. Eliminación total, restauración y eliminación de historia/orden crean primero copia forzada y, en el contenedor Tauri, cancelan la acción si no se confirma la copia.
5. La importación JSON restaura las colecciones compatibles en localStorage y llama a `restore_snapshot_mirror` para reemplazar historias/recetas del espejo SQLite dentro de una transacción. En Windows se comprobó con un registro ficticio: restauración confirmada, historia visible y `PRAGMA integrity_check=ok` tanto en snapshot como en la base activa.

### Directorio

El comando usa `app.path().app_data_dir()/automatic-backups`. La ruta exacta que devuelve Tauri se muestra en la pantalla de respaldo. Los archivos son locales y **no están cifrados por la aplicación**; depende de los permisos/cifrado de Windows y del usuario.

### Retención y límites

- Se guardan hasta 30 pares JSON/SQLite; una nueva modificación puede desplazar la copia más antigua.
- No hay copia fuera del computador, sincronización, alertas remotas, restauración automática ni verificación de lectura/escritura completa en segundo equipo.
- Una pérdida/daño del perfil de Windows o del disco puede destruir la copia automática local; mantener una exportación JSON externa y protegida.
- El espejo SQLite no reemplaza aún a `localStorage` como fuente única. El JSON automático recoge el estado de los módulos de UI; el SQLite conserva tablas espejo de historias/recetas.

## 5. Mapa del código

| Ruta | Responsabilidad |
|---|---|
| `src/app/page.tsx` | Entrada/página principal de historia |
| `src/app/components/ClinicalHistoryPage.tsx` | Captura, guardado e impresión de historia clínica |
| `src/app/patient-records-management/` | Búsqueda, tabla, vista previa, órdenes e impresión de pacientes |
| `src/app/medical-orders/page.tsx` | Crear, editar, duplicar, estado, borrar e imprimir órdenes manuales |
| `src/app/components/PrescriptionTab.tsx` | Receta, medicamentos y órdenes vinculadas |
| `src/app/settings/page.tsx` | Médico, firma, catálogos, tema y ajustes de impresión |
| `src/app/export-import/page.tsx` | Exportación/importación, historial y respaldo |
| `src/app/audit/page.tsx` | Visualización y exportación de auditoría |
| `src/app/users/page.tsx` | Usuarios/roles locales (prototipo; ver limitaciones de seguridad) |
| `src/lib/localData.ts` | Auditoría y creación/serialización de snapshots automáticos |
| `src/lib/doctorPrintSettings.ts` | Lectura/validación de datos de cabecera y firma |
| `src/lib/printDocument.ts`, `printManualOrder.ts` | Impresión común y órdenes manuales |
| `src/lib/qrAttention.ts`, `QrAttention.tsx` | QR local de resumen clínico |
| `src-tauri/src/lib.rs` | Builder, inicialización y registro de comandos Tauri |
| `src-tauri/src/db.rs` | SQLite, espejo de historias/recetas y respaldos locales |
| `src-tauri/src/export.rs` | Diálogo nativo de guardado JSON/CSV |
| `database/migrations/001_initial/up.sql` | Esquema SQLite inicial |

## 6. Eventos internos

- `nefrohc:data-updated`: actualización de historia, pacientes u órdenes; dispara refresco y snapshot.
- `nefrohc:settings-updated`: ajuste del consultorio; dispara refresco del tema y snapshot.
- `nefrohc:catalogs-updated`: refresco de catálogos.
- `nefrohc:backup-status`: notificación en memoria de ruta/estado del snapshot.

## 7. Comandos Rust expuestos

- `init_database`: crea/verifica el archivo SQLite y esquema.
- `save_history_json`, `load_history_json`, `delete_history_json`: espejo de historias.
- `save_prescription_json`, `load_prescriptions_json`, `delete_prescription_json`: espejo de recetas.
- `backup_database`, `restore_database`: copias SQLite por ruta (funciones nativas existentes).
- `create_safety_backup`: respaldo automático JSON + SQLite, retención máxima 30.
- `restore_snapshot_mirror`: sincroniza historias/recetas restauradas a SQLite en una transacción.
- `save_export_file`: diálogo de guardado controlado para JSON/CSV.

## 8. Desarrollo, verificación y build en Windows

### Requisitos

Windows 10/11 x64; Node.js compatible (en este proyecto se probó Node 24.19.0 en el equipo del usuario), Rust estable, Visual Studio Build Tools con MSVC/Windows SDK y Developer PowerShell for Visual Studio. Mantener `@tauri-apps/api` y CLI alineados con la configuración instalada.

### Comandos, uno por vez

```powershell
npm install --include=optional
npm run type-check
npm run tauri:dev
npm run tauri:build
```

No encadenar instalación y build en una sola línea. No ejecutar `npm audit fix --force`. Para una versión nueva, usar una carpeta nueva `historia-clinica-desktop-integrada-vNN`; no reutilizar `src-tauri/target` de versiones anteriores.

Instalador NSIS esperado:

```text
src-tauri\target\release\bundle\nsis\Historia Clínica_<versión>_x64-setup.exe
```

Para actualizar, instalar sobre la versión existente conservando `co.nefrohc.desktop`; no desinstalar primero. Confirmar que el instalador terminó y que conserva el perfil local antes de dar por cerrado el release.

## 9. Seguridad y privacidad: asuntos pendientes

La versión actual no debe considerarse lista para historias clínicas reales:

1. Usuarios y contraseñas se almacenan y comparan en claro en `localStorage`; la autenticación/roles es cliente y no es una barrera de seguridad.
2. Existe un usuario demo precargado y credenciales de demostración hardcodeadas en el código.
3. Tauri tiene CSP configurada como `null`; requiere política restrictiva probada con el front-end.
4. La instalación de dependencias v46 reportó 14 vulnerabilidades npm (13 altas y 1 crítica), además de paquetes deprecados y cinco paquetes con scripts pendientes de aprobación. Deben analizarse y corregirse con actualizaciones revisadas; no usar `npm audit fix --force` a ciegas.
5. Los respaldos locales JSON/SQLite contienen datos clínicos y firma en claro; requieren controles del perfil, cifrado de disco, permisos, retención documentada y copia externa cifrada.
6. Revisar normativa colombiana aplicable a historia clínica y datos sensibles con el responsable de protección de datos/jurídico del consultorio; esta documentación no constituye certificación legal ni clínica.
7. La base de datos SQLite es actualmente un espejo parcial; debe definirse e implementarse una única fuente de verdad antes de operación multiusuario/servidor.

## 10. Checklist técnico de aceptación

- TypeScript: **pasó** `npm run type-check` en Windows después de las correcciones v46.
- `tauri:dev`: **pasó** en Windows antes y después del parche de restauración.
- Firma: **pasó** persistencia tras reinicio de desarrollo; usuario reportó que seguía visible tras instalar y en impresión.
- Respaldo JSON/SQLite: **pasó** existencia de pares, lectura JSON, `PRAGMA integrity_check=ok` en snapshot y base activa, con dato ficticio.
- Restauración JSON y sincronización SQLite espejo: **pasó** con el registro ficticio y 2 historias.
- QR y alergia larga: **pasó de forma acotada**, según confirmación del usuario; faltan otros lectores, paginación y formatos de papel.
- NSIS: **pasó** generación e instalación sobre la versión existente con `Do not uninstall`; usuario reportó datos y firma visibles.
- Timer de 5 minutos, retención 30, fallos de permisos/espacio, rollback completo, restauración de todas las colecciones, PDF/impresión física y exportaciones JSON/CSV: **pendiente/no cubierto**.
- Seguridad, vulnerabilidades priorizadas y revisión normativa: **pendiente; no aprobado para uso real**.
