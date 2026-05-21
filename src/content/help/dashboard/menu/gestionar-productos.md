---
title: Gestionar productos
description: Crea y edita productos del menu desde el Dashboard.
product: dashboard
category: menu
featureCode: AVOQADO_MENU
dashboardRoutes:
  - menumaker/products
  - menumaker/categories
  - menumaker/menus
roles:
  - OWNER
  - ADMIN
  - MANAGER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Antes de empezar

Define si vas a crear un producto nuevo, editar uno existente o solo revisar disponibilidad. Un cambio en producto puede afectar venta en canales conectados, reportes por articulo e inventario si el producto tiene seguimiento de stock o receta.

Antes de editar precios o categorias, confirma que estas en la sucursal correcta y que entiendes en que menu debe aparecer el producto. Si el local usa modificadores, revisa tambien los grupos de modificadores para evitar que el producto quede incompleto.

## Pasos

1. Abre **Menu > Productos**.
2. Busca el producto por nombre o revisa la categoria correspondiente.
3. Abre el producto y valida nombre, descripcion, precio, categoria, disponibilidad y configuracion relacionada.
4. Si vas a crear uno nuevo, primero confirma que la categoria y el menu ya existan.
5. Guarda cambios y revisa que el producto aparezca donde corresponde.
6. Si el producto usa inventario, valida despues su configuracion desde **Inventario**.

## Problemas frecuentes

Si un producto no aparece para venta, revisa si esta activo, si pertenece al menu correcto y si tiene categoria asignada. Si el precio no cambia en otro canal, confirma que guardaste en la sucursal correcta. Si no puedes editar, tu rol puede no tener permiso de menu. Si faltan modificadores, revisa **Menu > Modificadores**.
