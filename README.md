# Toma y lee

**Toma y lee** es una biblioteca online colaborativa pensada para reunir libros, PDFs, audiolibros y recursos que acompañen la fe, la formación cristiana y la interioridad.

La idea del proyecto es simple: que una buena lectura no quede perdida, sino que pueda llegar a alguien que la necesita.

## Descripción

Toma y lee permite a los usuarios descubrir, guardar, recomendar y compartir lecturas dentro de una comunidad.  
No funciona solo como un catálogo de libros, sino también como una pequeña biblioteca personal donde cada usuario puede marcar lo que quiere leer, lo que está leyendo y lo que ya leyó.

El proyecto combina lectura, comunidad y tecnología para facilitar el acceso a recursos formativos y espirituales.

## Funcionalidades principales

### Catálogo de libros

Los usuarios pueden explorar una biblioteca colaborativa con libros cargados por la comunidad.

Cada libro puede incluir:

- título;
- autor;
- descripción;
- portada;
- categoría;
- tags temáticos;
- PDF;
- link externo;
- audiolibro.

### Publicación de libros

Los usuarios registrados pueden compartir libros o recursos desde un formulario de publicación.

Al publicar un libro se puede agregar:

- información básica;
- categoría;
- tags;
- portada;
- archivo PDF;
- link externo;
- link de audiolibro.

### Audiolibros integrados

Si el enlace de audiolibro pertenece a YouTube o Spotify, la plataforma lo detecta y lo muestra embebido dentro de la ficha del libro.

Si el enlace pertenece a otra plataforma, se muestra como botón externo.

### Reseñas y valoración

Los usuarios pueden dejar reseñas en los libros.

Cada reseña incluye:

- puntaje;
- comentario;
- dificultad de lectura.

La dificultad puede ser:

- fácil;
- media;
- difícil.

Esto permite orientar mejor a otros lectores según el momento o profundidad que estén buscando.

### Dificultad promedio

La plataforma calcula una dificultad promedio del libro a partir de las reseñas de la comunidad.

Esto ayuda a que cada libro tenga una orientación más clara para nuevos lectores.

### Favoritos

Los usuarios pueden guardar libros en favoritos para volver a ellos más adelante.

Dentro del proyecto, favoritos funciona como una forma de marcar libros que el usuario quiere leer o conservar.

### Minibiblioteca personal

Cada usuario cuenta con una minibiblioteca dentro de su perfil.

La minibiblioteca incluye:

- libros favoritos;
- libros que está leyendo;
- libros que ya leyó;
- libros que compartió.

Esto permite que cada persona construya su propio camino de lectura dentro de Toma y lee.

### Estados de lectura

Los usuarios pueden marcar un libro como:

- **Lo estoy leyendo**
- **Lo leí**

Además, cada ficha de libro muestra cuántas personas lo están leyendo y cuántas ya lo leyeron.

### Tags administrables

El sistema cuenta con tags temáticos administrables desde el panel de administración.

Los tags permiten describir mejor el contenido de cada libro sin depender únicamente de la categoría principal.

Ejemplos de tags:

- oración;
- vida interior;
- santos;
- Biblia;
- fe y razón;
- espiritualidad;
- formación.

### Categorías

Los libros pueden organizarse por categorías generales, administradas desde el panel de administración.

### Contador de vistas

Cada libro cuenta con un contador de vistas.

Esto permite identificar qué libros están despertando más interés dentro de la comunidad y habilita secciones como “Más vistos”.

### Panel de administración

Los usuarios administradores pueden gestionar el contenido de la plataforma.

Desde el panel admin se puede:

- ver libros cargados;
- gestionar libros;
- ocultar o revisar contenido;
- administrar categorías;
- administrar tags;
- revisar reportes;
- acceder a herramientas de organización.

### Reportes

Los usuarios pueden reportar libros o reseñas.

Esto ayuda a mantener la calidad del contenido compartido dentro de la comunidad.

### Perfil de usuario

Cada usuario tiene un perfil donde puede:

- editar sus datos;
- ver sus libros compartidos;
- acceder a sus favoritos;
- ver sus libros en lectura;
- ver los libros que ya leyó;
- consultar su actividad dentro de la plataforma.

## Páginas principales

### Home

La página principal presenta el proyecto, invita a explorar el catálogo y permite acceder rápidamente a una recomendación aleatoria mediante la sección **“No sé qué leer”**.

También muestra libros recientes, libros más vistos y una introducción al sentido del proyecto.

### Catálogo

El catálogo permite explorar los libros disponibles y filtrarlos por distintos criterios.

Incluye información visual y rápida de cada libro, como:

- portada;
- autor;
- categoría;
- tags;
- valoración;
- dificultad;
- vistas;
- disponibilidad de PDF, link o audio.

### Detalle del libro

Cada libro tiene una página propia con toda su información.

Desde allí se puede:

- leer la descripción;
- abrir el PDF o link externo;
- escuchar audiolibros embebidos;
- guardar en favoritos;
- marcar como “Lo estoy leyendo” o “Lo leí”;
- dejar una reseña;
- reportar el libro;
- ver libros relacionados.

### Sobre

La página “Sobre” explica qué es Toma y lee, por qué nació, cómo funciona, cómo colaborar y quién creó el proyecto.

### Perfil

El perfil funciona como espacio personal del usuario y como minibiblioteca.

### Admin

El panel de administración permite gestionar el contenido y mantener ordenada la plataforma.

## Tecnologías utilizadas

El proyecto está desarrollado con:

- Next.js;
- React;
- TypeScript;
- Supabase;
- Supabase Auth;
- Supabase Database;
- Supabase Storage;
- Row Level Security;
- Vercel.

## Base de datos

El proyecto utiliza Supabase como backend principal.

Entre las tablas principales se encuentran:

- `books`;
- `users_profile`;
- `reviews`;
- `favorites`;
- `categories`;
- `tags`;
- `book_tags`;
- `reading_statuses`.

## Autenticación

La autenticación de usuarios se realiza con Supabase Auth.

La plataforma distingue entre usuarios comunes y administradores mediante perfiles de usuario y roles.

## Seguridad

El proyecto utiliza Row Level Security en Supabase para proteger las operaciones de lectura, escritura y edición.

Algunas reglas importantes:

- cada usuario puede editar sus propios datos;
- cada usuario puede publicar libros;
- cada usuario puede gestionar sus propios favoritos;
- cada usuario puede marcar sus propios estados de lectura;
- los administradores pueden gestionar contenido general;
- los reportes ayudan a mantener la calidad del contenido.

## Almacenamiento

Los archivos PDF y las portadas de libros se almacenan en Supabase Storage.

## Objetivo del proyecto

El objetivo de Toma y lee es crear una biblioteca colaborativa, accesible y viva, donde cada lectura pueda convertirse en una ayuda para otra persona.

No busca ser solo un repositorio de archivos, sino un espacio comunitario donde se pueda:

- descubrir;
- guardar;
- leer;
- escuchar;
- recomendar;
- compartir.

## Frase guía

> Una biblioteca para caminar.

## Autor

Proyecto creado por **Felipe Florio (Pipe)**.

## Comunidad

Toma y lee también tiene presencia en Instagram, donde se comparten recomendaciones, frases, libros y recursos relacionados con el proyecto.

Instagram: `@tomaylee.ok`

## Estado del proyecto

El proyecto se encuentra en desarrollo activo.

Actualmente cuenta con funcionalidades de catálogo, usuarios, publicación de libros, reseñas, favoritos, audiolibros, tags, estados de lectura, minibiblioteca personal y panel de administración.

## Próximas mejoras posibles

Algunas ideas futuras para seguir mejorando el proyecto:

- mejorar la experiencia mobile;
- sumar una home más dinámica;
- incorporar recomendaciones por tiempo litúrgico;
- mejorar el footer con enlaces sociales;
- sumar más estadísticas comunitarias;
- optimizar filtros y búsqueda;
- mejorar el diseño visual general.
