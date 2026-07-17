# Homepage `/`: conector medido de canal a reserva

> Diseño aprobado por el fundador el 2026-07-14. Este cambio aplica únicamente a la
> escena `Channels` de la página principal `/`; no modifica `/demo` ni restaura rutas en
> Payment o Aftercare.

## Objetivo

Recuperar la idea visual que gustó —una línea y un punto verde que llevan la acción del
cliente— sin repetir el fallo de la implementación anterior. El recorrido debe comunicar
una sola relación:

> **Booking Widget seleccionado → Reserva confirmada**

La línea y el punto no son decoración. Ambos deben nacer en la fila seleccionada, terminar
en la tarjeta de la reserva y permanecer sincronizados durante todo el scroll.

## Causa del fallo anterior

La versión eliminada combinaba geometrías independientes:

- el punto usaba coordenadas fijas de `translateX` y `translateY`;
- una guía horizontal tenía ancho y posición porcentuales propios;
- cada fila añadía otro segmento de línea;
- la tarjeta incluía un punto que no era el destino real;
- el punto regresaba al origen mientras la reserva seguía confirmada.

Al cambiar el tamaño de la pantalla, estas piezas se separaban. La corrección debe derivar
línea, progreso activo y punto de las mismas anclas medidas.

## Alternativas consideradas

### A. Ruta SVG medida entre anclas reales — seleccionada

Un `ResizeObserver` mide un ancla integrada en `Booking Widget` y otra en la tarjeta de
reserva. Con esas coordenadas se construye una única ruta SVG. La parte activa de la línea
y el punto usan la misma geometría y el mismo progreso.

Ventajas: precisión responsive, recorrido comprobable, paridad con el patrón estable de
`ServiceScene` y una relación causal inequívoca. Coste: requiere medición y pruebas de
geometría.

### B. Línea recta medida

Conectar directamente los centros con una diagonal.

Ventaja: implementación pequeña. Desventajas: puede atravesar texto, pierde la estética
editorial del resto del scrollytelling y funciona mal cuando los paneles se apilan en móvil.

### C. Ruta dibujada con CSS y porcentajes

Usar bordes y transforms distintos por breakpoint.

Ventaja: poco JavaScript. Desventajas: vuelve a desacoplar punto, línea y componentes; es
la misma clase de error que originó el problema.

## Diseño visual y responsive

### Escritorio y tablet horizontal

- El origen es un pequeño ancla en el borde derecho de la fila `Booking Widget`.
- El destino es un ancla en el borde izquierdo de la tarjeta de reserva.
- La ruta usa codos ortogonales y atraviesa únicamente el espacio entre los dos paneles.
- El trazo base es neutral y tenue; el trazo activo es verde Avoqado.
- El punto verde se superpone exactamente al extremo del trazo activo.

### Móvil y paneles apilados

- El origen cambia al borde izquierdo de la fila seleccionada.
- La ruta baja por el margen libre del ledger y entra por la parte superior de la tarjeta.
- No atraviesa labels, iconos ni resultados de las filas posteriores.
- El destino queda dentro del panel visual y no genera overflow horizontal.

Las posiciones no se codifican como píxeles de recorrido. Los únicos valores visuales fijos
son el tamaño del ancla, el grosor del trazo y pequeños offsets de borde.

## Secuencia de scroll

1. Las cuatro entradas aparecen como hoy.
2. `Booking Widget` queda marcado con fondo verde y el texto `Seleccionado`.
3. El conector aparece en el origen.
4. El punto avanza una sola vez mientras el trazo verde crece detrás de él.
5. La tarjeta de reserva se revela durante la segunda mitad del recorrido.
6. El punto llega al destino, hace un cambio de escala sutil y permanece ahí.
7. No existe animación de regreso.

El movimiento sólo modifica `transform`, `opacity` y `pathLength`. No anima propiedades de
layout. La tarjeta conserva su revelado vertical corto para que el recorrido siga siendo el
evento principal.

## Arquitectura

`ChannelsScene` incorpora tres referencias:

- contenedor visual;
- ancla fuente de la fila activa;
- ancla destino de la tarjeta.

Una medición produce:

- dimensiones del SVG;
- string de ruta ortogonal;
- puntos acumulados de la ruta para X, Y y longitud activa.

`ResizeObserver` recalcula al cambiar el contenedor o cualquiera de las anclas. También se
repite la medición cuando terminan de cargar las fuentes. Si todavía no existe geometría
válida, línea y punto permanecen invisibles en el origen; no se muestra una ruta aproximada.

El SVG, los anclajes y el punto son `aria-hidden`. La verdad accesible sigue expresada en el
texto visible `Booking Widget → Reserva confirmada` y en el resumen de `SceneFrame`.

## Reduced motion y no-JS

- `prefers-reduced-motion` conserva la escena estática existente, sin punto viajero.
- La variante sin JavaScript conserva la misma relación textual.
- `?motion=full` puede forzar la versión animada para QA, pero la ruta mantiene las mismas
  anclas y no introduce loops automáticos.

## Pruebas de aceptación

La implementación debe demostrar automáticamente que:

1. existe exactamente una ruta y un pulso primario en `Channels`;
2. la ruta inicia en el ancla de `Booking Widget` y termina en el ancla de la reserva, con
   una tolerancia máxima de 3 px;
3. el punto coincide con el extremo del trazo activo durante el viaje;
4. la distancia del punto al destino nunca aumenta;
5. al llegar, el punto permanece en el destino hasta que termina la escena;
6. ledger, tarjeta, ruta y punto quedan dentro del panel sin overflow;
7. se mantiene la relación textual y el estado `Seleccionado`;
8. reduced motion y no-JS conservan la verdad estática;
9. `/demo` continúa independiente.

Viewports obligatorios: `1440×900`, `910×691`, `787×701`, `887×502`, `390×844` y
`320×568`.

## Fuera de alcance

- Restaurar líneas o puntos en Payment y Aftercare.
- Cambiar copy, canales o datos de la reserva.
- Alterar el orden o los rangos globales de escenas.
- Modificar `/demo`.
