# Optimización de código - Integración de IA

## Objetivo de esta integración
Documentar cómo se aplicó IA para mejorar calidad, robustez y mantenibilidad del código durante la evolución del proyecto.

## Prompts que detonaron optimización
1. "EL proyecto… tiene toda la data quemada… forma sencilla, nada pesada y portable…"
2. "adelante y los json crealos en una carpeta Data"
3. "se requiere ... 100% funcional y se guarda y lea toda la información desde los archivos json"
4. "Actualizar las historias de usuario en función del modelo de portabilidad de la solución"

## Herramientas usadas
1. Refactor y mejoras estructurales:
- apply_patch
- create_file

2. Análisis y documentación técnica:
- read_file
- grep_search
- list_dir

3. Verificación posterior a cambios:
- get_errors
- run_playwright_code

## Qué generó la IA
1. Rediseño de persistencia:
- De estado mixto/simulado a persistencia operativa en JSON real.
- Incorporación de Data/pedidos.json como fuente de verdad operativa.

2. Mejora de confiabilidad de escritura:
- API local con serialización de escrituras.
- Escritura atómica en archivo JSON (temporal + reemplazo).

3. Mejora de tolerancia a fallos:
- Validación de estructura del estado.
- Regeneración desde pedidos.seed.json cuando pedidos.json es inválido o no existe.

4. Mejora de mantenibilidad:
- Separación explícita entre UI, API y capa de datos.
- Documentación de esquema y flujo de datos actualizados.

## Qué se decidió o cambió durante el proceso
1. Decisión técnica del equipo:
- Mantener una solución portable basada en archivos (sin base de datos externa).

2. Ajustes sobre la primera versión propuesta por IA:
- Sustituir dependencia principal en localStorage por persistencia en disco vía backend local.
- Añadir historias de usuario y riesgos específicos de concurrencia/consistencia en JSON.

3. Balance entre simplicidad y robustez:
- Se evitó complejidad de infraestructura pesada.
- Se agregaron controles mínimos necesarios para integridad de datos.

## Impacto obtenido
1. Calidad:
- Comportamiento más predecible en reinicios y en operaciones consecutivas.

2. Rendimiento operativo:
- Flujo simple y liviano, apropiado para entorno académico/portable.

3. Mantenibilidad:
- Mayor claridad del modelo técnico y de los límites de la solución.
- Base preparada para futura migración a SQLite si el volumen crece.
