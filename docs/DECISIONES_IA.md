# DECISIONES_IA

Registro de uso de IA en el proyecto El Combo Mortal.

Criterio de registro:
- Se documenta una fila por cada producción de IA que llegó al proyecto (código, datos o documentación).
- Se incluye qué se pidió, con qué herramienta se hizo, si se aceptó y qué ajustes manuales se aplicaron.

## 1) Producciones de IA que llegaron al proyecto

| ID | Fecha aprox. | Qué se pidió a la IA | Resultado generado por IA | Herramienta usada | ¿Se aceptó? | ¿Qué se cambió a mano después? | Evidencia en proyecto |
|---|---|---|---|---|---|---|---|
| IA-001 | 2026-09-24 | Migrar la app a HTML/CSS/JS portable en carpeta nueva | Estructura base de app estática con navegación por hash | create_file, apply_patch | Sí | Ajustes menores de texto y flujo durante iteración | index.html, styles.css, app.js |
| IA-002 | 2026-09-24 | Externalizar datos a JSON en carpeta Data | Archivos config.json, platillos.json, pedidos.seed.json y guía schema-data.md | create_file, apply_patch | Sí | Se corrigieron valores y descripciones en catálogos durante pruebas | Data/config.json, Data/platillos.json, Data/pedidos.seed.json, Data/schema-data.md |
| IA-003 | 2026-09-24 | Resolver bloqueo de lightbox que interfería clics | Regla CSS para ocultar overlay cuando hidden | apply_patch | Sí | Sin cambio manual posterior reportado | styles.css |
| IA-004 | 2026-09-24 | Hacer flujo funcional de menú/checkout/cocina/admin | Lógica completa de estado, carrito, órdenes y reportes en frontend | apply_patch | Sí | Se ajustaron labels/formatos y validaciones en iteraciones | app.js |
| IA-005 | 2026-09-24 | Agregar respaldo operativo | Exportar e importar respaldo JSON desde panel admin | apply_patch | Sí | Se validó formato y mensajes en pruebas manuales | app.js |
| IA-006 | 2026-09-24 | Persistencia total en archivos JSON (sin BD) | Backend local Express con endpoints /api/health, /api/bootstrap, /api/state, escritura atómica y cola de escritura | create_file | Sí | Ajustes menores de ejecución al instalar dependencias | server.js |
| IA-007 | 2026-09-24 | Guardar pedidos/estados en archivo operativo | Estado operativo en Data/pedidos.json | create_file | Sí | Se permite regeneración desde seed cuando el estado es inválido | Data/pedidos.json |
| IA-008 | 2026-09-24 | Conectar frontend con API local para persistencia en disco | Migración de app.js: de estado local a lectura/escritura por API | apply_patch | Sí | Revisión de mensajes y fallback de errores en arranque | app.js |
| IA-009 | 2026-09-24 | Preparar ejecución local del módulo nuevo | package.json con scripts start/dev y dependencia express | create_file | Sí | npm install generado por equipo en entorno local | package.json |
| IA-010 | 2026-09-24 | Documentar funcionamiento técnico del sistema | Documento técnico de arquitectura, ejecución e integraciones IA | create_file | Sí | Corrección ortográfica al español y limpieza de duplicados | docs/DocumentacionTecnica.md |
| IA-011 | 2026-09-24 | Documentar cada integración IA por separado | Documentos Codificación.md, Pruebas.md, Optimización de código.md | create_file | Sí | Reubicación a carpeta docs | docs/Codificación.md, docs/Pruebas.md, docs/Optimización de código.md |
| IA-012 | 2026-09-24 | Validar flujo completo varias veces con Playwright | Casos E2E ejecutados y correcciones de estabilidad en flujo | run_playwright_code, click_element, type_in_page, read_page | Sí | Ajustes en filtro admin y preparación de estado de prueba | Cambios reflejados en app.js y en decisiones funcionales |

## 2) Propuestas de IA rechazadas o no adoptadas por el equipo

| ID | Qué propuso la IA | Motivo de rechazo/no adopción | Decisión final del equipo |
|---|---|---|---|
| REJ-001 | Ejecutar el proyecto original TypeScript en local con Node/npm en máquina corporativa | Restricción de políticas corporativas al inicio del proyecto | Migrar a versión portable y operar sobre app estática + backend local liviano |
| REJ-002 | Mantener persistencia principal en localStorage (primera iteración) | No cumplía requisito de guardar/leer toda la operación desde archivos JSON en disco | Migrar persistencia a Data/pedidos.json vía API local |
| REJ-003 | Mantener documentación dispersa en raíz del workspace | Dificulta organización y entrega del módulo nuevo | Centralizar documentación dentro de ComboMortalNuevo/docs |

## 3) Notas de trazabilidad

- Este registro resume decisiones efectivas observables en el estado actual del proyecto.
- Cuando una producción de IA tuvo varias iteraciones, se registró como una sola decisión consolidada para evitar duplicidad.
- Recomendación: actualizar este archivo en cada sprint con nuevos IDs incrementales (IA-013, IA-014, etc.).
