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
