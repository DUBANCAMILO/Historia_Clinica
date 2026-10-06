# Historia Clínica — Aplicación de escritorio interna

Esta carpeta es la versión de escritorio para Windows, preparada para empaquetarse con Tauri.
La base de datos local prevista es SQL mediante PostgreSQL local o SQLite embebido, según el modo de instalación final.

## Objetivo

- Programa instalable `.exe`.
- Uso interno sin depender de un navegador.
- Interfaz clínica reutilizable.
- Base de datos local/controlada.
- Posibilidad posterior de conectarse al servidor central.

## Desarrollo

La interfaz se ejecuta con Next.js. Para generar el instalador final se requiere instalar Node.js, Rust y Tauri en un equipo de desarrollo.

Antes de producción hay que definir si el equipo será autónomo con SQLite o cliente de un PostgreSQL central de la red.
