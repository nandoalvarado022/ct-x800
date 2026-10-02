"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider/LocaleProvider";
import { makeQuestion, ROUND_SIZE, type StaffQuestion } from "@/lib/staff-quiz";
import styles from "./StaffQuiz.module.scss";

const GAP = 18;
const BOTTOM = 156;
const NOTE_X = 286;
const SOL_LINE = BOTTOM - GAP;
const CLEF_H = 188;
const CLEF_W = (CLEF_H * 751) / 1280;
const CLEF_X = 2;
const CLEF_Y = 18; // SOL_LINE - (CLEF_H * 737) / 1280;

function noteY(step: number) {
  return BOTTOM - (step - 2) * (GAP / 2);
}

function Staff({ step, label }: { step: number; label: string }) {
  const y = noteY(step);
  const stemUp = step < 6;
  const stemX = stemUp ? NOTE_X + 9 : NOTE_X - 9;
  const stemEnd = stemUp ? y - GAP * 3.15 : y + GAP * 3.15;

  return (
    <svg className={styles.staff} viewBox="0 0 440 230" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const lineY = BOTTOM - index * GAP;
        return <line key={lineY} x1="20" y1={lineY} x2="404" y2={lineY} />;
      })}
      <image href="/images/clave-sol.png" x={CLEF_X} y={CLEF_Y} width={CLEF_W} height={CLEF_H} />
      {step === 0 ? (
        <line className={styles.ledger} x1={NOTE_X - 20} y1={y} x2={NOTE_X + 20} y2={y} />
      ) : null}
      <line className={styles.stem} x1={stemX} y1={y} x2={stemX} y2={stemEnd} />
      <ellipse className={styles.head} cx={NOTE_X} cy={y} rx="11.5" ry="8.4" transform={`rotate(-20 ${NOTE_X} ${y})`} />
    </svg>
  );
}

export function StaffQuiz() {
  const { m } = useI18n();
  const [question, setQuestion] = useState<StaffQuestion | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setQuestion(makeQuestion());
  }, []);

  function startRound() {
    setQuestion(makeQuestion());
    setIndex(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  }

  if (!question && !done) {
    return (
      <section className={styles.game} aria-label={m.quiz.label}>
        <p className={styles.pending}>{m.quiz.preparing}</p>
      </section>
    );
  }

  if (done || !question) {
    return (
      <section className={styles.game} aria-label={m.quiz.label}>
        <div className={styles.result}>
          <p>{m.quiz.roundReady}</p>
          <strong>
            {score} {m.quiz.of} {ROUND_SIZE}
          </strong>
          <span>
            {score === ROUND_SIZE ? m.quiz.perfect : score >= 3 ? m.quiz.good : m.quiz.again}
          </span>
          <button type="button" className={styles.next} onClick={startRound}>
            {m.quiz.another}
          </button>
        </div>
      </section>
    );
  }

  const answered = picked !== null;
  const correct = picked === question.note.id;

  function choose(id: string) {
    if (picked) return;
    setPicked(id);
    if (id === question?.note.id) {
      setScore((current) => current + 1);
    }
  }

  function advance() {
    if (index + 1 >= ROUND_SIZE) {
      setDone(true);
      return;
    }
    setIndex((current) => current + 1);
    setQuestion(makeQuestion(question?.note.id));
    setPicked(null);
  }

  const answerName = m.quiz.notes[question.note.id] ?? question.note.name;
  let feedback = m.quiz.choose;
  if (answered && correct) feedback = m.quiz.yes(answerName);
  if (answered && !correct) feedback = m.quiz.was(answerName);

  return (
    <section className={styles.game} aria-label={m.quiz.label}>
      <div className={styles.hud}>
        <p>{m.quiz.question(index + 1, ROUND_SIZE)}</p>
        <p>
          {score} {score === 1 ? m.quiz.hit : m.quiz.hits}
        </p>
      </div>
      <p className={styles.ask}>{m.quiz.ask}</p>
      <Staff step={question.note.step} label={m.quiz.staff} />
      <div className={styles.options} role="group" aria-label={m.quiz.options}>
        {question.options.map((option) => {
          let state = "idle";
          if (answered && option.id === question.note.id) state = "correct";
          else if (answered && option.id === picked) state = "wrong";
          else if (answered) state = "dim";

          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              data-state={state}
              onClick={() => choose(option.id)}
            >
              {m.quiz.notes[option.id] ?? option.name}
            </button>
          );
        })}
      </div>
      <p className={styles.feedback} aria-live="polite">
        {feedback}
      </p>
      {answered ? (
        <button type="button" className={styles.next} onClick={advance}>
          {index + 1 === ROUND_SIZE ? m.quiz.result : m.quiz.next}
        </button>
      ) : null}
    </section>
  );
}
