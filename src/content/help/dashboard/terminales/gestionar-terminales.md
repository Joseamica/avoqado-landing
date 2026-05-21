---
title: Gestionar terminales
description: Revisa terminales, estado de conexion y activacion.
product: dashboard
category: terminales
featureCode: AVOQADO_TPVS
dashboardRoutes:
  - tpv
roles:
  - OWNER
  - ADMIN
  - MANAGER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Antes de empezar

Terminales muestra los dispositivos asociados al local. Usala para confirmar si una terminal esta asignada, activa y lista para operar. Esta vista no reemplaza la revision fisica del dispositivo: si una terminal no cobra, revisa tambien conexion, bateria, sesion y estado en el equipo.

Los datos siempre dependen del local activo. Si administras varias sucursales, cambia primero a la sucursal donde esta la terminal.

## Pasos

1. Abre **Terminales**.
2. Busca la terminal por nombre, identificador o estado.
3. Revisa si aparece activa, pendiente o con algun problema de conexion.
4. Abre el detalle si necesitas validar informacion del dispositivo.
5. Compara con pagos recientes si estas investigando una terminal que no refleja cobros.
6. Si se requiere activacion, sigue el flujo indicado o contacta a soporte con el identificador del dispositivo.

## Problemas frecuentes

Si la terminal no aparece, puede no estar asignada al local correcto. Si aparece pendiente, falta completar activacion. Si aparece activa pero no cobra, revisa conexion y estado fisico. Si los pagos no coinciden, filtra **Ventas > Transacciones** por fecha y terminal cuando el filtro este disponible.
