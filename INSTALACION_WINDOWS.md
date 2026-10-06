# Instalación, prueba y compilación de NefroHC en Windows

**Estado de v46 / producto 0.1.5:** compilada e instalada sobre una versión existente en un equipo Windows para prueba interna. Se verificaron funciones básicas con datos ficticios. El ZIP de fuentes no es el instalador. No está aprobada para producción clínica; ver `docs/ESTADO_ENTREGA.md` y `docs/REGISTRO_PRUEBAS_WINDOWS_V46.md`.

## Mantener datos existentes

- Extrae el ZIP en una carpeta nueva, por ejemplo `C:\Users\kamil\OneDrive\Escritorio\historia-clinica-desktop-integrada-v46`.
- No extraigas sobre v45 ni reutilices su carpeta `src-tauri\target`.
- Conserva el identificador Tauri `co.nefrohc.desktop`: cambiarlo puede crear otro perfil de datos en lugar de actualizar el existente.
- Antes de cambiar de versión, crea y exporta un respaldo JSON externo. No desinstales la versión estable mientras verificas la nueva.

## Requisitos

- Windows 10/11 de 64 bits.
- Node.js (el equipo ha usado Node 24.19.0; si un enlace nativo falla, registrar el mensaje exacto antes de cambiar de versión).
- Rust estable con `rustup`.
- Visual Studio Build Tools con la carga **Desktop development with C++**, MSVC y Windows SDK.
- **Developer PowerShell for Visual Studio** con el entorno de herramientas cargado.

## Preparar y verificar (un comando por vez)

Abre Developer PowerShell for Visual Studio y cambia al directorio nuevo del proyecto. Ejecuta cada comando individualmente:

```powershell
npm install --include=optional
npm run type-check
npm run tauri:dev
```

El primer build de Rust puede tardar. No cierres la terminal hasta que se abra la aplicación. Usa datos ficticios durante toda la validación.

Si `npm install` informa vulnerabilidades, conserva el reporte de `npm audit` para revisión. **No ejecutes `npm audit fix --force`**; una actualización forzada puede introducir incompatibilidades.

## Prueba requerida de respaldo y firma

1. Inicia sesión y abre **Respaldo y restauración**; comprueba que aparezcan la ruta JSON y, en escritorio, la ruta SQLite.
2. Pulsa **Crear respaldo ahora**. Confirma que se muestre la hora del último respaldo confirmado por la aplicación y comprueba que ambos archivos existen.
3. Modifica datos ficticios y comprueba si el cambio genera o verifica una copia. Cierra y vuelve a abrir para comprobar que el respaldo no depende de permanecer en esa pantalla.
4. Sube una firma de prueba en **Configuración del consultorio**, pulsa **Guardar configuración**, reinicia la app y comprueba que sigue visible.
5. Verifica que la firma aparece tanto en la vista previa de Historia desde Pacientes como en historia, receta y órdenes impresas; confirma nombre, especialidad y registro.
6. Exporta un JSON y restaura únicamente en datos de prueba. Comprueba historias, órdenes, evolución, catálogos y firma.
7. En una copia de prueba, valida que antes de borrar una historia, una orden o todos los datos se confirme un backup. No ensayes fallos de permisos en un perfil con información importante.

## Crear instalador de prueba

La v46 ya produjo un NSIS interno. Repetir el build no implica aprobación de seguridad ni uso clínico. Mantén datos ficticios hasta completar la revisión de dependencias, autenticación y CSP. Para reproducir el artefacto de prueba:

```powershell
npm run tauri:build
```

El instalador NSIS se espera bajo:

```text
src-tauri\target\release\bundle\nsis\Historia Clínica_0.1.5_x64-setup.exe
```

No asumir que se creó por ejecutar el comando: revisa que la compilación termine sin errores y que el `.exe` exista. En la prueba v46 del 2026-10-05 se generó un instalador de 3,54 MiB; SHA-256 `5973DF7F5B8A35C7983EF770F2CC12DFE7FFAB4BAC2F754C0E4CDAFF5300B788`. El ZIP de fuentes no instala la aplicación.

## Actualizar y conservar datos

Para la prueba v46 se eligió **Do not uninstall**; el usuario informó que la app abrió y conservó datos/firma visibles. Antes de repetir una actualización, conserva una copia privada y protegida, instala sobre la anterior manteniendo `co.nefrohc.desktop`, y nunca desinstales primero la versión estable. La copia local no cifrada no equivale a respaldo externo seguro.

## Limitaciones de seguridad relevantes

NefroHC todavía no se debe usar para almacenar datos reales de pacientes: la autenticación guarda/compara contraseñas en texto claro en `localStorage`, hay una cuenta demo codificada, la CSP de Tauri está deshabilitada y la instalación v46 reportó 14 vulnerabilidades npm (13 altas y 1 crítica). Los respaldos locales tampoco están cifrados por la aplicación. Deben corregirse y revisarse profesionalmente antes de uso clínico. Consulta `docs/ESTADO_ENTREGA.md`.
