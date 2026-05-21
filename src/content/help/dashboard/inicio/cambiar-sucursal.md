---
title: Cambiar de sucursal
description: Cambia entre los locales asignados a tu usuario.
product: dashboard
category: inicio
dashboardRoutes:
  - home
roles:
  - OWNER
  - ADMIN
  - MANAGER
  - VIEWER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Antes de empezar

Cambiar de sucursal cambia el contexto de todo el Dashboard. Pagos, pedidos, inventario, reportes, terminales y clientes se cargan para el local seleccionado. Antes de hacer cambios operativos, confirma que estas en la sucursal correcta, especialmente si administras varias ubicaciones.

El selector solo muestra locales a los que tu usuario tiene acceso. Si tienes rol administrativo en una sucursal y rol limitado en otra, veras distintas secciones despues de cambiar.

## Pasos

1. Abre el Dashboard y ubica el selector de sucursal.
2. Haz clic en el local activo.
3. Elige la sucursal que quieres consultar.
4. Espera a que el Dashboard recargue datos.
5. Revisa el menu lateral: algunas opciones pueden aparecer o desaparecer segun permisos y configuracion del local.
6. Antes de descargar reportes o cambiar configuracion, vuelve a validar el nombre de la sucursal.

## Problemas frecuentes

Si no ves una sucursal, tu usuario no esta asignado o el local no esta disponible para tu cuenta. Si al cambiar de sucursal faltan ventas o pedidos, revisa el rango de fechas y confirma que el local activo sea el esperado. Si ves la sucursal pero no puedes editar, tu rol puede ser solo de lectura.
