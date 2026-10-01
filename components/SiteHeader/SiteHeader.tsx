"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/components/ProgressProvider/ProgressProvider";
import styles from "./SiteHeader.module.scss";

const links = [
  { href: "/documentacion", label: "Documentación" },
  { href: "/practica", label: "Práctica" },
  { href: "/aprender", label: "Aprender" },
  { href: "/experto", label: "Experto" },
];

function Mark() {
  return (
    <svg className={styles.mark} viewBox="0 0 36 24" aria-hidden="true">
      <rect x="1" y="3" width="6" height="18" rx="1.2" fill="currentColor" />
      <rect x="8.5" y="3" width="6" height="18" rx="1.2" fill="currentColor" />
      <rect x="16" y="3" width="6" height="18" rx="1.2" fill="currentColor" />
      <rect x="23.5" y="3" width="6" height="18" rx="1.2" fill="currentColor" />
      <rect x="31" y="3" width="4" height="18" rx="1.2" fill="currentColor" />
      <rect x="5.2" y="3" width="3.4" height="11" rx="0.8" className={styles.markInk} />
      <rect x="12.7" y="3" width="3.4" height="11" rx="0.8" className={styles.markInk} />
      <rect x="27.4" y="3" width="3.4" height="11" rx="0.8" className={styles.markInk} />
    </svg>
  );
}

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("ctx800-theme", next);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { ready, xp, rank } = useProgress();
  const goal = rank.next?.min ?? rank.current.min;
  const shownMax = rank.next ? goal : Math.max(xp, 1);

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          <Mark />
          <span>
            <strong>Fuente</strong>
            <small>CT-X800</small>
          </span>
        </Link>
        <nav className={styles.nav} aria-label="Secciones">
          {links.map((link) => {
            const current = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" className={styles.themeToggle} onClick={toggleTheme}>
          <span className={styles.toLight}>Claro</span>
          <span className={styles.toDark}>Oscuro</span>
        </button>
        <Link className={styles.rank} href="/aprender">
          <span>{ready ? rank.current.name : "Progreso"}</span>
          <strong>{ready ? `${xp} XP` : "—"}</strong>
          <span
            className={styles.meter}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={shownMax}
            aria-valuenow={ready ? xp : 0}
            aria-label={ready ? `Rango ${rank.current.name}` : "Progreso"}
          >
            <span style={{ width: ready ? `${rank.ratio * 100}%` : "0%" }} />
          </span>
        </Link>
      </div>
    </header>
  );
}
