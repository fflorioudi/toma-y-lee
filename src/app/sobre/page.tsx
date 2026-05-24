import Link from "next/link";

export default function SobrePage() {
  return (
    <main className="page-container">
      <section className="hero-section">
        <h1 className="display-title">Sobre Toma y lee</h1>

        <p className="section-subtitle" style={{ margin: "1.2rem auto 0" }}>
          Una biblioteca online colaborativa pensada para reunir lecturas,
          recursos y audiolibros que acompañen la fe, la formación y la
          interioridad.
        </p>

        <div className="hero-band">
          «Toma y lee». Una invitación simple a volver a encontrarnos con una
          lectura que pueda tocar el corazón.
        </div>
      </section>

      <section className="top-space-lg">
        <div className="card">
          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            ¿Qué es Toma y lee?
          </h2>

          <p className="subtle-text">
            Toma y lee es una biblioteca online colaborativa donde se pueden
            encontrar y compartir libros, PDFs, audiolibros y recursos que
            ayuden a crecer en la fe, la formación cristiana, la oración, la
            interioridad y la vida comunitaria.
          </p>

          <p className="subtle-text">
            La idea es sencilla: reunir en un solo lugar lecturas valiosas para
            que más personas puedan acceder a ellas, recomendarlas, guardarlas y
            compartirlas con otros.
          </p>
        </div>
      </section>

      <section className="top-space">
        <div className="card">
          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            ¿Por qué nació?
          </h2>

          <p className="subtle-text">
            Toma y lee nació del deseo de hacer más fácil el encuentro con
            buenos libros y recursos espirituales. Muchas veces existen textos
            muy valiosos, pero están dispersos, son difíciles de encontrar o no
            llegan a quienes podrían necesitarlos.
          </p>

          <p className="subtle-text">
            Esta página busca ser un puente: un espacio simple, accesible y
            colaborativo para que cada persona pueda descubrir lecturas que la
            ayuden a pensar, rezar, formarse y crecer.
          </p>
        </div>
      </section>

      <section className="top-space">
        <div className="card">
          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            ¿Quién lo creó?
          </h2>

          <p className="subtle-text">
             Toma y lee fue creado por Felipe Florio (Pipe), con el deseo de poner la
             tecnología al servicio de algo más grande: compartir lecturas que puedan
             acompañar procesos personales, comunitarios y espirituales.
        </p>

          <p className="subtle-text">
            Es un proyecto hecho con mucho cariño, pensado para crecer de manera
            colaborativa y seguir tomando forma con los aportes de quienes lo
            usan.
          </p>
        </div>
      </section>

      <section className="top-space">
        <div className="card">
          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            ¿Cómo colaborar?
          </h2>

          <p className="subtle-text">
            Cualquier usuario registrado puede colaborar compartiendo un libro,
            un PDF, un enlace de lectura o un audiolibro. La idea no es subir
            contenido por subir, sino recomendar recursos que puedan ayudar a
            otros.
          </p>

          <div className="actions-row top-space">
            <Link href="/publicar" className="primary-link">
              Compartir un libro
            </Link>

            <Link href="/catalogo" className="secondary-link">
              Explorar catálogo
            </Link>
          </div>
        </div>
      </section>

      <section className="top-space">
        <div className="card">
          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            ¿Qué tipo de libros se pueden subir?
          </h2>

          <p className="subtle-text">
            Podés compartir libros y recursos relacionados con espiritualidad,
            oración, formación cristiana, santos, Biblia, vida comunitaria,
            interioridad, testimonios, doctrina, Iglesia, crecimiento personal y
            temas que puedan ayudar a vivir mejor la fe.
          </p>

          <div
            className="actions-row"
            style={{ marginTop: "1rem", gap: "0.5rem" }}
          >
            <span className="badge">Libros</span>
            <span className="badge">PDF</span>
            <span className="badge">Audiolibros</span>
            <span className="badge">Recursos</span>
            <span className="badge">Reseñas</span>
          </div>
        </div>
      </section>

      <section className="top-space-lg">
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            También estamos en Instagram
          </h2>

          <p
            className="subtle-text"
            style={{
              maxWidth: "680px",
              margin: "0.75rem auto 1.25rem",
            }}
          >
            En Instagram compartimos recomendaciones, frases, libros, recursos y
            contenido para seguir acercando buenas lecturas a más personas.
          </p>

          <a
            href="https://www.instagram.com/tomaylee.ok/"
            target="_blank"
            rel="noopener noreferrer"
            className="primary-link"
          >
            Ir al Instagram
          </a>
        </div>
      </section>
    </main>
  );
}