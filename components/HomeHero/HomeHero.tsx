"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/LocaleProvider/LocaleProvider";
import styles from "./HomeHero.module.scss";

const WHITE_COUNT = 14;
const BLACK_AFTER = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];
const PHRASE = [0, 1, 2, 0, 0, 1, 2, 0, 2, 3, 4, 4];
const STEP_MS = 380;
/** Volumen de las teclas del hero. Rango de 0 a 1. */
const KEY_VOLUME = 0.15;
const WHITE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];

function whiteKeyFrequency(index: number) {
  const octave = Math.floor(index / WHITE_OFFSETS.length);
  const semitone = WHITE_OFFSETS[index % WHITE_OFFSETS.length] + octave * 12;
  return 440 * 2 ** ((60 + semitone - 69) / 12);
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="currentColor" d="M4 10h3.2L12 6.2v11.6L7.2 14H4z" />
      {muted ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M16 9.5l5 5M21 9.5l-5 5"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M16 9.2a3.8 3.8 0 0 1 0 5.6M18.4 7a6.4 6.4 0 0 1 0 10"
        />
      )}
    </svg>
  );
}

function playWhiteKey(context: AudioContext, master: GainNode, index: number) {
  const now = context.currentTime;
  const frequency = whiteKeyFrequency(index);
  const end = now + 0.58;
  const note = context.createGain();
  note.gain.setValueAtTime(0.0001, now);
  note.gain.exponentialRampToValueAtTime(1, now + 0.014);
  note.gain.exponentialRampToValueAtTime(0.0001, end);
  note.connect(master);

  const partials: Array<[number, OscillatorType, number]> = [
    [1, "triangle", 0.86],
    [2, "sine", 0.2],
    [3, "sine", 0.07],
  ];
  const oscillators = partials.map(([multiple, type, level]) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency * multiple, now);
    gain.gain.value = level;
    oscillator.connect(gain);
    gain.connect(note);
    oscillator.start(now);
    oscillator.stop(end);
    return oscillator;
  });

  oscillators[0].onended = () => {
    oscillators.forEach((oscillator) => oscillator.disconnect());
    note.disconnect();
  };
}

export function HomeHero() {
  const { m } = useI18n();
  const reduce = useReducedMotion();
  const specs = m.hero.specs;
  const [step, setStep] = useState(0);
  const [muted, setMuted] = useState(true);
  const stepRef = useRef(0);
  const mutedRef = useRef(true);
  const masterRef = useRef<GainNode | null>(null);
  const playCurrentRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (reduce) return;

    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = mutedRef.current ? 0 : KEY_VOLUME;
    master.connect(context.destination);
    masterRef.current = master;

    let lastPlayedAt = 0;
    const playStep = (phraseIndex: number) => {
      if (mutedRef.current || context.state !== "running") return;
      const now = performance.now();
      if (now - lastPlayedAt < 40) return;
      lastPlayedAt = now;
      playWhiteKey(context, master, PHRASE[phraseIndex]);
    };
    playCurrentRef.current = () => playStep(stepRef.current);

    const unlock = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-piano-mute]")) {
        void context.resume().catch(() => undefined);
        return;
      }
      if (context.state === "running") return;
      void context.resume().then(() => playStep(stepRef.current)).catch(() => undefined);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    void context.resume().then(() => playStep(stepRef.current)).catch(() => undefined);

    const id = window.setInterval(() => {
      const next = (stepRef.current + 1) % PHRASE.length;
      stepRef.current = next;
      setStep(next);
      playStep(next);
    }, STEP_MS);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      masterRef.current = null;
      playCurrentRef.current = () => {};
      void context.close();
    };
  }, [reduce]);

  function toggleMute() {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    const master = masterRef.current;
    const context = master?.context;
    if (!master || !context || context.state === "closed") return;

    const apply = () => {
      if (context.state === "closed") return;
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(next ? 0 : KEY_VOLUME, now);
      if (!next) playCurrentRef.current();
    };

    if (context instanceof AudioContext && context.state === "suspended") {
      void context.resume().then(apply).catch(() => undefined);
      return;
    }
    apply();
  }

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
      <div className={styles.stage}>
        <div className={styles.lcd}>
          <span aria-hidden="true">CT-X800</span>
          <div className={styles.lcdEnd}>
            <strong aria-hidden="true">AiX · banco 160</strong>
            <button
              type="button"
              className={styles.mute}
              data-piano-mute=""
              aria-pressed={muted}
              aria-label={muted ? m.hero.unmute : m.hero.mute}
              onClick={toggleMute}
            >
              <SpeakerIcon muted={muted} />
            </button>
          </div>
        </div>
        <div className={styles.piano} aria-hidden="true">
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
        <ul className={styles.specs} aria-hidden="true">
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
