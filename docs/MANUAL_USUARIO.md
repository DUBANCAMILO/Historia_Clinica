# Manual de usuario — NefroHC

**Versión documentada:** v46 · 0.1.5 (instalador generado e instalado; validación funcional inicial en Windows con datos ficticios; no aprobada para producción clínica).  
**Aplicación:** Historia Clínica Nefrológica e Interna, uso local en Windows.

## 1. Propósito y límites

NefroHC organiza historias clínicas, pacientes, medicamentos y órdenes médicas para el consultorio. Los laboratorios, paraclínicos y procedimientos se solicitan a proveedores externos: el programa no recibe ni valida sus resultados. Las decisiones clínicas y la revisión de cada registro corresponden al profesional tratante.

La aplicación almacena la información en el equipo. No la sube a una nube del producto. Los respaldos automáticos también se guardan localmente y no sustituyen una copia externa cifrada.

## 2. Inicio de sesión y cierre

1. Abre **Historia Clínica** desde el menú Inicio de Windows.
2. Ingresa con el usuario configurado para el equipo.
3. Al cerrar y volver a abrir, la aplicación pide iniciar sesión otra vez.
4. Cierra desde los controles de la aplicación o la ventana de Windows; no apagues el equipo mientras se guarda o se respalda información.

**Importante:** la versión actual usa autenticación local de demostración y mantiene las contraseñas en el almacenamiento del navegador. No la uses con datos clínicos reales hasta reemplazar ese mecanismo por autenticación segura.

## 3. Pacientes e historia clínica

1. Entra a **Historia clínica** para iniciar una atención en blanco o selecciona un paciente existente.
2. Completa identificación, antecedentes, motivo, enfermedad actual, examen, laboratorios disponibles, análisis y plan.
3. Revisa documento, nombre y fecha antes de guardar.
4. Pulsa **Guardar historia** y espera el aviso de confirmación. En la versión de escritorio el aviso debe indicar guardado en SQLite y en la copia local.
5. Abre **Pacientes** para buscar, revisar la línea de atenciones e imprimir la historia.
6. El borrado de una historia solicita confirmación y debe crear un respaldo antes de eliminarla.

Los resultados externos pueden anotarse en la historia; NefroHC no reemplaza el sistema del laboratorio que los procesa.

## 4. Órdenes médicas y receta

1. Selecciona al paciente y la historia a la que vincularás la orden.
2. Registra en el mismo formulario medicamentos, laboratorios externos, paraclínicos/exámenes y otras órdenes o controles.
3. Usa códigos institucionales confirmados; deja el código vacío o “por confirmar” si no existe uno. No inventes códigos oficiales.
4. Guarda la orden y confirma que aparece vinculada al paciente.
5. La impresión organiza las categorías separadamente. Revisa el paciente, documento, fecha, dosis, vía, frecuencia, duración e indicaciones antes de entregarla.

## 5. Firma del médico

La firma **no se debe volver a subir en cada historia**:

1. Entra a **Configuración del consultorio → Firma para documentos**.
2. Selecciona la imagen PNG/JPG de la firma.
3. Pulsa **Guardar configuración** al final de la página. Subir la imagen sin guardar conserva solo el cambio temporal de la pantalla.
4. La imagen queda en la configuración local de ese perfil de Windows. La vista previa de historia desde Pacientes usa la misma configuración de firma que las demás impresiones. En la prueba v46 la firma persistió tras reiniciar la app y se vio en Configuración e impresión.
5. La firma también se incluye en la exportación/respaldo JSON. Si se reinstala Windows, se cambia de perfil o se restaura un equipo nuevo, importa ese respaldo o vuelve a subirla.

La captura de una firma no se convierte por sí sola en firma predeterminada: el usuario debe elegir el archivo en Configuración y guardar. Antes de usar documentos firmados, verifica que la imagen sea la autorizada por el médico y que no tape el nombre o el registro.

## 6. Respaldo y restauración

### Respaldo automático de escritorio

- Se inicia después de iniciar sesión.
- Intenta guardar al iniciar, después de cambios clínicos/configuración y cada cinco minutos mientras la aplicación está abierta.
- En Windows guarda un JSON restaurable y una copia SQLite en una carpeta privada de datos de NefroHC; conserva hasta las 30 copias más recientes.
- Si el contenido no cambió, puede reutilizar el último JSON en vez de crear duplicados.
- En **Respaldo y restauración** se muestra la hora y la ruta del último respaldo que confirmó la aplicación.
- En la misma pantalla, **Crear respaldo ahora** fuerza una copia nueva.

La ubicación concreta se muestra dentro de la aplicación. Habitualmente estará bajo el directorio de datos de la aplicación de Windows y en `automatic-backups`; no muevas ni edites archivos de esa carpeta manualmente.

### Copia externa recomendada

1. Entra a **Respaldo y restauración**.
2. Pulsa **Exportar JSON completo** y guarda el archivo en una unidad externa cifrada o en una ubicación aprobada por el consultorio.
3. Conserva al menos una copia fuera del computador. Los respaldos automáticos locales no protegen contra daño, robo o pérdida total del equipo.
4. No envíes historias o respaldos por correo o mensajería no autorizados.

### Restaurar un JSON

1. Escoge **Importar respaldo JSON** y selecciona el archivo.
2. Revisa la vista previa y el número de historias/recetas/valoraciones.
3. Confirma solo si el archivo pertenece al consultorio y es el respaldo correcto.
4. El programa debe generar primero una copia de seguridad del estado actual; si falla, cancela la restauración.
5. Tras restaurar, revisa pacientes, firma, órdenes y configuración. En escritorio la restauración también sincroniza historias/recetas con el espejo SQLite; se probó con datos ficticios en v46.

La restauración reemplaza datos existentes de las colecciones incluidas en el archivo. Haz una exportación actual antes de restaurar.

## 7. Impresión y QR

1. Revisa el documento en la vista previa y selecciona papel, orientación y márgenes en **Configuración del consultorio**.
2. Confirma que la cabecera tenga nombre del profesional, registro, contacto y QR.
3. Comprueba que textos largos, especialmente alergias y evolución, permanezcan dentro del ancho de página.
4. En la ventana de impresión selecciona impresora y tamaño de papel correctos.
5. Haz una impresión de prueba antes de usar el formato con pacientes.

El QR contiene un resumen reducido de la atención y no sube la historia clínica a una nube. En la prueba de v46 el usuario informó que el QR de la historia ficticia aparecía y se podía escanear. Aun así, el código expone información personal a quien lo escanee o reciba una foto del documento. No imprimas ni compartas documentos con personas no autorizadas; verifica qué información muestra el lector de tu teléfono.

## 8. Auditoría

El módulo **Auditoría** permite revisar y exportar eventos locales, como accesos, cambios, eliminaciones, respaldos y restauraciones. La auditoría local no equivale a un registro inmutable ni a una garantía de cumplimiento normativo.

## 9. Cierre, protección y rutina recomendada

- Usa una cuenta de Windows individual, con contraseña y bloqueo de pantalla.
- Cifra el disco (por ejemplo, BitLocker cuando esté disponible y configurado por el administrador).
- Mantén las copias externas en almacenamiento cifrado y con acceso restringido.
- Revisa la ruta y la fecha del último respaldo al comienzo de la jornada.
- Crea/exporta una copia externa al final de cada jornada.
- No borres `automatic-backups` sin tener una copia externa probada.
- Usa exclusivamente datos ficticios mientras la autenticación, CSP y dependencias no hayan sido revisadas y corregidas.

## 10. Guía rápida de prueba

1. Guardar historia de prueba y confirmar que aparece en Pacientes.
2. Cerrar y volver a abrir la aplicación; confirmar que los datos siguen allí y que se solicita login.
3. Subir la firma de prueba, pulsar Guardar configuración y reiniciar; verificar que permanece.
4. Revisar la ruta del respaldo automático; pulsar **Crear respaldo ahora** y confirmar nuevos archivos JSON y SQLite.
5. Exportar un JSON, importar una copia de prueba en entorno no clínico y revisar los conteos.
6. Probar impresión de historia y orden, incluidos alergias largas y lectura QR.
7. Para v46 se probó la instalación sobre la versión anterior con la opción **Do not uninstall**; el usuario informó que los datos y la firma seguían visibles. Antes de actualizar, conserva una copia protegida.

Para detalles de instalación, compilación y código, consulta `DOCUMENTACION_TECNICA.md` y `ESTADO_ENTREGA.md`.
