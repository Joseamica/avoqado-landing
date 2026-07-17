# Homepage `/`: jerarquía narrativa persistente

> Dirección aprobada visualmente por el fundador el 2026-07-15 mediante el prototipo
> `narrative-context-v2.html`. Esta especificación complementa
> `2026-07-10-homepage-scrollytelling-design.md` y sustituye únicamente las restricciones de
> jerarquía textual y pacing de las especificaciones del opening del 14 y 15 de julio.

Cuando exista una contradicción, esta especificación y la implementación actual tienen
precedencia para la composición de la página, el opening, el cierre ilustrado, la continuidad
textual y el pacing. En particular, se conservan las dos raíces de scroll actuales, el video,
el mosaico y la sección `FAQ` recuperada después de la especificación base.

## Objetivo

Hacer que la historia de la homepage se entienda en la primera lectura, incluso con un mouse
de desplazamiento rápido. Cada capítulo debe decir una sola idea, demostrarla con producto y
cerrar con una consecuencia clara. El visitante nunca debe decidir entre leer un titular y
seguir una animación que cuenta otra cosa.

La regla aprobada es:

> **El titular mantiene la idea. La interfaz demuestra. El resultado cierra.**

## Alcance

El nuevo sistema de lectura se aplica a los ocho capítulos explicativos:

1. Entradas de la operación (`ChannelHandoff`).
2. Servicio y contexto.
3. Cobro.
4. Después del servicio.
5. Operación.
6. Finanzas.
7. Sucursales.
8. IA.

La introducción de video y mosaico conserva su papel cinematográfico: presenta la promesa
general y la variedad de negocios antes de empezar la explicación causal. El cierre ilustrado
`¿Quieres saber todo de Avoqado?`, su flecha dibujada y el chatbot flotante también se
conservan; son una invitación final, no otro capítulo explicativo.

No se cambia `/demo`, el backend, los productos representados ni la arquitectura general de
la homepage.

El opening conserva exactamente sus mecánicas aprobadas: video → mosaico de 17 piezas, cinco
entradas públicas, tres ejemplos animados y un único conector medido. En `ChannelHandoff`
solamente cambia la jerarquía de lectura; no cambian sus imágenes, canales ni resultados.
También permanece el hero aprobado: `Cobra, administra y crece.`, `El primer sistema
todo-en-uno en México` y su apoyo actual con pagos, operación, ChatGPT y Claude.

## Problema actual

`SceneFrame` muestra simultáneamente eyebrow, titular grande, párrafo y mockup. A la vez, cada
mockup comienza a animarse casi desde el inicio de la escena. El resultado es una competencia
entre dos narradores.

Además:

- algunos titulares ocupan cuatro o más líneas dentro de una columna de 34%;
- el párrafo y el mockup piden atención antes de terminar de leer el titular;
- los cambios de escena usan una ventana global de `0.018`, que puede sentirse como un solo
  gesto de rueda;
- la escena de Operación promete seis sistemas, enumera más categorías y muestra cinco pasos;
- la IA menciona que Sucursal Norte bajó su ticket sin que la escena anterior lo haya probado.

## Contrato narrativo de cada capítulo

Cada capítulo usa el mismo orden y el mismo elemento de titular durante toda su vida:

1. **Idea:** aparece el eyebrow y el titular ancla. El visual está presente sólo como ambiente.
2. **Hilo:** el titular se compacta sin cambiar de texto ni saltos de línea. El eyebrow cruza
   hacia una referencia concreta de la misma historia.
3. **Demostración:** la interfaz revela pasos acumulativos. No aparecen frases grandes que
   sustituyan el titular.
4. **Resultado:** se agrega una conclusión debajo del titular. La interfaz baja de contraste,
   pero conserva el estado alcanzado.
5. **Salida:** todo el capítulo sale de manera reversible al entrar el siguiente.

La jerarquía visible es:

`eyebrow → titular ancla → referencia + demostración → resultado`

El párrafo explicativo deja de competir en la versión animada. Su información vive en los
labels del producto, el resultado y el resumen semántico. La versión reducida conserva una
explicación textual completa.

## Copy y continuidad aprobados

Toda la historia usa el fixture actual de Estudio Lumina, María G., Ana Torres, Sucursal Centro
y el pago de `$348.10`.

| Capítulo | Eyebrow inicial | Titular ancla | Referencia persistente | Resultado |
|---|---|---|---|---|
| Entradas | `Una sola operación` | `Tu cliente reserva, compra o paga como prefiera.` | Canal activo, por ejemplo `Reservación en línea → Reserva confirmada` | `Todo llega conectado al mismo negocio.` |
| Servicio | `Todo empieza con una reservación` | `La reservación llega con todo el contexto.` | `María G. · 11:30 · Facial hidratante` | `Tu equipo sabe a quién atender y qué preparar.` |
| Cobro | `Al terminar el servicio` | `El pago conserva de dónde vino.` | `Misma visita · María G. · $348.10` | `Siempre sabes cómo entró el dinero.` |
| Cliente | `Después del cobro` | `El recibo hace más que confirmar el pago.` | `Mismo pago · $348.10 · Recibo enviado` | `El siguiente paso comienza desde el mismo recibo.` |
| Operación | `Mientras María recibe su recibo` | `Una venta pone toda la operación en movimiento.` | `Misma venta · María G. · $348.10` | `Tu negocio avanza sin capturar lo mismo otra vez.` |
| Finanzas | `Después del cobro` | `Ese mismo pago llega identificado hasta tus libros.` | `Misma referencia · AVQ-34810` | `La referencia acompaña al dinero.` |
| Sucursales | `Ahora abre el panorama` | `Cada sucursal cuenta en la misma vista.` | `Estudio Lumina · 3 sucursales` | `Cambias de sucursal sin perder el panorama.` |
| IA | `Con todo conectado` | `Para entender tu negocio, solo pregunta.` | `Mismo contexto · Estudio Lumina` | `ChatGPT o Claude responden con el contexto de Avoqado.` |

### Resumen semántico exacto

Este copy se muestra completo en reduced motion y no-JS. En la versión animada permanece en el
HTML para accesibilidad, pero no compite visualmente con el titular:

| Capítulo | Resumen |
|---|---|
| Entradas | `Desde una reservación o liga de pago hasta el punto de venta o la terminal física: todo llega conectado a Avoqado.` |
| Servicio | `María, su servicio, la colaboradora, la sucursal y el producto llegan juntos.` |
| Cobro | `TPV, tienda en línea, liga o efectivo quedan ligados a la misma visita. En TPV compatibles, el operador elige manualmente una Cuenta de cobro habilitada.` |
| Cliente | `María recibe su comprobante y, si la sucursal lo tiene configurado, puede reseñar o facturar desde ahí.` |
| Operación | `El mismo evento actualiza venta, inventario, reorden, cliente y equipo.` |
| Finanzas | `Costo, liquidación esperada, conciliación y póliza conservan la misma referencia.` |
| Sucursales | `Compara Centro, Roma y Norte sin salir de Estudio Lumina.` |
| IA | `ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.` |

La secuencia causal debe poder leerse sin los mockups:

`María reserva → el equipo recibe contexto → María paga → recibe su comprobante → la venta
actualiza la operación → el pago llega a finanzas → el dueño compara sucursales → pregunta a
la IA`.

### Evidencia que debe mostrar cada interfaz

- **Entradas:** permanecen visibles reservación, tienda en línea, liga de pago, punto de venta
  y terminal de cobro. Tres ejemplos breves recorren el conector; el resultado final no
  depende de verlos todos animados.
- **Servicio:** la ruta de la reserva queda dibujada tenuemente cuando llega a la agenda. La
  agenda conserva cliente, servicio, colaboradora y sucursal.
- **Cobro:** primero se reconoce el canal, después aparece `Cuenta de cobro` y finalmente se
  confirma `Operación diaria`. La selección sigue siendo manual y sólo en TPV compatible.
- **Cliente:** el recibo permanece como origen mientras se revelan reseña y facturación. La
  facturación se presenta como opción configurada, no como automatismo universal.
- **Operación:** venta, inventario, reorden, CRM/lealtad y equipo se acumulan. No se usa un
  número cerrado de “sistemas”.
- **Finanzas:** pago, costo, liquidación esperada, conciliación y póliza se acumulan con la
  misma referencia. Liquidación y póliza conservan sus límites de producto y configuración.
- **Sucursales:** la jerarquía se transforma en dashboard, pero queda un breadcrumb como
  `Estudio Lumina → Sucursal Norte`. El dashboard muestra `Ticket $184 · -8%` para Norte y
  prepara la pregunta de IA.
- **IA:** la pregunta y la respuesta aparecen por bloques. La respuesta sólo usa hechos ya
  mostrados: ticket de Norte, siete piezas de crema facial y reorden sugerido. Sus CTAs entran
  con el resultado, no durante la pregunta.

Cobro y Cliente no reciben nuevas rutas ni `data-story-primary-pulse`. La continuidad en esas
escenas es el texto de referencia. Junto a cada referencia aparece un marcador verde estático
de `7px`; no viaja, no escala y no se registra como pulso animado.

## Línea de tiempo local

Cada capítulo recibe un `localProgress` de `0` a `1`. Las fases aprobadas son:

| Progreso local | Comportamiento |
|---|---|
| `0.00–0.18` | Lectura limpia: titular completo, eyebrow visible, visual al 14%. |
| `0.18–0.38` | El titular se compacta; entra el visual; eyebrow cruza a la referencia. |
| `0.38–0.73` | La interfaz narra los pasos y el titular permanece compacto. |
| `0.73–0.84` | Entra el resultado; el visual baja al 65% de énfasis. |
| `0.84–0.93` | Pausa de lectura sin introducir información nueva. |
| `0.93–1.00` | Salida reversible hacia el siguiente capítulo. |

Las curvas continuas usan `smoothstep` o su equivalente en Framer Motion. Los cambios de estado
narrativo se interpolan dentro de ventanas de progreso local; no usan duraciones, timers ni
transiciones CSS que puedan quedar rezagadas respecto al scroll.

### Umbrales de demostración

Los pasos terminan antes de `0.73` para no competir con la conclusión:

| Capítulo | Umbrales locales y estados |
|---|---|
| Entradas | `0.30` reservación, `0.45` liga de pago, `0.60` terminal física |
| Servicio | `0.30` reserva, `0.43` ruta, `0.56` agenda, `0.68` contexto completo |
| Cobro | `0.32` canal reconocido, `0.50` selector visible, `0.67` cuenta confirmada |
| Cliente | `0.32` recibo enviado, `0.50` reseña, `0.67` facturación configurada |
| Operación | `0.30` venta, `0.40` inventario, `0.50` reorden, `0.60` CRM, `0.68` equipo |
| Finanzas | `0.30` pago, `0.40` costo, `0.50` liquidación, `0.60` conciliación, `0.70` póliza |
| Sucursales | `0.30` Centro, `0.40` Roma, `0.50` Norte, `0.56` dashboard, `0.66` selector Norte |
| IA | `0.32` pregunta, `0.52` respuesta, `0.68` contexto conectado |

Cada estado entra mediante una ventana scrub de `0.04` centrada en su umbral. El estado queda
completo al terminar esa ventana y permanece visible; no salta instantáneamente ni depende del
reloj.

Todos los estados se derivan del progreso actual. Al desplazarse hacia arriba, cada paso,
resultado y transformación se deshace; no existe estado persistente de “ya animado”.

## Movimiento del texto y el visual

- El titular es un único nodo y mantiene un ancho estable.
- Se compacta con `scale(1 → 0.72)` y `transform-origin: left top`.
- El bloque narrativo sube como máximo `14px`.
- No se anima `font-size`, ancho, alto, márgenes ni saltos de línea.
- Eyebrow y referencia comparten una línea de altura fija y hacen crossfade.
- El visual entra con opacidad `0.14 → 1`, `translateY(14px → 0)` y escala `0.987 → 1`.
- Cuando entra el resultado, el visual conserva su estado y baja a `0.65` de opacidad.
- El resultado entra con opacidad y `translateY(14px → 0)`.
- Las transiciones entre capítulos son relativas al rango local, no una constante global.
- Las escenas intermedias entran entre `0.00–0.07` y salen entre `0.93–1.00`. Servicio empieza
  completamente visible; IA permanece visible hasta que el sticky se libera.
- No se añaden frases rotativas, typewriter, carruseles automáticos ni autoplay temporal.

## Duración global

`AnimatedStory` aumenta de `800vh` a `1000vh` en desktop y de `700vh` a `900vh` en móvil. Con
el opening actual, el recorrido explicativo hasta IA permanece dentro del hard cap de 14
viewports definido en la especificación base. Ese cap excluye deliberadamente la invitación
final `FAQ` de `300vh`, que funciona como CTA separado, y el Footer.

Los rangos globales se ajustan así:

| Escena | Rango |
|---|---|
| Servicio | `0.00–0.15` |
| Cobro | `0.14–0.30` |
| Cliente | `0.29–0.44` |
| Operación | `0.43–0.62` |
| Finanzas | `0.61–0.76` |
| Sucursales | `0.75–0.90` |
| IA | `0.89–1.00` |

Operación conserva el tramo más largo; IA es más breve porque su interfaz tiene tres beats.
El capítulo de Entradas sigue dentro de `OpeningJourney`, pero adopta el mismo contrato local
sin alterar la transformación video → mosaico.

## Layout

### Desktop, desde 1024 px

- Grid `minmax(280px, 41fr) minmax(500px, 59fr)`.
- Ancho máximo `1320px`.
- Titular de `clamp(46px, 4.4vw, 70px)` con ancho máximo de `13ch`.
- El resultado no supera `32ch`.
- La interfaz comienza visualmente subordinada y ocupa el foco sólo después de la lectura.

### Tablet

- Copy en la parte superior izquierda y visual debajo, como en la composición actual.
- Se conserva el mismo titular y la misma transformación; sólo cambia el origen y la escala
  final necesaria para que no invada el visual.
- Los mockups se simplifican antes de reducir el texto principal.

### Móvil, bajo 768 px

- Filas `minmax(220px, 38fr) minmax(0, 62fr)`.
- Padding horizontal mínimo de `24px` cuando el viewport lo permita.
- Titular de `36–48px`, máximo `14ch`.
- Se ocultan detalles secundarios de interfaz, pero no el hilo, la acción principal ni el
  resultado.
- El título compacto no cambia de saltos de línea durante el scroll.
- Los CTAs mantienen mínimo `44px` y nunca quedan debajo del chrome del navegador.

## Arquitectura de componentes

### Datos

Se introduce un contrato de datos común:

```ts
interface NarrativeBeat {
  eyebrow: string;
  title: string;
  thread: string;
  result: string;
  body: string; // resumen completo para reduced motion y HTML semántico
  stepThresholds: readonly number[];
}

interface StoryScene extends NarrativeBeat {
  id: StorySceneId;
  range: readonly [number, number];
  progressLabel: string;
  theme: 'dark' | 'light';
}
```

`story.ts` sigue siendo la fuente de verdad para orden, copy y rangos. Los valores concretos
de María, sucursales y pago continúan en `story-fixture.ts` y no se duplican dentro de escenas.
Se añade `paymentReference: 'AVQ-34810'` al fixture para eliminar la referencia escrita a mano
en Finanzas y reutilizarla en Cliente, Operación e IA.
También se añaden `organizationTicket: '$192'`, `comparisonVenueTicket: '$184'` y
`comparisonVenueTicketChange: '-8%'`. Sucursales muestra `Sucursal Norte · Ticket $184 · -8%`
antes de que IA pregunte qué sucursal bajó su ticket.

### Presentación

Se extrae un componente enfocado `NarrativeAnchor`:

- recibe `narrative: NarrativeBeat`, `progress`, un `thread` opcional calculado, nivel de
  heading y acciones opcionales;
- renderiza eyebrow, referencia, el mismo heading y el resultado;
- deriva únicamente valores de movimiento continuos;
- no conoce el contenido del mockup.

`SceneFrame` queda como layout compartido y compone `NarrativeAnchor` con el visual. Recibe
`localProgress` explícitamente. `ChannelHandoff` define `OPENING_CHANNEL_NARRATIVE` como
`NarrativeBeat` y reutiliza el mismo componente. Su `sequenceProgress` es el progreso narrativo
local; el `thread` calculado es la relación del canal activo. Sus tres demostraciones se
remapean dentro de `0.30–0.70` y ya no comienzan mientras se lee el titular.

Cada escena conserva la responsabilidad de sus pasos de producto. Sus animaciones internas se
remapean a `stepThresholds`; no leen `window.scrollY` ni agregan timers.

`StoryLayer` conserva montaje simultáneo e `inert` para capas inactivas, pero calcula entrada y
salida como fracciones de cada rango. No vuelve a usar `0.018` como ventana universal.

`StoryProgress` reemplaza el milestone inexistente `entry` por `service`; el rail vuelve a
mostrar el inicio real de la historia posterior al opening.

## Accesibilidad, SEO y reduced motion

- El H1 del hero y todos los H2 existen en el HTML inicial.
- En la experiencia animada, `body` queda disponible como resumen para tecnologías de
  asistencia sin competir visualmente.
- `ReducedMotionStory` muestra eyebrow, titular, body, resultado y una representación estática
  del estado final; no usa sticky, scrub, escala ni crossfade.
- `noscript` conserva el mismo orden y copy.
- Eyebrow y referencia no dependen sólo del color; la referencia incluye texto concreto.
- Las capas inactivas siguen con `aria-hidden` e `inert`.
- El resultado visible no introduce información que sólo pudiera descubrirse animando.
- `?motion=full` continúa forzando la experiencia animada para QA.

## Cierre ilustrado y chatbot

La sección `FAQ` continúa inmediatamente después de `HomepageStory`:

- el texto y la flecha se dibujan conforme avanza el scroll;
- al subir, ambos se desdibujan de forma reversible;
- el overlay portal nunca permanece visible fuera de su sección;
- el círculo termina alrededor del chatbot flotante;
- Navbar y banner sólo se ocultan mientras la invitación está realmente activa.

La nueva jerarquía no incorpora esta flecha dentro de la escena de IA ni duplica la invitación.

## Claims que se conservan

1. La Cuenta de cobro se elige manualmente en terminales compatibles y configuradas.
2. Facturación desde el recibo depende de configuración y no se presenta como universal.
3. Liquidación es esperada/conciliada, nunca instantánea o garantizada.
4. Inventario, CFDI y otros módulos Premium conservan su indicación correspondiente.
5. ChatGPT y Claude consultan el contexto disponible mediante Avoqado MCP; no se promete una
   acción autónoma no demostrada.

## Pruebas y criterios de aceptación

1. Los ocho capítulos explicativos siguen `idea → hilo → demostración → resultado`.
2. Ningún titular cambia de texto ni de saltos de línea mientras su escena está activa.
3. El visual no supera 14% de énfasis antes de que termine la fase de lectura.
4. Todos los pasos internos concluyen antes de `0.73` del progreso local.
5. Cada resultado permanece legible durante `0.84–0.93` sin información nueva.
6. Scroll hacia arriba reproduce exactamente el recorrido inverso.
7. La misma María, pago, referencia y sucursales conectan toda la historia.
8. La escena de Sucursales prepara los datos usados por la pregunta de IA.
9. Reduced motion y `noscript` conservan body y resultado de cada escena.
10. El cierre ilustrado aparece sólo al final y desaparece al regresar hacia arriba.
11. No hay overflow horizontal, clipping ni cambios de línea a 390, 768, 1024 y 1440 px.
12. La matriz visual cubre `1440×900`, `1024×768`, `910×691`, `887×502`, `787×701`,
    `390×844` y `320×568` en intro, demostración y resultado.
13. Se prueba scroll lento, rueda rápida, trackpad y Page Down en Chromium.
14. En cada escena existe un solo heading; conserva el mismo nodo, texto, `font-size`,
    `offsetWidth`, `offsetHeight` y número de líneas entre intro, demo y resultado. Sólo cambia
    su `transform`.
15. Dos checkpoints dentro de cada plateau de intro, demo y resultado conservan el mismo estado
    narrativo; no son únicamente transiciones sin tiempo de lectura.
16. No hay errores de consola, hydration warnings ni elementos interactivos en capas inactivas.
17. Navbar, CTAs, Footer, chatbot flotante, analítica y `/demo` siguen funcionando.
18. `npm run build` y la suite específica de homepage terminan correctamente.

## Fuera de alcance

- Crear nuevos assets o regenerar fotografías.
- Cambiar la promesa principal del hero ya aprobada.
- Rediseñar Navbar, Footer, FloatingChatbot o `/demo`.
- Añadir capítulos, carruseles, autoplay por tiempo o interacción manual con los mockups.
- Cambiar lógica real de pagos, merchants, inventario, finanzas, sucursales o MCP.
