"use client";

import Link from "next/link";
import { useI18n } from "@/components/LocaleProvider/LocaleProvider";
import styles from "./SiteFooter.module.scss";

export function SiteFooter() {
  const { m } = useI18n();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>{m.footer.blurb}</p>
        <nav aria-label={m.footer.nav}>
          <Link href="/documentacion">{m.footer.docs}</Link>
          <Link href="/practica">{m.footer.practice}</Link>
          <Link href="/aprender">{m.footer.learn}</Link>
          <Link href="/juegos">{m.footer.games}</Link>
          <Link href="/experto">{m.footer.expert}</Link>
        </nav>
        <p className={styles.credit}>
          <span>
            {m.footer.createdBy} <strong>Nando Alvarado</strong>
          </span>
          <a href="mailto:nandoalvarado022@gmail.com">nandoalvarado022@gmail.com</a>
          <a href="https://www.instagram.com/nandoalvarado022/" target="_blank" rel="noreferrer">
            {m.footer.instagram} @nandoalvarado022
          </a>
        </p>
      </div>
    </footer>
  );
}
