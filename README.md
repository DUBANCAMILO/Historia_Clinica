# NefroHC — Historia Clínica Nefrológica e Interna

Aplicación de escritorio Windows en desarrollo para el consultorio del Dr. Hernando González Cortina. Está construida con Next.js/React y empaquetada con Tauri/Rust. Los datos se manejan localmente; no hay sincronización con nube configurada.

## Versión del código

**v46 · 0.1.5 — cambios de respaldo automático y documentación, pendientes de validación Windows.** El ZIP del proyecto es código fuente y documentos; no es un instalador.

## Documentación de entrega

- [Notas de versión v46](README_VERSION_46.md)
- [Manual de usuario](docs/MANUAL_USUARIO.md)
- [Documentación técnica y mapa del código](docs/DOCUMENTACION_TECNICA.md)
- [Estado y checklist de entrega](docs/ESTADO_ENTREGA.md)
- [Instalación y build Windows](INSTALACION_WINDOWS.md)

## Pruebas locales

Desde la raíz del proyecto, en Developer PowerShell for Visual Studio:

```powershell
npm install --include=optional
npm run type-check
npm run tauri:dev
npm run tauri:build
```

Ejecuta los comandos uno por uno. El instalador NSIS debería quedar bajo `src-tauri/target/release/bundle/nsis/` después de un build exitoso.

## Seguridad / uso clínico

La versión documentada aún no está certificada ni lista para datos clínicos reales. La autenticación de prototipo y contraseñas en claro, la CSP deshabilitada, las vulnerabilidades reportadas por npm y la necesidad de validar copias/restauración requieren resolución antes de un despliegue clínico. Usa solo información ficticia en pruebas.

Para el alcance, datos, respaldos, limitaciones y pasos de aceptación, leer `docs/ESTADO_ENTREGA.md` antes de distribuir.
