"use client";

import Link from "next/link";
import { useProgress } from "@/components/ProgressProvider/ProgressProvider";
import type { PracticeExercise } from "@/lib/types";
import styles from "./PracticeBoard.module.scss";

function moodFor(done: number, total: number) {
  if (done <= 0) {
    return {
      name: "Manos frías",
      line: "Todavía no hay sonido. La primera estación es solo sentarte y soltar las manos.",
    };
  }
  if (done < total) {
    return {
      name: "Entrando en calor",
      line: "Sigue con la estación marcada. Una a la vez, con el mismo pulso.",
    };
  }
  return {
    name: "Listo para tocar",
    line: "Ronda completa. Los dedos ya pueden ir a una canción.",
  };
}

export function PracticeBoard({ exercises }: { exercises: PracticeExercise[] }) {
  const { ready, isPracticeComplete } = useProgress();
  const doneCount = exercises.filter((item) => isPracticeComplete(item.slug)).length;
  const shownDone = ready ? doneCount : 0;
  const total = exercises.length;
  const ratio = total === 0 ? 0 : shownDone / total;
  const mood = ready ? moodFor(shownDone, total) : { name: "Calentamiento", line: "Cargando tu ronda…" };
  const minutes = exercises.reduce((sum, item) => sum + item.minutes, 0);
  const xp = exercises.reduce((sum, item) => sum + item.xp, 0);
  const earned = exercises.reduce((sum, item) => {
    if (!ready || !isPracticeComplete(item.slug)) return sum;
    return sum + item.xp;
  }, 0);
  const nextSlug = ready
    ? exercises.find((item) => !isPracticeComplete(item.slug))?.slug
    : undefined;

  return (
    <section className={styles.board} aria-label="Sala de calentamiento">
      <div className={styles.hud}>
        <div>
          <p className={styles.mood}>{mood.name}</p>
          <p className={styles.line}>{mood.line}</p>
          <p className={styles.meta}>
            {minutes} min en total · {earned} de {xp} XP
          </p>
        </div>
        <div
          className={styles.ring}
          style={{ ["--p" as string]: String(ratio * 100) }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={shownDone}
          aria-label="Estaciones de calentamiento"
        >
          <span>
            {shownDone}/{total}
          </span>
        </div>
      </div>

      <ol className={styles.path}>
        {exercises.map((item, index) => {
          const done = ready && isPracticeComplete(item.slug);
          const current = item.slug === nextSlug;
          const status = done ? "Lista" : current ? "Te toca" : "En la ronda";
          return (
            <li key={item.id}>
              <Link
                href={`/practica/${item.slug}`}
                className={current ? styles.current : done ? styles.done : styles.station}
              >
                <span className={styles.rail} aria-hidden="true">
                  <span className={styles.badge}>{String(index + 1).padStart(2, "0")}</span>
                  {index < exercises.length - 1 ? <span className={styles.connector} /> : null}
                </span>
                <span className={styles.copy}>
                  <span className={styles.statusRow}>
                    <span className={styles.status}>{status}</span>
                    <span>{item.minutes} min</span>
                    <span>{item.xp} XP</span>
                    <span>
                      {item.steps.length} {item.steps.length === 1 ? "paso" : "pasos"}
                    </span>
                  </span>
                  <strong>{item.title}</strong>
                  <span className={styles.description}>{item.description}</span>
                  <span className={styles.go}>
                    {done ? "Repetir estación" : current ? "Empezar aquí" : "Abrir estación"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {ready && total > 0 && shownDone === total ? (
        <Link className={styles.play} href="/aprender">
          Ronda lista · ir a tocar
        </Link>
      ) : null}
    </section>
  );
}
