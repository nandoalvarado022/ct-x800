"use client";

import styles from "./status.module.scss";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className={styles.box}>
      <p>Error</p>
      <h1>La página se detuvo a mitad de compás.</h1>
      <button type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </section>
  );
}
