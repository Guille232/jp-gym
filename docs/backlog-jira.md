# Backlog inicial para Jira

Proyecto sugerido: JP GYM, clave sugerida: JPGYM. Estados: Por hacer → En curso → En revisión → Terminado. Asignar responsables al crear las cuentas del equipo.

| Épica | Historia | Prioridad | Criterio de aceptación resumido |
|---|---|---|---|
| Base técnica | Crear solución API, frontend y configuración local | Alta | Ambos ejecutan el proyecto con instrucciones y secretos locales. |
| Seguridad | Inicio de sesión y roles Administrador/Empleado | Alta | La API deniega gastos, empleados, clases y finanzas al empleado. |
| Miembros | Registrar y buscar miembros | Alta | Datos validados, búsqueda por nombre y código. |
| Miembros | Generar código de barras único | Alta | Persistido, imprimible, sin duplicados bajo concurrencia y exportable. |
| Membresías | Configurar planes e inscribir miembros | Alta | Precio y fechas quedan registrados. |
| Membresías | Renovar y registrar cobro | Alta | Historial intacto; operación atómica; saldo y vigencia distinguibles. |
| Recepción | Check-in mediante lector o entrada manual | Alta | Búsqueda exacta, estado visible y entrada registrada. |
| Migración | Vista previa e importación Excel | Alta | Mapeo, errores por fila, duplicados e idempotencia. |
| Reportes | Exportar miembros, membresías y pagos | Media | Excel legible, código como texto, acceso según rol. |
| Administración | Gastos, empleados, clases y entrenadores | Media | CRUD autorizado para administrador. |
| Dashboard | Indicadores y alertas | Media | Cifras calculadas desde datos reales y fechas actuales. |
| Operación | Copias, restauración y despliegue | Alta | Restauración probada y acceso seguro en entorno final. |

## Primera división sugerida
- Persona A: API, modelo de datos, autenticación y generación segura del código.
- Persona B: React, pantallas de inicio de sesión, miembros y búsqueda/escaneo.
- Integración conjunta: contratos API, revisión de PR, flujo completo y migración Excel.

La asignación definitiva dependerá de la experiencia y disponibilidad de cada integrante.
