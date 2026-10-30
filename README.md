# Néctara

Landing de producto estática basada en el prototipo visual aprobado: portada botánica, abeja guía sin volteos ni deformaciones, mariposas acompañantes, tarro fotorealista con etiqueta de 360 grados y regreso final a la ilustración original.

## Desarrollo

No necesita instalar dependencias ni compilar.

```sh
python -m http.server 4173
```

Abrir `http://localhost:4173`. Los módulos y las texturas requieren un servidor HTTP; no abrir directamente con `file://`.

## Archivos

- `index.html`: contenido, navegación y diálogo de la etiqueta.
- `styles.css`: composición adaptable, tipografía y animación de alas.
- `app.js`: recorrido ligado al scroll, trayectorias, accesibilidad y proyección cilíndrica WebGL.
- `assets/`: recursos WebP optimizados derivados de los materiales aprobados de Néctara.

La etiqueta completa original se proyecta sobre el tarro fotográfico. En Historia se reproduce un vídeo local optimizado de los dos tarros abriéndose e inclinándose a la vez. Se carga al acercarse a la sección, avanza y retrocede según el scroll, se mantiene quieto al parar y no se reproduce automáticamente. La llegada y salida de las abejas comparte un tramo de scroll tres veces más largo. Con movimiento reducido o si falla la reproducción se muestra una imagen estática. No se descargan secuencias de fotogramas. El scroll del navegador sigue siendo nativo; una interpolación breve suaviza las posiciones.

## Accesibilidad y compatibilidad

Se respeta `prefers-reduced-motion` y existe un control visible para reducir el movimiento. Los elementos decorativos quedan fuera del árbol accesible. La etiqueta se abre en un diálogo accesible y puede consultarse en grande. Sin WebGL se conserva una imagen del producto y el acceso a la etiqueta completa. Sin JavaScript queda disponible el contenido básico.

Los textos, fotografías e ilustraciones de marca se han incorporado para este proyecto. No se incluye una licencia de reutilización de los materiales de Néctara.

## Publicación

GitHub Pages, rama `main`, directorio raíz. `.nojekyll` evita procesamiento innecesario. Las rutas son relativas para funcionar bajo `/nectara-landing/`.

No hay formularios de compra, pagos ni variedades inventadas. La llamada de producto permite consultar su etiqueta original.

El mapa es SVG sin fondo: geometría de España y Portugal de Natural Earth (dominio público), con ornamentación botánica vectorial propia. Fuente: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson . El zoom transforma los trazados dentro de un viewport SVG fijo para evitar ampliar una textura rasterizada.
