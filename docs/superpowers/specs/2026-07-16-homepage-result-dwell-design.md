# Homepage `/`: pausa final de lectura ligeramente más larga

> Dirección aprobada por el fundador el 2026-07-16: alargar un poco todas las escenas para
> que el último mensaje no desaparezca con un gesto mínimo de rueda. Esta especificación
> complementa `2026-07-15-homepage-narrative-hierarchy-design.md` y sólo sustituye sus valores
> de pausa y salida.

## Objetivo

Dar al visitante un poco más de scroll para leer la conclusión de cada capítulo antes de que
empiece la transición al siguiente. La interfaz ya cuenta la historia correctamente; el cambio
debe sentirse como una pausa adicional, no como una animación más lenta.

## Alcance

- Aplicar el ajuste a las siete escenas de `AnimatedStory`: Servicio, Cobro, Cliente,
  Operación, Finanzas, Sucursales e IA.
- Mantener intactos el opening de video y mosaico, Entradas de la operación, el cierre
  ilustrado, FAQ, Footer y `/demo`.
- Conservar la altura global actual: `900vh` en móvil y `1000vh` en desktop.
- Conservar copy, rangos globales, umbrales de demostración y entrada del resultado.

## Comportamiento aprobado

La conclusión conserva su entrada actual entre `0.73–0.84`. Una vez completamente visible,
permanece sin cambios hasta `0.96`; la salida reversible ocupa `0.96–1.00`.

| Progreso local | Comportamiento |
|---|---|
| `0.00–0.18` | Lectura del titular. |
| `0.18–0.38` | Compactación y entrada de la demostración. |
| `0.38–0.73` | Demostración acumulativa. |
| `0.73–0.84` | Entrada del resultado. |
| `0.84–0.96` | Pausa de lectura sin información nueva. |
| `0.96–1.00` | Salida reversible hacia el siguiente capítulo. |

La pausa completa crece de `0.09` a `0.12` de progreso local, aproximadamente un tercio más,
sin estirar los pasos de producto. `StoryLayer` debe consumir el inicio de salida compartido
en vez de repetir un valor literal, para que el mensaje y la escena terminen juntos.

## Restricciones

- Todo continúa derivándose del scroll; no se añaden timers, autoplay ni transiciones CSS.
- Sólo cambian valores de `opacity` ya animados por Framer Motion.
- Al subir, la salida se revierte con los mismos valores.
- `prefers-reduced-motion` y no-JavaScript conservan sus versiones estáticas actuales.
- La escena final de IA permanece visible al liberar el sticky, como en la implementación
  actual.

## Verificación

- En cada escena, a progreso local `0.955`, el resultado y la capa siguen con opacidad completa.
- Al avanzar a `0.98`, las escenas intermedias ya están saliendo.
- Al volver de `0.98` a `0.955`, recuperan exactamente el estado visible anterior.
- Las pruebas de jerarquía narrativa, responsive y build deben continuar pasando.
