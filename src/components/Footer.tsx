import Image from "next/image";

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-inner">
        <div className="footer-brand">
          <Image
            src="/logo-jar.png"
            alt="Logo de la JAR"
            width={56}
            height={56}
            className="footer-logo"
          />

          <div>
            <p className="footer-title">Toma y lee</p>
            <p className="footer-text">Biblioteca colaborativa de la JAR.</p>
          </div>
        </div>

        <p className="footer-sign">By Pipe</p>
      </div>
    </footer>
  );
}