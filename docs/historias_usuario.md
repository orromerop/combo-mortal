# Project Canvas — Proyecto Final SOFT-734
## Entregable del Kickoff — Tema 3 · Práctica 3

**Equipo:**
- Rebeca Chinchilla Ríos
- Jonathan Casanova Solís
- Ricardo Zelada Sánchez
- Oscar Romero Pérez

**Nombre tentativo del proyecto:**
El Combo Mortal (Gestión de servicios de comida rápida)

### 1. Problema / idea de negocio
*(¿Qué problema real resuelve? Una o dos frases. Validado con IA.)*
Este sistema reduce errores operativos y tiempos de espera en la gestión de pedidos de comida rápida al centralizar el flujo desde la orden del cliente hasta la entrega y el pago. También mejora el control operativo del restaurante al dar visibilidad en tiempo real de estados e ingresos por platillo.

### 2. Usuarios / a quién sirve

Usuarios detectados:

#### Cliente
Usa el sistema web para ver el menú, crear su pedido, pagar y consultar el estado con su número de orden.

#### Cocinero
Recibe pedidos nuevos, revisa el detalle por platillo y actualiza estados de preparación y listo.

#### Administrador
Monitorea pedidos por estado (pendiente, en preparación y listo), marca entregados y consulta reportes de ingresos totales y por platillo.

#### ¿Para qué sirve el sistema?
El sistema sirve para centralizar y ordenar todo el flujo de pedidos de comida rápida, desde la solicitud del cliente hasta la entrega y el pago. También permite control operativo en tiempo real y mejor seguimiento del desempeño del restaurante con reportes de ingresos.

### 3. Historias de usuario - El Combo Mortal (modelo portable)

### Historia 1. Como cliente quiero visualizar el menú de platillos disponibles y no disponibles con sus precios en una aplicación portable para seleccionar rápidamente lo que deseo pedir y pagar.

#### Criterios de aceptación
1. Dado que el cliente abre la aplicación local, cuando ingresa al menú, entonces visualiza platillos con nombre, precio y estado de disponibilidad.
2. Dado que existen platillos no disponibles, cuando el cliente revisa el menú, entonces esos platillos se muestran marcados y no permiten agregarse al pedido.
3. Dado que el catálogo está en archivos JSON de la carpeta Data, cuando se actualiza ese archivo con estructura válida, entonces el menú refleja los cambios en la siguiente carga de la aplicación.

### Historia 2. Como cliente quiero realizar el pago en la aplicación portable para confirmar mi compra, recibir un número de orden único y dar seguimiento al estado de mi pedido hasta que esté listo para retirar.

#### Criterios de aceptación
1. Dado que el cliente tiene al menos un platillo en el pedido, cuando confirma el pago, entonces el sistema crea la orden con estado pendiente y genera un número único.
2. Dado que el pago fue exitoso, cuando finaliza la transacción, entonces el sistema muestra número de orden, estado inicial y total calculado con la configuración local.
3. Dado que la aplicación guarda el estado en almacenamiento local, cuando se recarga la página en el mismo equipo, entonces la orden se conserva y puede consultarse por su número.

### Historia 3. Como cocinero quiero consultar los pedidos nuevos en orden de llegada y revisar el detalle de platillos por pedido para iniciar su preparación sin omitir órdenes, leyendo la información desde archivos JSON.

#### Criterios de aceptación
1. Dado que existen pedidos pendientes, cuando el cocinero abre su panel, entonces visualiza las órdenes ordenadas por fecha y hora de creación.
2. Dado un pedido pendiente, cuando el cocinero lo selecciona, entonces visualiza detalle de platillos y cantidades por ítem.
3. Dado que no hay pedidos pendientes, cuando el cocinero consulta el panel, entonces el sistema muestra explícitamente que no hay órdenes nuevas.

### Historia 4. Como cocinero quiero cambiar el estado de cada platillo del pedido a preparación o listo para que el sistema actualice el estado general de la orden y esa actualización se guarde en Data/pedidos.json.

#### Criterios de aceptación
1. Dado que el cocinero inicia un pedido pendiente, cuando cambia un ítem a preparación, entonces el cambio queda registrado y visible para administración.
2. Dado que el cocinero cambia ítems a listo, cuando todos los ítems de la orden están listos, entonces el sistema actualiza automáticamente el estado general del pedido a listo.
3. Dado que un pedido ya avanzó de estado, cuando se intenta una transición no válida hacia atrás, entonces el sistema bloquea la acción.

### Historia 5. Como administrador quiero consultar pedidos por estado, marcar pedidos listos como entregados y visualizar reportes de ingresos para controlar la operación en una solución ligera y portable.

#### Criterios de aceptación
1. Dado que existen pedidos en flujo, cuando el administrador abre su panel, entonces puede filtrar por todos, pendiente, en preparación, listo y entregado.
2. Dado un pedido en estado listo, cuando el administrador confirma la entrega, entonces el estado cambia a entregado y se registra la hora.
3. Dado que existen pagos registrados, cuando el administrador consulta reportes, entonces puede ver ingresos totales y consolidado por platillo para un rango de fechas.

### Historia 6. Como responsable operativo quiero exportar e importar el estado de la aplicación para mover o respaldar la operación entre equipos manteniendo pedidos y estados en archivos JSON.

#### Criterios de aceptación
1. Dado que el administrador solicita un respaldo, cuando ejecuta exportar, entonces el sistema descarga un archivo JSON con el estado actual de pedidos y configuración operativa.
2. Dado que existe un respaldo válido, cuando se importa en otra instalación de la aplicación, entonces se restaura el estado y los paneles muestran la misma información operativa.
3. Dado que el archivo de importación no cumple estructura esperada, cuando se intenta importar, entonces el sistema rechaza la carga y muestra un mensaje de error.

### Historia 7. Como operador técnico quiero que el sistema persista pedidos y estados únicamente en archivos JSON locales para que la solución sea portable y funcional sin base de datos.

#### Criterios de aceptación
1. Dado que el sistema inicia, cuando carga la aplicación, entonces lee configuración, catálogo y estado operativo desde archivos JSON en la carpeta Data.
2. Dado que se crea un pedido o se cambia un estado en cocina o administración, cuando se confirma la acción, entonces el sistema actualiza Data/pedidos.json.
3. Dado que se reinicia el servidor local y se vuelve a abrir la aplicación, cuando se consulta la operación, entonces los pedidos y estados previos se recuperan desde Data/pedidos.json.
4. Dado que Data/pedidos.json no existe o está corrupto, cuando inicia el sistema, entonces reconstruye un estado válido usando pedidos.seed.json y reporta la condición.

### 4. Ambigüedades o riesgos detectados

## Historia 1 - Cliente visualiza menú
1. No se define si el cliente debe ver solo platillos disponibles o también los no disponibles con una marca visual.
2. No se especifica si los precios incluyen impuestos o si el impuesto se calcula hasta el momento del pago.

## Historia 2 - Cliente realiza pago y recibe número de orden
1. No se aclara si el pago será en línea dentro del sistema o si puede registrarse como pago presencial en caja.
2. No se define por qué canal se notifica el estado del pedido al cliente (pantalla, correo, SMS o solo consulta manual con número de orden).

## Historia 3 - Cocinero consulta pedidos nuevos
1. No se especifica el criterio exacto de priorización de pedidos (orden de llegada, tipo de platillo o tiempo estimado).
2. No se define si el cocinero ve el pedido completo o solo ítems de cocina (por ejemplo, excluir bebidas preparadas por otra estación).

## Historia 4 - Cocinero cambia estado a preparación o listo
1. No se aclara si el cambio de estado aplica al pedido completo o a cada platillo de forma individual.
2. No se define quién puede corregir un estado marcado por error y bajo qué reglas de transición.

## Historia 5 - Administrador monitorea estados, entrega y reporte de ingresos
1. No se especifica si el estado entregado lo confirma el administrador, el cliente o ambos con evidencia de retiro.
2. No se define el alcance del reporte de ingresos por platillo (cantidad vendida, ingreso bruto, neto con impuesto o neto sin anulaciones).

## Historia 7 - Persistencia en JSON
1. No se define política de concurrencia para escrituras simultáneas sobre Data/pedidos.json.
2. No se define estrategia de recuperación ante corrupción parcial del JSON durante apagado inesperado.

## Críticas del diagrama por parte de la IA

### Hallazgos principales
1. El flujo permite que el cliente pague sin una validación operativa previa del pedido, lo que puede generar cobros de órdenes no aceptadas.
2. Cocina y administración necesitan reglas claras para actualizar estados por ítem y por pedido en Data/pedidos.json.
3. No se modela explícitamente la escritura atómica de cambios de estado en archivo JSON.
4. Falta representar la generación y devolución del número de orden al cliente como parte del flujo.
5. No se muestra de forma explícita la consulta de estado del cliente con su número de orden.
6. Se modela historial de pagos, pero no queda clara la trazabilidad de auditoría de cambios de estado en JSON.

### Cuellos de botella
1. Escritura concurrente en Data/pedidos.json cuando cliente crea pedido, cocina actualiza estados y administración entrega al mismo tiempo.
2. Riesgo de sobrescritura de cambios si no hay cola de persistencia o bloqueo de escritura.
3. Reportería en tiempo real puede degradar rendimiento cuando crece el volumen de pedidos históricos.

### Puntos únicos de falla
1. Data/pedidos.json concentra estados operativos y cierre de flujo; si se corrompe, se afecta casi todo el sistema.
2. Dependencia de escritura atómica del archivo JSON; si falla una escritura intermedia, puede quedar inconsistencia.
3. La visualización del diagrama depende de CDN de Mermaid; sin internet no se renderiza el diagrama HTML.

### Riesgos adicionales
1. Riesgo de diferencia entre total pagado y detalle si no se congela precio_unitario al crear cada ítem.
2. Riesgo de baja trazabilidad sin una bitácora de eventos por cambio de estado.
3. Riesgo de pérdida de datos si se edita manualmente Data/pedidos.json sin validación de esquema.

### Recomendaciones concretas
1. Mantener cambios de estado por ítem y por pedido con reglas de agregación dentro de Data/pedidos.json.
2. Agregar en el diagrama el paso "generar número de orden" y "cliente consulta estado".
3. Agregar la acción explícita del administrador "actualizar a entregado" y persistirla en Data/pedidos.json.
4. Definir políticas de escritura segura en JSON (archivo temporal + reemplazo atómico + control de bloqueo).
5. Incorporar bitacora_eventos.json para auditoría y trazabilidad del flujo.
6. Definir especificación de reporte por platillo: unidades vendidas, ingreso bruto, impuesto y neto.
7. Definir umbral de migración futura a SQLite si el volumen supera la capacidad operativa de un único JSON.

### 6. Integraciones de IA previstas (al menos 3, elegidas del menú)
1. Codificación: generar y completar código.
2. Pruebas: generar casos de prueba y cubrir bordes.
3. Optimización de código: mejorar rendimiento o calidad.

### 7. Reparto de trabajo inicial
Se trabajará en equipo, considerando un workspace que pueda ser utilizado por todos los integrantes, de tal manera que durante las sesiones planificadas de desarrollo del proyecto, los distintos integrantes puedan realizar sus aportes, asegurando la práctica y el conocimiento individual.
