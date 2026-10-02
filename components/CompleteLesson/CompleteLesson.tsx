"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/LocaleProvider/LocaleProvider";
import { useProgress } from "@/components/ProgressProvider/ProgressProvider";
import { xpForDifficulty } from "@/lib/progress";
import type { LearningItem } from "@/lib/types";
import styles from "./CompleteLesson.module.scss";

export function CompleteLesson({ item }: { item: LearningItem }) {
  const { m } = useI18n();
  const { ready, isComplete, toggle } = useProgress();
  const reduce = useReducedMotion();
  const xp = xpForDifficulty(item.difficulty);
  const done = isComplete(item.slug);

  if (!ready) {
    return <p className={styles.pending}>{m.lesson.loading}</p>;
  }

  return (
    <div className={styles.box}>
      <div>
        <p>{done ? m.lesson.recorded : m.lesson.whenPlayed}</p>
        <strong>{done ? m.lesson.xpInRank(xp) : m.lesson.addXp(xp)}</strong>
      </div>
      <button type="button" onClick={() => toggle(item.slug)} aria-pressed={done}>
        {done ? m.lesson.remove : m.lesson.mark}
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
