"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/LocaleProvider/LocaleProvider";
import styles from "./HomeHero.module.scss";

const WHITE_COUNT = 14;
const BLACK_AFTER = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
const PHRASE = [0, 1, 2, 0, 0, 1, 2, 0, 2, 3, 4, 4];

export function HomeHero() {
  const { m } = useI18n();
  const reduce = useReducedMotion();
  const specs = m.hero.specs;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setStep((current) => (current + 1) % PHRASE.length);
    }, 380);
    return () => window.clearInterval(id);
  }, [reduce]);

  const active = reduce ? -1 : PHRASE[step];
  const whiteWidth = 100 / WHITE_COUNT;

  return (
    <section className={styles.hero}>
      <div>
        <p className={styles.kicker}>{m.hero.kicker}</p>
        <h1>{m.hero.title}</h1>
        <p className={styles.lede}>{m.hero.lede}</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/documentacion">
            {m.hero.docs}
          </Link>
          <Link className={styles.secondary} href="/practica">
            {m.hero.warmup}
          </Link>
        </div>
      </div>
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.lcd}>
          <span>CT-X800</span>
          <strong>AiX · banco 160</strong>
        </div>
        <div className={styles.piano}>
          {Array.from({ length: WHITE_COUNT }, (_, index) => (
            <motion.span
              key={index}
              className={index === active ? styles.whiteOn : styles.white}
              animate={
                index === active ? { y: 3 } : { y: 0 }
              }
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            />
          ))}
          {BLACK_AFTER.map((index) => {
            const width = whiteWidth * 0.62;
            const left = (index + 1) * whiteWidth - width / 2;
            return (
              <span
                key={`b-${index}`}
                className={styles.black}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            );
          })}
        </div>
        <ul className={styles.specs}>
          {specs.map((spec) => (
            <li key={spec.label}>
              <strong>{spec.value}</strong>
              <span>{spec.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
