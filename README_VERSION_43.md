# NefroHC v43 — ventana de consola oculta

- Corrección visual: el ejecutable de producción en Windows se marca como aplicación GUI (`windows_subsystem = "windows"`) para que no aparezca una consola negra detrás de NefroHC.
- Conserva la exportación JSON/CSV con el diálogo nativo de Windows de v42.
- Versión de producto elevada a 0.1.2 para distinguir el nuevo instalador.

La aplicación de consola que apareció con v42 es un efecto del ejecutable sin el atributo de subsistema Windows. La pantalla clínica sí se abre; al instalar v43 por encima de v42 se debe ocultar esa ventana. Crear y probar el instalador requiere compilar en Developer PowerShell for Visual Studio.
