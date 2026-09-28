# Wireframes en texto - El Combo Mortal

## Wireframe 1 - Cliente: Ver menu y armar pedido (Historia 1)

```text
+----------------------------------------------------------------------------------+
| EL COMBO MORTAL                                          [Logo]     [Perfil]     |
+----------------------------------------------------------------------------------+
| MENU DE PLATILLOS                                                                |
| Filtro: [Todos v] [Disponibles] [No disponibles]                                 |
+----------------------------------------------------------------------------------+
| [Card] Hamburguesa Clasica            Precio: CRC 3,500      Estado: DISPONIBLE |
|        [ - ] [ 1 ] [ + ]                                   [Agregar]            |
|----------------------------------------------------------------------------------|
| [Card] Papas Fritas                   Precio: CRC 1,200      Estado: DISPONIBLE |
|        [ - ] [ 2 ] [ + ]                                   [Agregar]            |
|----------------------------------------------------------------------------------|
| [Card] Malteada Vainilla              Precio: CRC 1,800      Estado: NO DISP.   |
|        [No seleccionable]                                   [Agotado]           |
+----------------------------------------------------------------------------------+
| RESUMEN RAPIDO                                                                    |
| Items: 3                        Subtotal: CRC 5,900                              |
| [Ver pedido completo]                                               [Pagar]      |
+----------------------------------------------------------------------------------+
```

Cubre:
1. Muestra nombre y precio de platillos.
2. Muestra no disponibles y los bloquea para seleccion.
3. Calcula y muestra subtotal antes de pagar.

## Wireframe 2 - Cliente: Pago, numero de orden y estado inicial (Historia 2)

```text
+----------------------------------------------------------------------------------+
| EL COMBO MORTAL                                               Checkout            |
+----------------------------------------------------------------------------------+
| RESUMEN DEL PEDIDO                                                                 |
| - 1 x Hamburguesa Clasica                     CRC 3,500                            |
| - 2 x Papas Fritas                            CRC 2,400                            |
|----------------------------------------------------------------------------------|
| Subtotal:                                     CRC 5,900                            |
| Impuesto:                                     CRC   767                            |
| TOTAL:                                        CRC 6,667                            |
+----------------------------------------------------------------------------------+
| METODO DE PAGO                                                                     |
| ( ) Tarjeta  ( ) SINPE  ( ) Efectivo en caja                                      |
| [Datos de pago.........................................................]           |
| [Confirmar pago]                                                                   |
+----------------------------------------------------------------------------------+
| RESULTADO                                                                          |
| Estado transaccion: EXITOSA                                                        |
| Numero de orden: #A-2026-001245                                                    |
| Estado inicial del pedido: PENDIENTE                                               |
| [Consultar estado de mi orden]                                                     |
+----------------------------------------------------------------------------------+
```

Cubre:
1. Solo permite confirmar con al menos un item en pedido.
2. Genera numero de orden unico tras pago exitoso.
3. Muestra estado inicial pendiente.

## Wireframe 3 - Cocinero: Bandeja de pedidos nuevos (Historia 3)

```text
+----------------------------------------------------------------------------------+
| PANEL COCINA                                                    [Turno: Activo]   |
+----------------------------------------------------------------------------------+
| PEDIDOS NUEVOS (orden de llegada)                                                 |
|----------------------------------------------------------------------------------|
| #A-2026-001245   Hora: 12:03   Estado: PENDIENTE   Items: 3        [Ver detalle] |
| #A-2026-001246   Hora: 12:05   Estado: PENDIENTE   Items: 2        [Ver detalle] |
| #A-2026-001247   Hora: 12:07   Estado: PENDIENTE   Items: 1        [Ver detalle] |
+----------------------------------------------------------------------------------+
| DETALLE DEL PEDIDO SELECCIONADO: #A-2026-001245                                   |
| - Hamburguesa Clasica   Cant: 1   Estacion: Plancha                               |
| - Papas Fritas          Cant: 2   Estacion: Fritura                               |
| [Iniciar preparacion]                                                              |
+----------------------------------------------------------------------------------+
| Si no hay pedidos: "No hay ordenes nuevas por ahora."                             |
+----------------------------------------------------------------------------------+
```

Cubre:
1. Lista pendientes en orden de llegada.
2. Permite abrir detalle por pedido con cantidades.
3. Mensaje explicito cuando no hay pendientes.

## Wireframe 4 - Cocinero: Cambiar estado por item (Historia 4)

```text
+----------------------------------------------------------------------------------+
| PANEL COCINA - GESTION DE ESTADOS                                Orden #A-...    |
+----------------------------------------------------------------------------------+
| ITEMS DEL PEDIDO                                                                   |
|----------------------------------------------------------------------------------|
| Item                    Cantidad     Estado actual        Cambiar a              |
| Hamburguesa Clasica     1            PENDIENTE            [PREPARACION v] [Guardar]|
| Papas Fritas            2            PREPARACION          [LISTO v]       [Guardar]|
+----------------------------------------------------------------------------------+
| ESTADO GENERAL DEL PEDIDO: EN PREPARACION                                          |
| Regla: si todos los items estan en LISTO => pedido pasa a LISTO automaticamente    |
+----------------------------------------------------------------------------------+
| [Finalizar actualizacion]                                                          |
| Validaciones:                                                                       |
| - No permitir volver de LISTO a PENDIENTE                                           |
| - Registrar fecha y usuario de cada cambio                                          |
+----------------------------------------------------------------------------------+
```

Cubre:
1. Cambio de estado por item visible para administrador.
2. Regla automatica para estado general cuando todos listos.
3. Bloqueo de transicion invalida listo -> pendiente.

## Wireframe 5 - Administrador: Monitoreo, entrega y reportes (Historia 5)

```text
+----------------------------------------------------------------------------------+
| PANEL ADMINISTRADOR                                              [Fecha: Hoy]     |
+----------------------------------------------------------------------------------+
| FILTROS DE PEDIDOS                                                                 |
| Estado: [Pendiente] [En preparacion] [Listo] [Entregado]   Rango: [Desde][Hasta] |
| [Aplicar filtro]                                                                    |
+----------------------------------------------------------------------------------+
| TABLA DE PEDIDOS                                                                    |
| Orden            Hora      Estado            Total       Accion                    |
| #A-2026-001245   12:03     LISTO             6,667       [Marcar entregado]        |
| #A-2026-001246   12:05     EN PREPARACION    4,100       [Ver detalle]             |
+----------------------------------------------------------------------------------+
| Al marcar entregado:                                                                |
| Confirmar entrega de #A-2026-001245 ? [Si] [No]                                    |
| Resultado: Estado = ENTREGADO | Hora entrega = 12:26                                |
+----------------------------------------------------------------------------------+
| REPORTES DE INGRESOS                                                                |
| Rango: [Desde][Hasta]  [Generar]                                                    |
| Ingreso total: CRC 348,250                                                          |
|----------------------------------------------------------------------------------|
| Por platillo                 Unidades      Ingreso                                 |
| Hamburguesa Clasica          120           CRC 420,000                              |
| Papas Fritas                 95            CRC 114,000                              |
|----------------------------------------------------------------------------------|
| [Exportar CSV]                                                                       |
+----------------------------------------------------------------------------------+
```

Cubre:
1. Filtro por pendiente, en preparacion y listo.
2. Permite pasar listo a entregado y registrar hora.
3. Reporte total y consolidado por platillo en rango de fechas.
