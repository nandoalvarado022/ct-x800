"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useProgress } from "@/components/ProgressProvider/ProgressProvider";
import type { PracticeExercise, PracticeKey } from "@/lib/types";
import styles from "./PracticeSession.module.scss";

type NextStop = {
  slug: string;
  title: string;
};

function KeyLane({ keys }: { keys: PracticeKey[] }) {
  return (
    <div className={styles.laneWrap}>
      <ol className={styles.lane} aria-label="Notas de este paso">
        {keys.map((key) => (
          <li key={`${key.finger}-${key.note}`}>
            <span>{key.finger}</span>
            <strong>{key.note}</strong>
          </li>
        ))}
      </ol>
      <p className={styles.legend}>El 1 es el pulgar. El 5 es el meñique. Una tecla por dedo.</p>
    </div>
  );
}

export function PracticeSession({
  exercise,
  station,
  next,
}: {
  exercise: PracticeExercise;
  station: number;
  next: NextStop | null;
}) {
  const reduce = useReducedMotion();
  const { ready, isPracticeComplete, completePractice } = useProgress();
  const [index, setIndex] = useState(0);
  const [cheer, setCheer] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [earned, setEarned] = useState(false);

  const total = exercise.steps.length;
  const step = exercise.steps[index];
  const progress = finished ? 1 : index / total;

  function advance() {
    if (!step) return;
    setCheer(step.cheer);
    if (index + 1 >= total) {
      const firstTime = !isPracticeComplete(exercise.slug);
      completePractice(exercise.slug);
      setEarned(firstTime);
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
  }

  function back() {
    setCheer(null);
    setIndex((current) => Math.max(0, current - 1));
  }

  function replay() {
    setIndex(0);
    setCheer(null);
    setFinished(false);
    setEarned(false);
  }

  return (
    <section className={styles.session}>
      <Link className={styles.back} href="/practica">
        Sala de calentamiento
      </Link>

      <header className={styles.header}>
        <p>
          Estación {String(station).padStart(2, "0")} · {exercise.minutes} min · {exercise.xp} XP
        </p>
        <h1>{exercise.title}</h1>
        <p className={styles.intro}>{exercise.intro}</p>
      </header>

      <div
        className={styles.meter}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={finished ? total : index}
        aria-label="Pasos de la estación"
      >
        <span style={{ width: `${progress * 100}%` }} />
      </div>

      <div className={styles.cheerSlot} aria-live="polite">
        {cheer ? <p>{index > 0 || finished ? `Racha ${finished ? total : index} · ${cheer}` : cheer}</p> : null}
      </div>

      <AnimatePresence mode="wait">
        {finished ? (
          <motion.div
            key="done"
            className={styles.clear}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {!reduce ? (
              <span className={styles.sparks} aria-hidden="true">
                {Array.from({ length: 7 }, (_, spark) => (
                  <motion.i
                    key={spark}
                    initial={{ opacity: 0, y: 8, x: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: -28 - (spark % 3) * 10,
                      x: (spark - 3) * 14,
                    }}
                    transition={{ duration: 0.9, delay: spark * 0.04 }}
                  />
                ))}
              </span>
            ) : null}
            <p>Estación despejada</p>
            <strong>{earned ? `+${exercise.xp} XP` : "Esos XP ya están en tu rango"}</strong>
            <span>
              {earned
                ? "Quedó guardado en la ronda. El medidor de arriba también se entera."
                : "Otra vuelta sirve para soltar las manos. El rango se queda como está."}
            </span>
            <div className={styles.actions}>
              {next ? (
                <Link className={styles.primary} href={`/practica/${next.slug}`}>
                  Siguiente: {next.title}
                </Link>
              ) : (
                <Link className={styles.primary} href="/aprender">
                  Ir a tocar una canción
                </Link>
              )}
              <button type="button" onClick={replay}>
                Otra vuelta
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.article
            key={step.id}
            className={styles.card}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <p className={styles.stepLabel}>
              Paso {index + 1} de {total}
            </p>
            <h2>{step.title}</h2>
            <p className={styles.say}>{step.say}</p>
            <p className={styles.tip}>
              <span>Si te trabas</span>
              {step.tip}
            </p>
            {step.keys && step.keys.length > 0 ? <KeyLane keys={step.keys} /> : null}
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={advance} disabled={!ready}>
                {ready ? step.action : "Cargando…"}
              </button>
              {index > 0 ? (
                <button type="button" onClick={back}>
                  Paso anterior
                </button>
              ) : null}
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </section>
  );
}
