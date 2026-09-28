# JP GYM · Sistema administrativo

Aplicación web administrativa para una sede de JP GYM.

## Stack previsto
- API: ASP.NET Core (C#), Entity Framework Core, SQL Server
- Interfaz: React, TypeScript, Vite
- Pruebas: API y flujos críticos según se implementen

## Alcance
Miembros y códigos de barras únicos; planes, inscripciones y renovaciones; check-in y asistencia; pagos; gastos; empleados; clases; panel y reportes; importación y exportación de Excel. Dos roles: Administrador y Empleado. El empleado consulta y registra miembros y renovaciones, sin acceso a gastos, empleados, clases ni reportes financieros.

## Desarrollo en equipo
1. Crear una tarea Jira por cambio y definir criterios de aceptación.
2. Actualizar `main` y crear una rama `feature/JP-123-descripcion` o `fix/JP-123-descripcion`.
3. Hacer commits pequeños; abrir pull request hacia `main` con enlace a la tarea Jira.
4. El otro integrante revisa y prueba el cambio. Fusionar tras revisión y comprobaciones automatizadas.
5. Nunca subir contraseñas, cadenas de conexión reales ni el Excel de clientes. Usar datos ficticios en desarrollo.

## Inicio pendiente
El código ejecutable se generará cuando se confirme la cuenta de GitHub, el entorno de despliegue y la versión de .NET disponible para ambos desarrolladores. La plantilla de importación se cerrará al revisar el Excel original.

Consulta `docs/arquitectura.md` y `docs/backlog-jira.md`.
