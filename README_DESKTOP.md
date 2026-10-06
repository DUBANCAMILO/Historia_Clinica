# Historia Clínica — escritorio interno

## Requisitos

- Node.js 20+ y npm para la interfaz.
- Rust estable, `cargo` y las dependencias de compilación de Tauri 2 para producir instaladores Windows.
- SQLite no se instala aparte: `rusqlite` compila SQLite embebido dentro de Tauri.

## Instalación y ejecución

```bash
npm install
npm run dev                 # navegador, http://localhost:4028
npm run tauri:dev           # ventana Tauri + base local
```

La primera ejecución Tauri crea la base en el directorio de datos de la aplicación y ejecuta `database/migrations/001_initial/up.sql`. Las claves foráneas, checks, índices y triggers de `updated_at` están definidos en esa migración. El seed solo crea `admin.example` con el marcador `REPLACE_WITH_ARGON2ID_HASH`; no es una contraseña utilizable y debe sustituirse durante el flujo de instalación.

## Respaldo y restauración

La capa Rust expone los comandos `backup_database` y `restore_database` para que la interfaz de administración los conecte a un selector de archivos. El respaldo usa la API online backup de SQLite y es consistente incluso con WAL. No copiar manualmente el `.sqlite3` mientras la aplicación está abierta.

Para un respaldo manual seguro: usar el botón de respaldo de la aplicación, guardar el archivo fuera del directorio de datos y conservar fecha, responsable y checksum. Para restaurar: cerrar la aplicación, conservar una copia del archivo actual, restaurar un archivo verificado y volver a abrir; después revisar pacientes, auditoría y `PRAGMA integrity_check`.

## Verificación y empaquetado

```bash
npm run type-check
npm run build
npm run tauri:build
```

`npm run tauri:build` requiere Rust/Tauri y las herramientas Windows correspondientes; no se ejecutó ni se generó un `.exe` en este entorno. La autenticación, permisos de interfaz y los selectores visuales de respaldo aún deben conectar los comandos Tauri antes de uso operativo. La protección del archivo SQLite (cifrado en reposo, ACL del usuario de Windows y política de backups) debe definirse antes de manejar datos reales.
