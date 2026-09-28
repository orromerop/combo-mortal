# Codificación - Integración de IA

## Objetivo de esta integración
Documentar cómo se utilizó IA para generar y completar código del proyecto El Combo Mortal, incluyendo prompts, herramientas y decisiones tomadas durante el proceso.

## Prompts que detonaron la codificación
1. "sistema está hehco en typescript… Queremos regenerarlo o migrarlo a html y con js… crea la nueva aplicaicon en otra carpeta llamda ‘ComboMortalNuevo’"
2. "EL proyecto… tiene toda la data quemada… forma sencilla, nada pesada y portable…"
3. "adelante y los json crealos en una carpeta Data"
4. "actualmente, la solucion lee data del archivo platillos.json... se requiere que tambien se cree los archivos necesario para almacenar los pedidos, estados..."

## Herramientas usadas
1. Exploración y análisis de código:
- read_file
- list_dir
- grep_search

2. Generación y edición de código:
- apply_patch
- create_file

3. Validación técnica:
- get_errors

## Qué generó la IA
1. Nueva aplicación portable en carpeta ComboMortalNuevo con:
- index.html
- styles.css
- app.js

2. Modelo de datos JSON en Data:
- config.json
- platillos.json
- pedidos.seed.json
- pedidos.json
- schema-data.md

3. Backend local para persistencia total en JSON:
- server.js con API local:
  - GET /api/health
  - GET /api/bootstrap
  - GET /api/state
  - PUT /api/state

4. Ajustes en frontend para dejar de depender de localStorage como fuente principal y persistir en Data/pedidos.json mediante API.

5. package.json local en ComboMortalNuevo para ejecución con Node + Express.

## Qué se decidió o cambió durante el proceso
1. Decisión de negocio/técnica tomada por el equipo:
- Migrar de stack TypeScript/React original a HTML + CSS + JS para portabilidad.

2. Decisiones de alcance durante iteración:
- Mantener solución liviana y ejecutable localmente.
- Externalizar catálogo y configuración a JSON.
- Persistir también pedidos y estados en JSON en disco para funcionalidad completa.

3. Ajustes sobre la propuesta inicial de IA:
- Inicialmente la app quedó con estado en localStorage; luego se cambió a persistencia en archivos JSON reales con backend local.
- Se añadió archivo operativo pedidos.json y recuperación desde seed si el estado no existe o está inválido.

## Evidencia de resultado
1. Estructura implementada en ComboMortalNuevo operando con datos de Data.
2. Flujo de negocio codificado de punta a punta:
- Menú
- Checkout
- Seguimiento de orden
- Cocina
- Administración
- Exportación/importación de respaldo
