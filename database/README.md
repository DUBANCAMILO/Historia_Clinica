# Base local SQLite

La aplicación de escritorio usa un archivo SQLite local en el directorio de datos de la aplicación (`historia-clinica.sqlite3`). La migración `migrations/001_initial/up.sql` activa claves foráneas, WAL y sincronización completa, crea las tablas e índices y carga únicamente un usuario de ejemplo sin contraseña real. `REPLACE_WITH_ARGON2ID_HASH` debe reemplazarse por un hash Argon2id generado por la aplicación; nunca guardar contraseñas en texto plano.

La base debe abrirse exclusivamente mediante la capa Tauri. No se debe copiar el archivo mientras esté abierto: usar la orden de respaldo para obtener una copia consistente. Para restaurar, cerrar la aplicación, conservar una copia del archivo actual y reemplazarlo por un respaldo verificado; luego iniciar y validar la integridad.
