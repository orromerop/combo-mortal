# Esquema de datos (ComboMortalNuevo)

Esta guia define como editar los JSON de la carpeta `Data` sin romper la aplicacion.

## 1) Archivos

- `config.json`: parametros globales.
- `platillos.json`: catalogo de productos.
- `pedidos.seed.json`: datos semilla de pedidos para primer arranque.
- `pedidos.json`: estado operativo actual (pedidos, estados, carrito y secuencia).

## 2) config.json

Estructura:

```json
{
  "impuesto": 0.13,
  "monedaLocale": "es-CR",
  "version": 1
}
```

Reglas:

- `impuesto`: decimal entre `0` y `1` (ejemplo `0.13`).
- `monedaLocale`: locale para formato numerico.
- `version`: numero de version del respaldo.

## 5) pedidos.json

Estructura:

```json
{
  "secuencia": 1248,
  "pedidos": [],
  "carrito": []
}
```

Reglas:

- `secuencia`: numero entero para generar nuevos numeros de orden.
- `pedidos`: arreglo de pedidos con items y estados.
- `carrito`: arreglo opcional para persistencia de carrito en sesion.

## 3) platillos.json

Estructura de cada item:

```json
{
  "id": "p1",
  "nombre": "Hamburguesa Clasica",
  "descripcion": "Texto",
  "precio": 3500,
  "disponible": true,
  "estacion": "Plancha",
  "foto": "./assets/p1.jpg"
}
```

Reglas:

- `id` debe ser unico (no repetir).
- `precio` es numero entero en colones.
- `disponible` controla si se puede agregar al carrito.
- `foto` debe apuntar a un archivo existente en `assets`.

## 4) pedidos.seed.json

Estructura:

```json
{
  "secuenciaInicial": 1248,
  "pedidos": [
    {
      "numeroSecuencia": 1245,
      "minutosAtras": 24,
      "estado": "PENDIENTE",
      "metodoPago": "Tarjeta",
      "items": [
        { "platilloId": "p1", "cantidad": 1, "estado": "PENDIENTE" }
      ]
    }
  ]
}
```

Valores permitidos:

- Estados de pedido: `PENDIENTE`, `EN_PREPARACION`, `LISTO`, `ENTREGADO`.
- Estados de item: `PENDIENTE`, `PREPARACION`, `LISTO`.

Reglas:

- `platilloId` debe existir en `platillos.json`.
- `cantidad` debe ser >= 1.
- Si el pedido es `ENTREGADO`, se recomienda agregar `entregadoMinutosAtras`.

## 6) Flujo de datos real

1. La app consume `GET /api/bootstrap` desde `server.js`.
2. El servidor lee `config.json`, `platillos.json`, `pedidos.seed.json` y `pedidos.json`.
3. Si `pedidos.json` no existe o no es valido, lo reconstruye desde `pedidos.seed.json`.
4. Cada cambio operativo (crear pedido, actualizar estado, entregar) se persiste en `pedidos.json`.

Importante:

- Cambios en `pedidos.seed.json` solo aplican cuando se regenera `pedidos.json`.

## 7) Respaldo operativo

Desde Administracion:

- `Exportar respaldo`: descarga el estado actual (pedidos, carrito, secuencia).
- `Importar respaldo`: restaura ese estado en otra maquina.

Recomendado:

- Usar respaldo para migrar operacion diaria entre equipos.
- Usar `seed` solo como estado inicial base.

## 8) Checklist antes de guardar JSON

- JSON valido (sin comas extra).
- IDs unicos.
- Fotos existentes en `assets`.
- Estados dentro de valores permitidos.
- Precios y cantidades numericos.
