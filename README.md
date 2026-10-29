# JP GYM

Proyecto de sistema administrativo para una sede de gimnasio. La rama actual incluye un prototipo frontend con React y TypeScript para explorar flujos de miembros, membresías y operación diaria.

## Estado actual

- Frontend de demostración disponible en `frontend/`.
- Acceso simulado con perfiles Administrador y Recepción; no es autenticación de producción.
- Gestión de miembros y membresías mediante estado local de React. Los cambios de esos flujos se pierden al recargar.
- Vistas para dashboard, check-in, asistencia, pagos, entradas diarias, gastos, cierre diario, empleados, entrenadores, clases y analíticas. La presencia de una vista no implica un flujo completo conectado a servidor.
- `backend/` contiene únicamente una nota de implementación pendiente en esta rama. ASP.NET Core, Entity Framework Core y SQL Server corresponden a la arquitectura prevista, no a un backend publicado aquí.

## Tecnologías

Implementadas en el frontend: React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · react-qr-code · Oxlint.

Arquitectura backend prevista: C# · ASP.NET Core · Entity Framework Core · SQL Server.

## Ejecución local

Requisitos: Git, Node.js compatible con Vite 8 y npm.

```bash
git clone https://github.com/Guille232/jp-gym.git
cd jp-gym/frontend
npm ci
npm run dev
```

Abre la dirección indicada por Vite. La pantalla de acceso incluye botones y credenciales de demostración para explorar ambos perfiles. Utiliza datos ficticios al probar los formularios.

## Flujos para explorar

1. Entrar con un perfil de demostración.
2. Consultar y buscar miembros por nombre, código o teléfono.
3. Crear y editar una ficha en memoria.
4. Registrar una membresía de demostración y consultar su historial.
5. Explorar las vistas de operación y las diferencias de navegación entre perfiles.

Los permisos del prototipo son controles de interfaz; la autorización real y la persistencia deben implementarse y validarse en servidor.

## Comandos del frontend

Desde `frontend/`:

- `npm run dev`: desarrollo.
- `npm run build`: comprobación TypeScript y compilación.
- `npm run lint`: análisis estático con Oxlint.
- `npm run preview`: previsualización de la compilación.

## Estructura y planificación

- `frontend/src/features/`: módulos por área funcional.
- `frontend/src/components/layout/`: estructura y navegación.
- [Arquitectura](docs/arquitectura.md).
- [Backlog de trabajo](docs/backlog-jira.md).
- `backend/`: espacio reservado para la API.

## Desarrollo en equipo

1. Crear una tarea Jira por cambio y definir criterios de aceptación.
2. Actualizar `main` y crear una rama `feature/JP-123-descripcion` o `fix/JP-123-descripcion`.
3. Hacer commits pequeños y abrir un pull request hacia `main` con enlace a la tarea Jira.
4. Solicitar revisión y comprobar el cambio antes de fusionar.
5. Mantener contraseñas, cadenas de conexión reales y archivos de clientes fuera del repositorio.

## Autor

[Guillermo Enrique Cabrera Forbes](https://github.com/Guille232) · Desarrollo de Software, ITLA.

## Validación

La documentación describe el código disponible. No se ha ejecutado la aplicación ni verificado un despliegue como parte de esta actualización.
