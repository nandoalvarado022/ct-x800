"use client";

import { useI18n } from "@/components/LocaleProvider/LocaleProvider";
import styles from "./status.module.scss";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { m } = useI18n();

  return (
    <section className={styles.box}>
      <p>{m.status.error}</p>
      <h1>{m.status.crashed}</h1>
      <button type="button" onClick={() => reset()}>
        {m.status.retry}
      </button>
    </section>
  );
}
