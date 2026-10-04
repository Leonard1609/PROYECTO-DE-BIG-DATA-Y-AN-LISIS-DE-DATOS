# PROYECTO DE BIG DATA Y ANÁLISIS DE DATOS
Vacio como el alma de todo programador

Documentación Técnica del Proyecto: Plataforma Unificada de Módulos Cloud & Analytics
Resumen General del Sistema
Sistema web modular construido con React, TypeScript y Tailwind CSS, diseñado para integrar y centralizar la gestión de proyectos tecnológicos en CloudOps, Big Data y Reconocimiento Facial (Azure). El sistema implementa una arquitectura desacoplada basada en rutas relativas, estados locales/mock y proveedores de contexto, lista para conectarse a un API REST sin modificar la interfaz de usuario.

Fase 1: Arquitectura Base y Enrutamiento Centralizado
Enrutador Global Unificado: Configuración del punto de entrada en main.tsx dentro de un único <BrowserRouter>. Esto evita duplicidad de contexto y garantiza una sola fuente de verdad para la navegación.

Mapeo de Rutas Protegidas en App.tsx: Centralización de las rutas principales (/, /dashboard, /big-data/*, /cloud-ops, /azure, /proyecto/:id) con verificación automática del estado de autenticación.

Soporte para Subrutas Anidadas (/*): Implementación del comodín /* en el módulo de Big Data para permitir la navegación interna profunda (/big-data/cargas, /big-data/analisis, etc.) sin pérdida de estado ni errores de renderizado al recargar la página (F5).

Fase 2: Dashboard Principal y Control de Accesos (UX/UI)
Estructura Modular por Pestañas (Tabs): Creación de un panel central (DashboardPage.tsx) organizado en 4 secciones funcionales:

Gestión de Accesos: Control de usuarios activos, roles (ADMIN, ANALISTA) y solicitudes de activación.

Perfil: Información corporativa del usuario autenticado.

Proyectos: Catálogo interactivo con enrutamiento inteligente hacia los módulos especializados.

Mensajes e Informes: Módulo de comunicación y reportes.

Diseño 100% Adaptable y Responsive:

Menú lateral (Sidebar) tipo Drawer para dispositivos móviles con botón hamburguesa y fondo semi-transparente (backdrop).

Panel derecho dinámico (RightSidebar) que se oculta en pantallas medianas/pequeñas para maximizar el área de trabajo.

Ajuste de visibilidad y comportamiento adaptativo mediante clases utilitarias de Tailwind CSS.

Sistema de Roles y Permisos: Redirección automática de vista inicial según el rol detectado (ADMIN accede directo a Accesos; otros roles son dirigidos a Proyectos).

Fase 3: Integración de Módulos Especializados y Context API
Módulo CloudOps (CloudOpsModulePage):

Implementación de la arquitectura Context API mediante CloudOpsProvider para compartir el estado de infraestructura cloud de forma global.

Consumo seguro de datos operativos con el custom hook useCloudOps(), resolviendo dependencias de contexto a nivel de componente o ruta.

Módulo Reconocimiento Facial Azure (AzureModulePage):

Navegación basada en eventos mediante useNavigate para la simulación de flujos de análisis biométrico.

Módulo Big Data & Analítica (BigDataModulePage):

Sistema de navegación interna desacoplado del enrutador principal para la carga de datos, visualización de datasets y generación de informes.

Fase 4: Estrategia de Datos Simulados (Mock Data) e Integración Desacoplada
Gestión Local de Sesión: Implementación de authStorage en localStorage para persistir la sesión simulada del usuario, correos corporativos y roles sin depender de un token backend activo.

Estructura de Datos Mock Estructurada:

Mapeo de objetos JSON para simular respuestas de API (cuentasActivas, invitacionesSolicitudes, proyectos).

Preparación de controladores de eventos (handleAprobarActivar, handleSendInvite, handleEditarProyectoCuenta) capaces de alternar entre almacenamiento en memoria/local y llamadas fetch a endpoints REST (API_URL).

Enrutamiento Dinámico por Tipo de Proyecto: Matriz de decisiones que evalúa variables como id, titulo o codigo_nrc para redirigir automáticamente al módulo correspondiente (Big Data, Azure o CloudOps).

-- (MAPAS) npm install react-simple-maps d3-geo