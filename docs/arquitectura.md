# Arquitectura inicial

React/TypeScript consume una API ASP.NET Core. La API concentra validación, autorización y reglas de negocio; EF Core persiste en SQL Server. No se confía en el ocultamiento de botones para proteger operaciones.

## Entidades iniciales
- Usuario: identidad, rol, estado.
- Miembro: id interno, código de barras único, nombre, contacto y datos de inscripción.
- Plan: nombre, duración y precio vigente.
- Membresía: miembro, plan, fechas de inicio y fin, historial de renovaciones.
- Pago: miembro, membresía, importe, fecha, período, método, estado y usuario que lo registró.
- Asistencia: miembro, fecha y hora, usuario que registró la entrada.
- Gasto, Empleado, Clase y Entrenador en módulos posteriores.

## Código de barras
El código visible se almacena como texto, con índice único en SQL Server. La generación ocurre en el servidor dentro de una operación segura ante registros concurrentes. Se usa Code 128 para imprimirlo. La búsqueda exacta por código debe ser rápida. Un código importado existente se conserva si es único; el generador no debe producir futuros valores que colisionen con códigos heredados. El código se conserva durante renovaciones y se exporta como texto a Excel.

## Excel heredado
Importar primero a vista previa: mapear encabezados y columnas mensuales, validar fechas y montos, detectar duplicados por código y posibles coincidencias de persona, y ofrecer confirmación. Cada columna de cobro se transforma en un pago fechado con período explícito cuando los datos lo permitan; no inventar fechas ni estados ausentes. Reportar filas rechazadas. Ejecutar importación idempotente para evitar cobros duplicados al repetir un archivo. Exportar miembros y pagos en hojas separadas, con control de acceso.

## Reglas críticas
- La vigencia se deriva de fechas de membresía; deuda y vigencia son conceptos distintos.
- Registrar renovación y pago en una transacción; conservar auditoría de correcciones.
- El acceso del empleado se limita en la API. Pendiente confirmar si puede registrar cobros sin ver resumen financiero.
- Respaldos, restauración probada, HTTPS y secretos fuera del repositorio antes de producción.
