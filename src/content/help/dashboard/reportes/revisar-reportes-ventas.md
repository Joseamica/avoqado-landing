---
title: Revisar reportes de ventas
description: Consulta resumen de ventas, ventas por producto y graficas del inicio.
product: dashboard
category: reportes
featureCode: AVOQADO_REPORTS
dashboardRoutes:
  - reports/sales-summary
  - reports/sales-by-item
  - reports/home-charts
roles:
  - OWNER
  - ADMIN
  - MANAGER
  - VIEWER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
relatedArticles:
  - ver-pagos
  - ver-saldo-disponible
---

## Antes de empezar

Reportes de ventas se usan para analizar resultados, no solo para ver transacciones individuales. Antes de descargar o compartir un reporte, confirma periodo, sucursal, tipo de vista y si necesitas ventas por dia, por producto o por metodo de pago.

Ten presente que los reportes pueden tratar descuentos, propinas, impuestos y comisiones de forma distinta segun la metrica seleccionada.

## Pasos

1. Abre **Reportes > Resumen de ventas**.
2. Selecciona el rango de fechas.
3. Elige el tipo de reporte o vista disponible.
4. Revisa metricas como ventas brutas, descuentos, reembolsos, ventas netas, impuestos, propinas y total cobrado.
5. Abre **Ventas por producto** para analizar articulos vendidos.
6. Exporta o comparte datos solo despues de confirmar filtros y sucursal.

## Problemas frecuentes

Si el reporte no coincide con pagos, revisa filtros, cancelaciones, descuentos y reembolsos. Si ventas por producto no coincide con inventario, valida recetas y movimientos. Si una metrica parece vacia, puede depender de permisos o configuracion del local. Para conciliacion de depositos usa tambien **Saldo disponible**.

Antes de enviar un reporte a direccion o contabilidad, guarda el rango exacto de fechas y filtros usados.
