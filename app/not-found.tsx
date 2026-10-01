import Link from "next/link";
import styles from "./status.module.scss";

export default function NotFound() {
  return (
    <section className={styles.box}>
      <p>404</p>
      <h1>Esa ficha no está en el CT-X800.</h1>
      <Link href="/documentacion">Volver a la documentación</Link>
    </section>
  );
}
