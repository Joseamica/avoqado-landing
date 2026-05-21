---
title: Ver saldo disponible
description: Consulta liquidaciones, depositos y calendario de saldo.
product: dashboard
category: reportes
featureCode: AVOQADO_BALANCE
dashboardRoutes:
  - available-balance
roles:
  - OWNER
  - ADMIN
  - MANAGER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Antes de empezar

Saldo disponible ayuda a entender cuanto dinero esta listo para depositarse o ya fue liquidado. No debe compararse directamente contra ventas brutas sin revisar comisiones, tiempos de liquidacion, metodo de pago, devoluciones o ajustes.

Antes de revisar una diferencia, ten claro el periodo, la sucursal y el tipo de movimiento que buscas: venta, deposito, liquidacion pendiente o ajuste.

## Pasos

1. Abre **Reportes > Saldo Disponible**.
2. Confirma la sucursal activa.
3. Revisa saldo disponible, saldo pendiente y calendario de depositos.
4. Ajusta el periodo si estas investigando un dia especifico.
5. Compara contra **Ventas > Transacciones** para validar pagos cobrados.
6. Si necesitas explicar diferencias, revisa metodo de pago, fecha de cobro y fecha estimada de deposito.

## Problemas frecuentes

Si el saldo no coincide con ventas del dia, revisa liquidaciones pendientes. Si falta un deposito, confirma el calendario y el periodo. Si aparece un ajuste, revisa si hubo devolucion, contracargo o correccion. Si no puedes ver la seccion, tu rol puede no tener permiso de liquidaciones.

Para seguimiento financiero, conserva captura o exportacion del periodo revisado junto con el dia de deposito esperado.
