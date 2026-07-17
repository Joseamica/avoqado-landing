# Homepage scrollytelling en producción y landing anterior en `/legacy`

> Dirección aprobada por el fundador el 2026-07-16: publicar la nueva homepage
> scrollytelling en `/` y conservar el landing anterior como una ruta pública `/legacy`.

## Objetivo

Reemplazar la homepage de producción sin perder una referencia funcional del landing anterior.
La ruta principal debe servir la experiencia scrollytelling aprobada, mientras `/legacy` permite
consultar la composición previa en caso de comparación o rollback visual.

## Arquitectura

`src/pages/index.astro` conserva la nueva homepage ya implementada. Se añade
`src/pages/legacy.astro` con la estructura del `index.astro` que existe en `main` antes del
merge.

La página legacy reutiliza los componentes compartidos que no cambiaron entre `main` y la rama:

- `IndustryAccordion`
- `SuiteShowcase`
- `UnifiedPlatform`
- `EarlyAccessCTA`
- `ChatbotCTA`
- `Footer`
- `FloatingChatbot`

Las piezas cuyo comportamiento sí cambió se congelan dentro de `src/components/legacy/`:

- `LegacySquareHero.tsx`, basado en el `SquareHero.tsx` anterior.
- `LegacyFAQ.tsx`, basado en el `FAQ.tsx` anterior.
- `LegacyDoodleBackground.tsx`, dependencia visual del FAQ anterior.

La navegación usa el `Navbar` actual. Esto mantiene enlaces, accesibilidad y navegación global
consistentes sin duplicar el menú completo; la referencia legacy preserva el contenido y el flujo
principal del landing anterior, no una copia independiente de todo el sitio.

## SEO y descubrimiento

`/legacy` es accesible directamente pero no forma parte de la navegación pública. Incluye:

```html
<meta name="robots" content="noindex, nofollow" />
<link rel="canonical" href="https://avoqado.io/" />
```

De esta forma sirve como referencia interna sin competir con `/` ni generar contenido duplicado
en buscadores.

## Comportamiento y compatibilidad

- `/` mantiene exactamente la homepage scrollytelling aprobada y `?motion=full` sigue funcionando.
- `/legacy` conserva el video, mosaico, textos, secciones de producto y CTA del landing anterior.
- Los assets existentes se reutilizan; no se copian imágenes ni videos.
- No se cambia `/demo`, precios, productos, ayuda, Navbar, Footer ni backend.
- No se añaden dependencias.
- Ambas páginas deben funcionar en desktop, móvil, reduced motion y sin JavaScript conforme a sus
  capacidades actuales.

## Pruebas

Una prueba Playwright debe fallar antes de crear la ruta y después comprobar:

1. `/` contiene `data-scrollytelling` y una raíz con `data-story-mode`.
2. `/legacy` responde correctamente y contiene `data-legacy-homepage`.
3. `/legacy` presenta el titular y las secciones esenciales del landing anterior.
4. `/legacy` contiene `noindex, nofollow` y canonical hacia `https://avoqado.io/`.
5. `/legacy` conserva Navbar, Footer y chatbot.
6. `/demo` sigue sin montar componentes de ninguna de las dos homepages.

También deben pasar el build de producción y la suite de homepage antes y después del merge.

## Integración y producción

1. Implementar y verificar la ruta en `codex/homepage-scrollytelling`.
2. Confirmar que `origin/main` no avanzó; integrar sus cambios si fuera necesario.
3. Hacer merge de `codex/homepage-scrollytelling` en `main` sin eliminar el worktree hasta
   verificar producción.
4. Ejecutar pruebas y build sobre el resultado de `main`.
5. Subir `main` a `origin`; este push activa el despliegue configurado del repositorio.
6. Verificar `https://avoqado.io/` y `https://avoqado.io/legacy` por contenido, no sólo por HTTP 200.

El commit previo de `main` permanece en el historial como rollback exacto adicional. No se borra la
rama ni el worktree durante esta publicación para permitir correcciones inmediatas si la validación
de producción detecta un problema.

## Fuera de alcance

- Añadir `/legacy` al sitemap o a la navegación.
- Mantener sincronizadas futuras mejoras entre `/` y `/legacy`.
- Crear un selector público entre homepages.
- Cambiar el pipeline de despliegue o introducir feature flags.
