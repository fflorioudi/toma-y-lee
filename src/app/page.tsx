import Link from "next/link";
import RandomBook from "@/components/RandomBook";

export default function HomePage() {
  return (
    <main className="page-container">
      <section className="hero-section">
        <h1 className="display-title">Toma y lee</h1>

        <p className="section-subtitle" style={{ margin: "1.2rem auto 0" }}>
          Biblioteca online colaborativa. Un lugar para compartir libros,
          reseñas y lecturas que acompañen la fe, la formación y la interioridad.
        </p>

        <div className="actions-row hero-actions top-space">
          <Link href="/catalogo" className="primary-link">
            Explorar biblioteca
          </Link>

          <Link href="/publicar" className="secondary-link">
            Compartir un libro
          </Link>
        </div>

        <div className="hero-band">
          «Una sola alma y un solo corazón dirigidos hacia Dios».
        </div>
      </section>

      <div className="top-space-lg">
        <RandomBook />
      </div>
    </main>
  );
}