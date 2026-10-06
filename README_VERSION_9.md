# Versión 9 — historia, usuarios y numeración

- El editor de historia conserva fondo blanco y texto oscuro también con el tema oscuro.
- EPS y ciudad ahora se seleccionan mediante listas desplegables.
- Edad, peso, talla, creatinina, BUN, presión, peso actual y glucometría muestran unidades fijas; el médico escribe solo el número cuando corresponde.
- La dosis de medicamentos usa número y unidad separada (mg, g, mcg, UI o mL).
- El número HC se asigna automáticamente usando el primer número disponible: si se elimina el HC 003, la siguiente historia puede reutilizar 003; si no hay huecos, aumenta al siguiente.
- Borrar una historia la elimina también de SQLite cuando se usa Tauri.
- El menú inicia contraído y se expande con la flecha; el diseño se adapta a pantallas pequeñas.
- Login protegido: las pantallas internas redirigen al login cuando no existe una sesión.
- Se agregó gestión local de usuarios y roles: Administrador, Médico, Auxiliar y Consulta.
- El usuario administrador inicial es `hergoncor123@gmail.com` con contraseña temporal `NefroHC2026!`; cámbiala antes de uso real.
- La pantalla de carga del login es breve y se conserva el modo de carga al imprimir.
