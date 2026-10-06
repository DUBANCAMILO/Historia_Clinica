CORRECCION V6 - Historia Clinica de Escritorio

Se corrigio el error de compilacion de Rust en src-tauri/src/db.rs:
error[E0597]: `from`/`to` does not live long enough

La copia y restauracion SQLite ahora mantienen el objeto Backup en una variable
local y lo liberan antes de cerrar las conexiones. Esto permite compilar con
rusqlite 0.32 y Tauri 2.

Prueba en Windows (Developer PowerShell for Visual Studio):

1. Detener ejecuciones anteriores con Ctrl+C.
2. Descomprimir este ZIP en una carpeta limpia.
3. Abrir Developer PowerShell for Visual Studio.
4. Entrar a la carpeta del proyecto.
5. Ejecutar:

   npm install
   npm run tauri:dev

Para generar el instalador:

   npm run tauri:build

El primer build de Rust puede tardar varios minutos.
