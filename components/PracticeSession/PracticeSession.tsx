"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/LocaleProvider/LocaleProvider";
import { useProgress } from "@/components/ProgressProvider/ProgressProvider";
import type { PracticeExercise, PracticeKey } from "@/lib/types";
import styles from "./PracticeSession.module.scss";

type NextStop = {
  slug: string;
  title: string;
};

function KeyLane({ keys, notesLabel, legend }: { keys: PracticeKey[]; notesLabel: string; legend: string }) {
  return (
    <div className={styles.laneWrap}>
      <ol className={styles.lane} aria-label={notesLabel}>
        {keys.map((key) => (
          <li key={`${key.finger}-${key.note}`}>
            <span>{key.finger}</span>
            <strong>{key.note}</strong>
          </li>
        ))}
      </ol>
      <p className={styles.legend}>{legend}</p>
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
  const { m } = useI18n();
  const reduce = useReducedMotion();
  const { ready, isPracticeComplete, completePractice } = useProgress();
  const [index, setIndex] = useState(0);
  const [cheer, setCheer] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [earned, setEarned] = useState(false);
  const busy = useRef(false);

  const total = exercise.steps.length;
  const step = exercise.steps[index];
  const progress = finished ? 1 : index / total;

  useEffect(() => {
    busy.current = false;
  }, [index, finished]);

  function advance() {
    if (busy.current || !step || finished) return;
    busy.current = true;
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
    busy.current = false;
    setCheer(null);
    setIndex((current) => Math.max(0, current - 1));
  }

  function replay() {
    busy.current = false;
    setIndex(0);
    setCheer(null);
    setFinished(false);
    setEarned(false);
  }

  return (
    <section className={styles.session}>
      <Link className={styles.back} href="/practica">
        {m.session.room}
      </Link>

      <header className={styles.header}>
        <p>{m.session.station(String(station).padStart(2, "0"), exercise.minutes, exercise.xp)}</p>
        <h1>{exercise.title}</h1>
        <p className={styles.intro}>{exercise.intro}</p>
      </header>

      <div
        className={styles.meter}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={finished ? total : index}
        aria-label={m.session.stepsLabel}
      >
        <span style={{ width: `${progress * 100}%` }} />
      </div>

      <div className={styles.cheerSlot} aria-live="polite">
        {cheer ? <p>{index > 0 || finished ? m.session.streak(finished ? total : index, cheer) : cheer}</p> : null}
      </div>

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
            <p>{m.session.cleared}</p>
            <strong>{earned ? m.session.xpEarned(exercise.xp) : m.session.xpAlready}</strong>
            <span>{earned ? m.session.saved : m.session.againHint}</span>
            <div className={styles.actions}>
              {next ? (
                <Link className={styles.primary} href={`/practica/${next.slug}`}>
                  {m.session.next(next.title)}
                </Link>
              ) : (
                <Link className={styles.primary} href="/aprender">
                  {m.session.goLearn}
                </Link>
              )}
              <button type="button" onClick={replay}>
                {m.session.another}
              </button>
            </div>
          </motion.div>
        ) : step ? (
          <motion.article
            key={step.id}
            className={styles.card}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <p className={styles.stepLabel}>
              {m.session.stepOf(index + 1, total)}
            </p>
            <h2>{step.title}</h2>
            <p className={styles.say}>{step.say}</p>
            <p className={styles.tip}>
              <span>{m.session.stuck}</span>
              {step.tip}
            </p>
            {step.keys && step.keys.length > 0 ? (
              <KeyLane keys={step.keys} notesLabel={m.session.notesLabel} legend={m.session.legend} />
            ) : null}
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={advance} disabled={!ready}>
                {ready ? step.action : m.session.loading}
              </button>
              {index > 0 ? (
                <button type="button" onClick={back}>
                  {m.session.back}
                </button>
              ) : null}
            </div>
          </motion.article>
        ) : null}
    </section>
  );
}
