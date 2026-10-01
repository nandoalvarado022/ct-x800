"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useProgress } from "@/components/ProgressProvider/ProgressProvider";
import { xpForDifficulty } from "@/lib/progress";
import type { LearningItem } from "@/lib/types";
import styles from "./CompleteLesson.module.scss";

export function CompleteLesson({ item }: { item: LearningItem }) {
  const { ready, isComplete, toggle } = useProgress();
  const reduce = useReducedMotion();
  const xp = xpForDifficulty(item.difficulty);
  const done = isComplete(item.slug);

  if (!ready) {
    return <p className={styles.pending}>Cargando tu progreso…</p>;
  }

  return (
    <div className={styles.box}>
      <div>
        <p>{done ? "Práctica registrada" : "Cuando la hayas tocado"}</p>
        <strong>{done ? `+${xp} XP en tu rango` : `Suma ${xp} XP`}</strong>
      </div>
      <button type="button" onClick={() => toggle(item.slug)} aria-pressed={done}>
        {done ? "Quitar de mi ruta" : "Marcar como practicada"}
      </button>
      {done && !reduce ? (
        <motion.span
          className={styles.burst}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          +{xp} XP
        </motion.span>
      ) : null}
    </div>
  );
}
