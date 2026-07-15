# Homepage `/`: transición continua de video, mosaico y canales

> Diseño aprobado por el fundador el 2026-07-14. Esta especificación actualiza únicamente
> la apertura de la homepage `/`. Conserva las escenas posteriores del scrollytelling y no
> modifica `/demo`.

## Objetivo

Restaurar la interacción más reconocible de la landing original:

> **video a pantalla completa → video reducido dentro de un mosaico de negocios**

El mosaico no debe terminar como decoración. Cuatro de sus miniaturas deben continuar hacia
la siguiente promesa, `Tu cliente empieza como prefiera.`, y convertirse en las cuatro
entradas de Avoqado. La miniatura de `Booking Widget` origina entonces el punto y la línea
que terminan en `Reserva confirmada`.

La secuencia completa es:

> **video → mosaico → cuatro miniaturas → canales → reserva confirmada → resto de la operación**

## Relación con las especificaciones anteriores

Este diseño sustituye las secciones `Hero` y `Entradas omnicanal` de
`2026-07-10-homepage-scrollytelling-design.md`:

- se elimina de `/` la escena negra `Un cliente hace una cosa. Avoqado mueve todo lo demás.`;
- se restaura el video `/video4.webm`, su H1, apoyo y CTAs originales;
- `Channels` deja de ser una escena independiente y pasa a ser el estado final de la nueva
  apertura;
- el scrollytelling sticky posterior empieza en `Service`.

`2026-07-14-channels-measured-connector-design.md` sigue vigente para la geometría del
conector. Su implementación se traslada al estado final de la apertura y cambia únicamente
el contexto visual de la fila origen. La ruta sigue siendo una sola geometría medida entre
`Booking Widget` y `Reserva confirmada`.

La excepción del video también sustituye el presupuesto anterior de medio crítico inicial
de 1 MiB. El archivo aprobado actual pesa aproximadamente 5 MiB y es el único medio pesado
above-the-fold; no se añadirá otro video ni se cargarán eager las demás fotografías.

## Alternativas consideradas

### A. Puente de miniaturas — seleccionada

Cuatro imágenes reales permanecen al final del mosaico, se desplazan hasta formar la lista de
canales y una de ellas entrega el evento a la reserva.

Ventajas: continuidad visual real, reaprovecha la firma original de la landing y da un
significado causal al punto verde. Coste: requiere medir las posiciones iniciales y finales
para mantener precisión responsive.

### B. Una miniatura protagonista

Todas las imágenes desaparecen salvo una, que representa a una clienta y conecta con la
reserva.

Ventaja: máxima claridad narrativa. Desventaja: aprovecha muy poco el mosaico y no comunica
que existen varios canales.

### C. Constelación de operaciones

Varias miniaturas permanecen conectadas simultáneamente a un núcleo Avoqado.

Ventaja: expresa amplitud. Desventajas: introduce líneas cruzadas, compite con el copy y
debilita la historia lineal de una acción que produce un resultado.

## Contenido aprobado

### Estado 1: video

Se conserva el hero original sobre `/video4.webm`:

- H1: `Tu tienda, tu gym, tu estética. Un solo sistema.`
- apoyo: `Punto de venta, cobros, citas, inventario y reportes — todo en una app. Más barato
  que lo que ya pagas en pedacitos.`
- CTA primaria: `Agenda por WhatsApp`;
- CTA secundaria: `Comienza gratis`.

El navbar permanece superpuesto como en la landing original. El video se reproduce muted,
loop y playsInline. Un poster generado a partir del mismo video en
`public/video4-poster.webp` queda visible antes de la reproducción y si el archivo falla.

### Estado 2: mosaico

El video se reduce y ocupa su lugar dentro del mosaico existente de 17 assets. Se conservan
el layout responsive y el copy:

- `Tiendas, gyms, estéticas, clínicas y más.`
- `Cobra, organiza y crece desde un solo lugar.`

El mosaico debe permanecer completo durante un intervalo corto antes de comenzar la
transición. El usuario debe alcanzar a reconocerlo como estado final, no sólo como un frame
intermedio.

### Estado 3: cuatro miniaturas supervivientes

Las demás imágenes y el copy central se atenúan. Permanecen cuatro assets ya existentes,
todos disponibles también en la composición móvil:

| Canal | Asset del mosaico | Lectura visual |
|---|---|---|
| Consumer App | `hero-tile-02.jpg` | teléfono con confirmación |
| Booking Widget | `hero-tile-07.jpg` | servicio con cita/contexto |
| Online | `hero-tile-12.jpg` | bolsa de compra |
| Punto de venta | `hero-tile-10.jpg` | cobro presencial en terminal |

Estas miniaturas se desplazan desde sus celdas reales hasta cuatro placeholders de la lista
de canales. No se sustituyen a mitad del movimiento por iconos genéricos.

### Estado 4: canales y reserva

La composición final usa el título y apoyo ya aprobados:

- título: `Tu cliente empieza como prefiera.`
- apoyo: `Reserva, compra o paga desde tu web, una liga, la app o directamente en sucursal.`

Las cuatro miniaturas quedan integradas en filas con texto visible:

1. `Consumer App` → `Reserva`;
2. `Booking Widget` → `Seleccionado`;
3. `Online` → `Pago`;
4. `Punto de venta` → `Venta presencial`.

`Booking Widget` recibe el estado verde activo. Sólo después de que las miniaturas hayan
terminado de colocarse aparece el punto en esa fila, crece la ruta medida y se revela la
tarjeta `Booking Widget → Reserva confirmada`.

No queda ningún punto o segmento verde en el video o el mosaico sin una fuente y un destino
concretos.

## Línea de tiempo de scroll

La apertura animada usa `300vh` en desktop y `260vh` en móvil. Su progreso
normalizado se divide así:

| Rango | Estado |
|---|---|
| 0.00–0.38 | el video ocupa la pantalla y se reduce con el comportamiento original |
| 0.18–0.50 | aparecen las 17 miniaturas y el copy del mosaico |
| 0.50–0.62 | el mosaico completo permanece estable |
| 0.62–0.80 | se retiran 13 elementos y las cuatro miniaturas se reacomodan |
| 0.76–0.91 | aparecen labels, título de canales y tarjeta de reserva |
| 0.84–0.94 | el punto y el trazo avanzan hasta la reserva |
| 0.94–1.00 | el estado final permanece estable antes de `Service` |

Los solapes producen fundidos, pero cada promesa tiene un momento legible. Al terminar la
apertura, el scrollytelling actual continúa desde `Tu equipo recibe el contexto completo.`
Las siete escenas restantes usan `700vh` en móvil y `800vh` en desktop;
la página completa permanece por debajo de 12 viewports narrativos.

Al hacer scroll hacia arriba, las miniaturas vuelven de forma determinista a sus celdas. El
punto no representa una nueva acción inversa: permanece en el destino mientras la tarjeta
empieza a desaparecer y después punto, trazo y tarjeta se funden juntos antes de restaurar
el mosaico.

## Arquitectura de componentes

La apertura y el resto de la historia permanecen dentro de la misma isla React
`HomepageStory`, pero usan dos raíces de scroll consecutivas para mantener responsabilidades
claras:

```text
HomepageStory
├── OpeningJourney                 # video, mosaico y handoff a canales
│   ├── OpeningVideo
│   ├── OpeningMosaic
│   ├── SharedTileLayer            # mueve las 4 miniaturas entre anclas medidas
│   └── ChannelHandoff             # filas, reserva y conector medido
└── AnimatedStory                  # Service → AI
```

Los componentes nuevos viven en `src/components/interactive/home-opening/`. El metadata de
los 17 assets, sus posiciones desktop/móvil y los cuatro canales se mueve a
`opening-tiles.ts`; ninguna escena duplica esas listas.

`SquareHero.tsx` se conserva como API para `/scrollytelling`, pero pasa a ser un wrapper de
los componentes compartidos en variante `mosaic-only`. `/` usa la variante
`channel-handoff`. La ruta secundaria debe conservar su comportamiento y no mostrar los
canales nuevos.

`SharedTileLayer` mide el rectángulo de cada celda fuente y de cada placeholder destino. Una
sola copia visual por asset interpola traslación y escala entre ambos rectángulos. Los nodos
fuente y destino se ocultan sólo durante el viaje para evitar duplicados. `ResizeObserver`,
carga de fuentes y cambios de breakpoint recalculan la geometría; no se codifican offsets de
recorrido por viewport.

`ChannelHandoff` reutiliza o extrae la geometría ya validada en `ChannelsScene`: origen,
destino, SVG, punto y longitud activa proceden del mismo conjunto de puntos medidos. Si una
medición todavía no es válida, las miniaturas permanecen en el último estado estable y el
conector queda invisible; nunca se muestra una ruta aproximada.

`story.ts`, `StoryStage` y `ReducedMotionStory` dejan de tratar `entry` y `channels` como
capas del sticky posterior. `channels` continúa existiendo como contenido de la apertura y
como label semántico; el progreso narrativo posterior empieza en `service`. Los datos de la
reserva siguen procediendo de `STORY_FIXTURE`.

No se añade otra librería de animación ni una llamada de red. La transición usa Framer Motion,
`ResizeObserver` y assets locales.

## Responsive

### Desktop y tablet horizontal

- las cuatro miniaturas viajan hacia una lista a la izquierda;
- la tarjeta de reserva queda a la derecha;
- la ruta usa codos ortogonales en el espacio entre ambos paneles;
- el título de canales aparece sin tapar el recorrido.

### Tablet vertical y móvil

- el mosaico conserva su grid móvil actual;
- las miniaturas se desplazan distancias cortas hacia una lista vertical;
- labels y resultados aparecen mediante crossfade durante la parte final del movimiento;
- la tarjeta queda debajo de la lista;
- la ruta baja por el margen del ledger y entra en la tarjeta sin cruzar texto;
- no existe overflow horizontal a `320px`.

La misma relación y los cuatro canales permanecen visibles; móvil no elimina miniaturas ni
promesas principales.

## Reduced motion, no-JS y accesibilidad

Con `prefers-reduced-motion`, la apertura no usa un sticky largo ni reproduce el video. Se
muestra el poster, el H1 y los CTAs; debajo aparece un mosaico estático compacto seguido por
la lista de cuatro canales y el resumen `Booking Widget → Reserva confirmada`.

La variante `noscript` conserva el mismo orden semántico. El H1, apoyo, CTAs, títulos de
canales y relación con la reserva existen en el HTML inicial.

- las fotografías y dibujos usados junto a labels visibles llevan `alt=""`;
- los overlays viajeros, SVG y punto son `aria-hidden`;
- ninguna relación depende únicamente de color;
- los CTAs conservan focus visible y un área mínima de 44 px;
- el scroll no se bloquea y no se modifica `body.style.overflow`.

## Rendimiento y fallos

- `/video4.webm` es el único medio pesado eager y no se duplica en el DOM;
- el poster se genera del mismo video y debe ser menor de 150 KiB;
- las miniaturas no seleccionadas conservan `loading="lazy"` cuando sea compatible con su
  aparición; las cuatro supervivientes se precargan con el mosaico;
- sólo se animan `transform`, `opacity`, `pathLength` y colores puntuales;
- `will-change` se limita al video y a las cuatro miniaturas durante su fase activa;
- si el video falla, el poster permanece y el scroll continúa normalmente;
- si falta geometría medida, no hay salto a coordenadas por defecto: se conserva el último
  estado coherente y se oculta el elemento dependiente.

Los eventos actuales de WhatsApp, signup y `homepage_story_complete` se conservan. No se
añaden eventos por cada checkpoint de scroll.

## Pruebas de aceptación

La implementación debe demostrar automáticamente que:

1. `/` inicia con `/video4.webm`, el H1 original y ambos CTAs;
2. el video se reduce y las 17 miniaturas forman el mosaico sin saltos;
3. existe un intervalo donde el mosaico completo y su copy son legibles;
4. los cuatro assets aprobados terminan dentro de la fila de canal correspondiente;
5. durante cada viaje, la distancia de la miniatura a su destino no aumenta al avanzar;
6. no hay teletransporte visible entre la copia fuente, el overlay y el placeholder destino;
7. existe exactamente una ruta y un punto principal entre `Booking Widget` y la reserva;
8. origen, destino, trazo activo y punto coinciden con tolerancia máxima de 3 px;
9. la escena negra anterior no se monta en `/`;
10. después de la reserva, la siguiente escena activa es `Service`;
11. al volver hacia arriba se restaura el mosaico y desaparecen juntos reserva, ruta y punto;
12. reduced motion y no-JS conservan video/poster, mosaico, canales, relación y CTAs en forma
    estática;
13. `/scrollytelling` conserva su variante de video → mosaico sin el handoff nuevo;
14. Navbar, Footer, FloatingChatbot, enlaces y eventos GTM continúan funcionando;
15. no hay overflow, errores de consola, hydration warnings ni elementos fuera del escenario;
16. `npm run build` termina correctamente.

Viewports obligatorios: `1440×900`, `910×691`, `787×701`, `887×502`, `390×844` y
`320×568`. En cada uno se capturan al menos estos checkpoints: video, mosaico completo,
handoff intermedio, canales resueltos, reserva conectada y primera escena posterior.

## Fuera de alcance

- Cambiar el video, las 17 imágenes o el copy aprobado fuera de la apertura.
- Rediseñar Navbar, Footer o FloatingChatbot.
- Modificar las escenas `Service` a `AI`, salvo sus rangos y el arranque necesario para
  recibir el handoff.
- Cambiar `/demo`, backend, dashboard, POS, TPV o MCP.
- Añadir nuevos canales, APIs, analítica por scroll o librerías de animación.
- Restaurar puntos o conectores decorativos en otras escenas.
