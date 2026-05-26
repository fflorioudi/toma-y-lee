import Link from "next/link";

export default function SobrePage() {
  return (
    <main className="page-container">
      <section
        className="card"
        style={{
          padding: "2rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.65rem",
                color: "var(--accent)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.85rem",
              }}
            >
              SOBRE EL PROYECTO
            </p>

            <h1
              className="display-title"
              style={{
                margin: 0,
                textAlign: "left",
                fontSize: "clamp(2.4rem, 10vw, 4rem)",
                lineHeight: 1.05,
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Toma y lee
            </h1>

            <p
              className="section-subtitle"
              style={{
                margin: "1rem 0 0",
                maxWidth: "720px",
                textAlign: "left",
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Una biblioteca online colaborativa para encontrar, guardar y
              compartir lecturas que acompañen la fe, la formación y la
              interioridad.
            </p>

           
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "24px",
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              minWidth: 0,
            }}
          >
            <p
              style={{
                margin: 0,
                color: "var(--accent)",
                fontWeight: 700,
              }}
            >
              Una biblioteca para caminar
            </p>

            <p
              className="subtle-text"
              style={{
                marginBottom: 0,
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Toma y lee nació para que una buena lectura no quede perdida, sino
              que pueda llegar a alguien que la necesita.
            </p>
          </div>
        </div>
      </section>

      <section className="top-space-lg">
        <div style={{ marginBottom: "1rem" }}>
          <p
            style={{
              marginTop: 0,
              marginBottom: "0.4rem",
              color: "var(--accent)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "0.85rem",
            }}
          >
            CÓMO FUNCIONA
          </p>

          <h2
            className="section-title"
            style={{
              fontSize: "2rem",
              color: "var(--accent)",
              marginBottom: "0.35rem",
            }}
          >
            Una biblioteca hecha para acompañar
          </h2>

          <p className="subtle-text" style={{ marginTop: 0, maxWidth: "720px" }}>
            Toma y lee se apoya en tres acciones simples: encontrar lecturas,
            guardarlas en tu camino personal y compartir lo que puede ayudar a
            otros.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "1rem",
          }}
        >
          <div className="card">
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                color: "var(--accent)",
                fontWeight: 700,
              }}
            >
              01
            </p>

            <h2 style={{ marginTop: 0 }}>Encontrar</h2>

            <p className="subtle-text" style={{ marginBottom: 0 }}>
              Libros, PDFs, audiolibros y recursos reunidos en un solo lugar
              para que sea más fácil descubrir una lectura que acompañe.
            </p>
          </div>

          <div className="card">
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                color: "var(--accent)",
                fontWeight: 700,
              }}
            >
              02
            </p>

            <h2 style={{ marginTop: 0 }}>Guardar</h2>

            <p className="subtle-text" style={{ marginBottom: 0 }}>
              Cada usuario puede armar su pequeña biblioteca personal:
              favoritos, lecturas actuales y libros que ya leyó.
            </p>
          </div>

          <div className="card">
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                color: "var(--accent)",
                fontWeight: 700,
              }}
            >
              03
            </p>

            <h2 style={{ marginTop: 0 }}>Compartir</h2>

            <p className="subtle-text" style={{ marginBottom: 0 }}>
              La comunidad puede sumar libros, dejar reseñas y ayudar a que
              otros encuentren una lectura para su momento.
            </p>
          </div>
        </div>
      </section>

      <section className="top-space-lg">
        <div className="card" style={{ padding: "1.6rem" }}>
          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            ¿Por qué nació?
          </h2>

          <p className="subtle-text">
            Toma y lee nació del deseo de hacer más fácil el encuentro con
            buenos libros y recursos espirituales. Muchas veces existen textos
            muy valiosos, pero están dispersos, son difíciles de encontrar o no
            llegan a quienes podrían necesitarlos.
          </p>

          <p className="subtle-text" style={{ marginBottom: 0 }}>
            Esta página busca ser un puente: un espacio simple, accesible y
            colaborativo para descubrir lecturas que ayuden a pensar, rezar,
            formarse y crecer.
          </p>
        </div>
      </section>

      <section className="top-space">
        <div
          className="card"
          style={{
            padding: "1.6rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
              ¿Qué podés encontrar?
            </h2>

            <p
              className="subtle-text"
              style={{
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Libros y recursos relacionados con espiritualidad, oración,
              formación cristiana, santos, Biblia, vida comunitaria,
              interioridad, testimonios, doctrina, Iglesia y crecimiento
              personal.
            </p>

            <div
              className="actions-row"
              style={{ marginTop: "1rem", gap: "0.5rem" }}
            >
              <span className="badge">Libros</span>
              <span className="badge">PDF</span>
              <span className="badge">Audiolibros</span>
              <span className="badge">Reseñas</span>
              <span className="badge">Favoritos</span>
            </div>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "18px",
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              minWidth: 0,
            }}
          >
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.45rem",
                color: "var(--accent)",
                fontWeight: 700,
              }}
            >
              La idea es sencilla
            </p>

            <p
              className="subtle-text"
              style={{
                marginBottom: 0,
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Que una lectura que ayudó a alguien pueda acompañar también a
              otra persona.
            </p>
          </div>
        </div>
      </section>

      <section className="top-space">
        <div className="card" style={{ padding: "1.6rem" }}>
          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            ¿Quién lo creó?
          </h2>

          <p className="subtle-text">
            Toma y lee fue creado por <strong>Felipe Florio (Pipe)</strong>, con
            el deseo de poner la tecnología al servicio de algo más grande:
            compartir lecturas que puedan acompañar procesos personales,
            comunitarios y espirituales.
          </p>

          <p className="subtle-text" style={{ marginBottom: 0 }}>
            Es un proyecto hecho con mucho cariño, pensado para crecer de manera
            colaborativa y seguir tomando forma con los aportes de quienes lo
            usan.
          </p>
        </div>
      </section>

      <section className="top-space">
        <div
          className="card"
          style={{
            padding: "1.6rem",
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: "720px", minWidth: 0 }}>
            <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
              ¿Cómo colaborar?
            </h2>

            <p
              className="subtle-text"
              style={{
                marginBottom: 0,
                wordBreak: "normal",
                overflowWrap: "break-word",
              }}
            >
              Cualquier usuario registrado puede colaborar compartiendo un
              libro, un PDF, un enlace de lectura o un audiolibro. La idea no es
              subir contenido por subir, sino recomendar recursos que puedan
              ayudar a otros.
            </p>
          </div>

          <div className="actions-row">
            <Link href="/publicar" className="primary-link">
              Compartir un libro
            </Link>

            <Link href="/catalogo" className="secondary-link">
              Ver catálogo
            </Link>
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
          <p
            style={{
              marginTop: 0,
              marginBottom: "0.5rem",
              color: "var(--accent)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "0.85rem",
            }}
          >
            COMUNIDAD
          </p>

          <h2 style={{ marginTop: 0, color: "var(--accent)" }}>
            También estamos en Instagram
          </h2>

          <p
            className="subtle-text"
            style={{
              maxWidth: "680px",
              margin: "0.75rem auto 1.25rem",
              wordBreak: "normal",
              overflowWrap: "break-word",
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