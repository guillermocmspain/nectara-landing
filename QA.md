# Validación — 29 de octubre de 2026

Pruebas automatizadas con Microsoft Edge/Chromium en modo headless, sobre el servidor local. Revisión visual de las etapas de escritorio y móvil frente al recorrido del prototipo aprobado.

## Comprobaciones

- Escritorio: 1440 × 900.
- Vistas móviles: 390 × 844 y 360 × 640, sin desbordamiento horizontal.
- Carga completa sin errores JavaScript ni respuestas HTTP fallidas.
- Navegación por los enlaces de sección, scroll rápido y recorrido inverso.
- Conservación del punto del recorrido al redimensionar: diferencia normalizada menor que 0,00001.
- Apertura, cierre con Escape y acceso a la etiqueta completa.
- Giro fotorealista de la etiqueta: frontal, laterales, parte posterior y regreso a 360°.
- Preferencia del sistema de movimiento reducido y control manual.
- Pérdida simulada del contexto WebGL: imagen de respaldo visible; recuperación del contexto satisfactoria.
- Cierre con regreso de la abeja y las mariposas, sin la deformación ondulada ni el volteo de la abeja descartados durante el prototipado.

## Rendimiento medido

| Recorrido | Muestras | Percentil 95 | Máximo | Fotogramas > 50 ms |
| --- | ---: | ---: | ---: | ---: |
| Escritorio, recorrido de 6 segundos | 360 | 16,8 ms | 17,3 ms | 0 |
| Vista móvil, CPU ralentizada 4×, giro del tarro | 238 | 16,8 ms | 33,5 ms | 0 |

Estas cifras describen el entorno de prueba, no una garantía para todos los dispositivos. Las vistas móviles son emuladas; no equivalen a una prueba física en Safari/iPhone o en todos los dispositivos Android.

Los recursos gráficos ocupan aproximadamente 2 MB. No se incluyen bibliotecas de animación, dependencias de ejecución externas ni vídeo para simular el scroll.

## Actualización: preloader, mapa y miel cruda

- Carga bloqueada de un recurso: el indicador permanece en 89 % y alcanza el 100 % al liberarlo, antes de retirar el preloader.
- Mapa original con punto en las mismas coordenadas. Color muestreado de la referencia: RGB 48, 66, 48 (#304230).
- Zoom y aparición del texto antes del tarro; abeja guía, abejas pequeñas y mariposas ocultas durante la transición.
- Segundo producto con miel oscurecida en el shader, etiqueta conservada y precinto dorado «Miel cruda · Milflores». Giro propio de 360°.
- Revisión visual en escritorio y móvil; corregido un recorte de composición al redimensionar el mapa.
- Repetidas pruebas de navegación, diálogo y movimiento reducido; sin errores JavaScript, recursos fallidos ni desbordamientos a 360 y 390 px.
- Recorrido de 6 segundos: 360 muestras, p95 16,8 ms, máximo 16,9 ms, ninguna muestra superior a 50 ms. Pruebas en Edge headless; móvil emulado.

## Mapa vectorial

Mapa raster sustituido por trazados SVG de Natural Earth, sin fondo rectangular y con paleta botánica. Zoom mediante transformación interna SVG en viewport fijo; punto conservado. Revisión visual de mapa y zoom a 1440 y 390 px. Navegación, diálogo y movimiento reducido correctos; sin errores ni recursos fallidos. Sin desbordamientos a 360/390 px. Recorrido: p95 16,8 ms, máximo 17 ms, cero muestras superiores a 50 ms (Edge headless).

## Textos de origen e historia

Incorporados íntegramente los cuatro párrafos de origen y los cinco de historia facilitados por el usuario. Tramos de lectura vinculados al scroll nativo con títulos fijos y recorrido suficiente hasta el último párrafo. Revisión visual del principio y final de ambos textos a 1440, 390 y 360 px, sin desbordamiento horizontal ni errores JavaScript. En móvil el mapa aparece al terminar la lectura y el tarro deja espacio a la historia.

## Cruce entre productos

El tarro se desplaza de izquierda a derecha en una curva suave mientras el mismo progreso interpola el color y el precinto. Texto de miel cruda a la izquierda. Recorrido inverso verificado; en móvil el desplazamiento se limita al ancho disponible. Revisión a 1440 y 390 px en inicio, mitad y final; sin errores JavaScript y con el tarro dentro de pantalla.

## Disolución del mapa durante el zoom

El mapa claro se desvanece antes de alcanzar los bordes de su viewport. Una capa a todo el ancho funde el fondo de origen con el verde de producto, manteniendo el círculo expansivo. Revisados puntos intermedios y recorrido inverso a 1920 y 390 px, sin franjas laterales, desbordamientos ni errores JavaScript.

## Tipografía y avance de secciones

En escritorio: títulos de 34 px y texto de 15 px, sin máscara, desplazamiento interno ni tramos de lectura adicionales. Comprobados los textos completos a 1440 × 900: el final de origen queda a 638 px y el de historia a 856 px. En móvil se reduce la tipografía conservando el recorrido de lectura para mantener todo el contenido legible.

## Vuelos entre secciones

Salidas y entradas por los laterales para abeja guía, tres abejas pequeñas y seis mariposas. Posiciones de producto con variación por visita y trayectorias reversibles ligadas al scroll. Regreso final desde fuera de pantalla hasta las posiciones originales. Comprobado a 1920 y 390 px: todos los insectos fuera del viewport durante origen e historia, opacidad 1 durante los vuelos, sin errores JavaScript. La mezcla final con la ilustración se conserva únicamente al posarse.

## Preloader continuo y mapa estable

Preloader con fondo botánico a pantalla completa y progreso interpolado por fotograma hacia el recuento real de recursos completados. Prueba: avance monotónico, incremento máximo de un punto porcentual entre muestras y final al 100 %. Abeja movida mediante transform. Mapa sin fundido de entrada ni recentrado durante el zoom: mismo anclaje comprobado en tres puntos de la sección a 1440 y 390 px. En móvil se reserva espacio bajo el texto. Revisión visual sin errores JavaScript.

## Productos limpios y textos breves

Ambos artículos resumidos en dos párrafos. Eliminadas las pausas y el desplazamiento interno de lectura en todas las resoluciones; recorrido móvil reducido de 1700 a 900 svh. Insectos fuera de pantalla desde origen hasta la transición final, incluidas las dos mieles. Comprobados ambos productos sin sprites visibles y dos párrafos completos por artículo a 1440×900, 390×844 y 360×640; sin máscaras, transformaciones del texto ni errores JavaScript.

## Información de los productos

Añadidos los rangos de precio con IVA y las descripciones de las capturas. Tamaños 450/750 g para la miel cremada, los únicos desplegados en la referencia. Texto sin contenedores de scroll; tarro móvil reducido y desplazado para dejar espacio. Revisado a 1440×900, 390×844 y 360×640: texto completo, separación positiva entre descripción y tarro en móvil, sin desbordamiento horizontal ni errores JavaScript.

## Contacto en el cierre

Última sección con dirección facilitada (Calle Caserón, nº 8, 40393 Escobar de Polendos), correo mielnectara@gmail.com y teléfono 606 66 31 81. Enlaces mailto y tel verificados. Ilustración reducida y destinos finales de insectos recalculados para conservar la recomposición. Revisado a 1440×900, 390×844 y 360×640: contacto completo dentro de pantalla, enlaces habilitados, sin errores JavaScript.

## Navegación progresiva del menú

Recorrido controlado por fotograma con curva de aceleración y frenada suaves y duración proporcional a la distancia. Eliminada la asignación anticipada del destino que provocaba el salto inicial. Verificado inicio→miel: progreso monotónico hasta 0,49, paso máximo observado 0,00333. La rueda interrumpe el recorrido, los clics sucesivos sustituyen el destino y movimiento reducido conserva navegación inmediata. Sin errores JavaScript.

## Acceso directo a miel cremada

Nuestra miel usa un fundido verde de 1,52 s, sin recorrer visualmente las secciones. Cambio de posición únicamente con la capa al 100 % de opacidad; destino 0,44 con escena 2 y tarro frontal a 0 grados. Verificado por fotogramas: un único salto bajo cobertura opaca, capa retirada al terminar y sin errores JavaScript.

## Ambos productos en Historia

Pareja frontal de miel cremada y miel cruda con sus nombres, tonos y precintos diferenciados. Vistas generadas una vez con el mismo render del producto, sin nuevas descargas de imágenes ni WebGL adicional. El tarro individual deja paso a la pareja en Historia. Revisadas vistas 1440, 390 y 360 px: sin errores JavaScript, ambos renders presentes y sin superponer texto y tarros. Ajustada la altura móvil para dejar libre el control de movimiento.

## Giro automático de la pareja

Ambos tarros usan render WebGL independiente para un giro completo cada 32 segundos, en sentidos opuestos. Solo se actualizan mientras la sección está visible y se detienen con movimiento reducido o pestaña oculta. Prueba sin scroll: ángulo de 4,88° a 50,29° con scrollY constante (8514); p95 17 ms, ningún fotograma >50 ms y sin errores JavaScript. Movimiento reducido devuelve ambas vistas al frontal.

## Alineación de las filas

Origen e Historia centrados verticalmente en escritorio. Texto y pareja de tarros comparten centro; anclaje del mapa ajustado al mismo centro visual sin alterar su zoom. Revisión visual a 1440×900. Vistas móviles de 390 y 360 px mantienen disposición en columna y contenido dentro de pantalla, sin errores JavaScript.

## Botones Añadir al carrito

Sustituido el botón de etiqueta por Añadir al carrito y añadido su equivalente en miel cruda. Carrito local con cantidades, retirada de artículos y persistencia. No se inventan precios por formato ni se habilita un checkout sin conexión comercial: el diálogo informa de que formato/importe final están pendientes y la compra online no está habilitada. Probados en vista móvil: añadir ambos productos, recargar, persistencia, quitar miel cruda y cerrar con Escape. Sin errores JavaScript.

## Menú móvil inspirado en Poppr y portada

Referencia leída en el tema local Poppr: panel completo, cierre circular y navegación amplia; adaptación con paleta y fuentes de Néctara. Menú nativo dialog con foco contenido, cierre Escape, aria-expanded, enlaces de sección, correo y acceso al carrito. Verificado a 390×844 y 360×640 sin scroll del menú; enlace a miel mantiene el fundido verde y el carrito abre correctamente. Portada elevada 35 px lógicos en escritorio y 18 px en móvil, con trayectorias de insectos ajustadas. Flecha SVG ampliada a 64/62 px con movimiento suave que se desactiva al reducir movimiento. Sin errores JavaScript.

## v20 — Botanical edges
- Hero and closing use botanical-complete.webp; both panels remain inside the viewport at their original proportions. Mobile places the complete composition at the bottom.
- Checked opening/closing at 1920x950 and 390x844 in Edge; no page errors.
- Asset edited using built-in image_gen. Prompt: preserve the vintage botanical style, sunflowers, lilies, lavender, clover, honey jar, partridge and black/gold urn; complete cropped flowers and foliage; leave mint margin on all edges and a broad empty center; no text or new objects. Output assets/botanical-complete.webp, converted to WebP for delivery.

## v21 — Direct menu navigation
- Added Historia and Contacto to desktop navigation; matching mobile labels.
- All menu destinations use the existing 1.52s opaque-veil transition, colored to match the destination. Scene changes occur only at full opacity; reduced motion jumps directly.
- Edge checks at desktop/mobile confirmed Contacto → Origen, Historia and Nuestra miel never render intermediate scroll positions uncovered. No page errors; tablet header fits at 780px.

## v23 — Upright products and header bag
- Removed lateral product tilt while retaining cylindrical label rotation and product crossing.
- Replaced floating cart with a header shopping bag and live quantity badge; removed Discover and floating motion control. System reduced-motion preference remains supported.
- Edge checked at 1440x900, 390x844 and 360x640: upright WebGL jar, header fits, add-to-cart updates badge and bag reopens dialog; no page errors.

## v26 — Mobile flight stability
- Reviewed supplied 10.52s iPhone recording: browser chrome expands/collapses while the opening scene moves backward/forward; bee atlas is visibly split in some frames.
- Height-only resize no longer restores lagging animation progress through scrollTo. Width changes preserve actual scroll progress; browser height updates only remeasure layout.
- Wing atlas selects integer frames from the animation clock, avoiding interpolated CSS background positions; cached sprite elements and ping-pong frame sequence.
- Edge mobile emulation: 20 resize events during scrolling caused zero programmatic scroll writes; sampled wing offsets resolve to integer frames; automatic history jar angle advances; no page errors. Physical iPhone verification remains external.
