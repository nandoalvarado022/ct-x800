import Link from "next/link";
import styles from "./SiteFooter.module.scss";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>
          Fuente CT-X800 es una referencia independiente para estudiar el teclado.
          Casio y CT-X800 son marcas de sus titulares.
        </p>
        <nav aria-label="Pie">
          <Link href="/documentacion">Documentación</Link>
          <Link href="/aprender">Aprender</Link>
          <Link href="/experto">Pregúntale al experto</Link>
        </nav>
      </div>
    </footer>
  );
}
