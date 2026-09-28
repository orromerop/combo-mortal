# Resultado de pruebas - El Combo Mortal

Fecha: 2026-09-25
Proyecto: ComboMortalNuevo

## 1) Prueba ejecutada

Comando ejecutado:

```bash
npm run test:internal
```

Objetivo:
- Validar funciones internas del backend que no se observan directamente en la prueba de interfaz (E2E).

## 2) Resultado de ejecución

Estado final: EXITOSO

Resumen reportado por el runner:
- tests: 5
- pass: 5
- fail: 0
- skipped: 0
- duration_ms: 4506.6466

Casos validados:
1. Rechazo de payload sin state (caso borde).
2. Rechazo de state con estructura inválida (caso borde).
3. Aceptación y persistencia de state mínimo válido.
4. Cola de escritura con dos PUT concurrentes conserva el último estado.
5. Recuperación cuando Data/pedidos.json se corrompe (caso borde).

## 3) Evidencia visual (interfaz)

La captura corresponde al estado actual de la interfaz durante el escenario de JSON inválido (pantalla de error de datos), útil como soporte del contexto de pruebas negativas.

- Captura: [docs/evidencia-interfaz-estado-actual.png](evidencia-interfaz-estado-actual.png)

Evidencias relacionadas previas:
- [docs/evidencia-e2e-falla-json-invalido.png](evidencia-e2e-falla-json-invalido.png)
- [docs/evidencia-e2e-playwright.png](evidencia-e2e-playwright.png)

## 4) Conclusión

La suite interna pasó al 100% y cubre validaciones críticas y bordes del backend (estructura de estado, concurrencia y recuperación), complementando la prueba E2E de interfaz.
