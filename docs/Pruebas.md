# Pruebas - Integración de IA

## Objetivo de esta integración
Documentar cómo la IA se utilizó para generar casos de prueba funcionales y cubrir escenarios de borde en el proyecto.

## Prompts que detonaron pruebas
1. "podemos ejecutar el playwrigth a ese archivo?"
2. "y si te paso el url donde se encuentra publicada, podras?"
3. "puedes ejecutarlo de nuevo"
4. "ejecuta el playwrigth completo de este nuevo proyecto"
5. "correlo de nuevo pero completo"

## Herramientas usadas
1. Pruebas en navegador y automatización:
- open_browser_page
- read_page
- click_element
- type_in_page
- navigate_page
- run_playwright_code

2. Soporte para entorno de ejecución local:
- run_in_terminal

## Qué generó la IA
1. Casos de prueba funcionales sobre URL publicada y sobre versión local.

2. Cobertura del flujo principal end-to-end:
- Carga de menú
- Filtros (todos, disponibles, no disponibles)
- Carrito y conteo
- Validaciones de checkout
- Pago simulado
- Creación de orden
- Cambio de estado en cocina
- Entrega en administración
- Verificación en filtro entregado

3. Cobertura de bordes relevantes:
- Intento de pago sin datos requeridos
- Normalización de estado para pruebas repetibles
- Reinicio de estado/localStorage para reducir falsos negativos

4. Reportes de resultados de ejecución:
- Confirmación de orden generada
- Confirmación de visibilidad por estado
- Resultado final de corrida completa

## Qué se decidió o cambió durante el proceso
1. Decisión operativa:
- Probar primero en URL publicada cuando el entorno corporativo no permitió levantar Node localmente.

2. Ajustes para estabilidad de pruebas:
- Forzar filtro de administración en TODOS antes de validar entrega.
- Limpiar estado previo para pruebas determinísticas.

3. Evolución de cobertura:
- Se pasó de validaciones puntuales a corridas completas end-to-end repetidas.

## Evidencia de resultado
1. Se validó repetidamente el flujo crítico completo.
2. Se detectaron y corrigieron incidencias de prueba (por ejemplo, efectos de filtro activo y elementos de UI ocultos que interferían).
3. Se dejó un patrón reproducible para regresión funcional del proyecto.
