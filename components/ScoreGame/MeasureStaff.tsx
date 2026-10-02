import type { Locale } from "@/lib/locale";
import { messages } from "@/lib/messages";
import { americanCipher, noteLabel, type ScoreNote } from "@/lib/midi-score";
import styles from "./ScoreGame.module.scss";

const GAP = 18;
const CLEF_H = 188;
const CLEF_W = (CLEF_H * 751) / 1280;
const CLEF_X = 4;
const CLEF_FROM_G = 120;
const LEFT = CLEF_X + CLEF_W + 28;
const MIN_GAP = 52;
const MEASURE_MIN = 380;
const MEASURE_PAD = 32;

export type NoteMark = "waiting" | "current" | "done" | "miss" | "printed";

export type StaffMeasure = {
  number: number;
  notes: ScoreNote[];
  marks: NoteMark[];
};

function ledgerSteps(step: number) {
  const lines: number[] = [];
  if (step <= 0) {
    for (let line = 0; line >= step; line -= 2) lines.push(line);
  }
  if (step >= 12) {
    for (let line = 12; line <= step; line += 2) lines.push(line);
  }
  return lines;
}

function samePlace(a: number, b: number) {
  return Math.abs(a - b) <= 0.001;
}

function layoutMeasure(notes: ScoreNote[], origin: number) {
  const onsets = notes.filter((note, index) => index === 0 || !samePlace(note.place, notes[index - 1].place));
  const span = Math.max(MEASURE_MIN, Math.max(onsets.length - 1, 1) * 58);
  const xs = notes.map((note) => origin + 28 + note.place * span);
  const groups: number[][] = [];

  notes.forEach((note, index) => {
    const last = groups[groups.length - 1];
    if (!last || !samePlace(note.place, notes[last[0]].place)) groups.push([index]);
    else last.push(index);
  });

  for (const group of groups) {
    const base = xs[group[0]];
    for (let cursor = 1; cursor < group.length; cursor += 1) {
      const previous = group[cursor - 1];
      const current = group[cursor];
      xs[current] = notes[current].step - notes[previous].step <= 2 ? xs[previous] + 20 : base;
    }
  }

  let onsetRight = 0;
  let started = false;
  for (const group of groups) {
    if (started) {
      const minX = Math.min(...group.map((index) => xs[index]));
      const shift = Math.max(0, onsetRight + MIN_GAP - minX);
      for (const index of group) xs[index] += shift;
    }
    onsetRight = Math.max(...group.map((index) => xs[index]));
    started = true;
  }

  const contentRight = xs.length > 0 ? Math.max(...xs) : origin + span;
  const right = Math.max(origin + span, contentRight + MEASURE_PAD);
  return { xs, right };
}

export function MeasureStaff({
  measures,
  locale = "en",
}: {
  measures: StaffMeasure[];
  locale?: Locale;
}) {
  const staffCopy = messages[locale].staff;
  const notes = measures.flatMap((measure) => measure.notes);
  const steps = notes.map((note) => note.step);
  const minStep = Math.min(2, ...steps);
  const maxStep = Math.max(10, ...steps);
  const half = GAP / 2;
  const stemPad = GAP * 3.5;
  const gFromTop = Math.max(CLEF_FROM_G + 40, stemPad + 24 + (maxStep - 4) * half);
  const yAt = (step: number) => gFromTop + (4 - step) * half;
  const clefY = yAt(4) - CLEF_FROM_G;
  const numberY = Math.max(yAt(2), yAt(minStep) + 18, clefY + CLEF_H) + 22;
  const height = Math.ceil(Math.max(numberY + 8, clefY + CLEF_H + 12));

  const placed: { xs: number[]; right: number }[] = [];
  let cursor = LEFT;
  for (const measure of measures) {
    const laid = layoutMeasure(measure.notes, cursor);
    placed.push(laid);
    cursor = laid.right;
  }
  const width = Math.ceil(cursor + 20);

  const names = measures
    .map((measure) => {
      const label = measure.notes.map((note) => noteLabel(note.midi, locale)).join(", ");
      return label ? staffCopy.measure(measure.number, label) : staffCopy.rest(measure.number);
    })
    .join(". ");

  return (
    <svg
      className={styles.staff}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={names ? staffCopy.staffWith(names) : staffCopy.silentStaff}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const lineY = yAt(2 + index * 2);
        return <line key={lineY} x1="16" y1={lineY} x2={width - 16} y2={lineY} />;
      })}
      <image href="/images/clave-sol.png" x={CLEF_X} y={clefY} width={CLEF_W} height={CLEF_H} />
      {measures.map((measure, measureIndex) => {
        const layout = placed[measureIndex];
        const sharpShift = measure.notes.map((note, index) => {
          if (!note.sharp) return 0;
          let shift = 0;
          for (let previous = index - 1; previous >= 0; previous -= 1) {
            if (!samePlace(measure.notes[previous].place, note.place)) break;
            if (measure.notes[previous].sharp) shift += 1;
          }
          return shift;
        });
        const order = measure.notes.map((_, index) => index).sort((a, b) => {
          const raised = (mark: NoteMark | undefined) => (mark === "current" || mark === "miss" ? 1 : 0);
          return raised(measure.marks[a]) - raised(measure.marks[b]);
        });

        return (
          <g key={measure.number}>
            <text
              className={styles.barNumber}
              textAnchor="middle"
              x={((measureIndex === 0 ? LEFT : placed[measureIndex - 1].right) + layout.right) / 2}
              y={numberY}
            >
              {measure.number}
            </text>
            <line x1={layout.right - 8} y1={yAt(10)} x2={layout.right - 8} y2={yAt(2)} />
            {order.map((index) => {
              const note = measure.notes[index];
              const mark = measure.marks[index] ?? "waiting";
              const x = layout.xs[index];
              const y = yAt(note.step);
              const stemUp = note.step < 6;
              const stemX = stemUp ? x + 9 : x - 9;
              const stemEnd = stemUp ? y - GAP * 3.15 : y + GAP * 3.15;
              const open = note.figure === "whole" || note.figure === "half";
              const flagged = note.figure === "eighth";
              const figureTop = note.figure === "whole" || !stemUp ? y - 12 : stemEnd;

              return (
                <g key={`${measure.number}-${note.midi}-${index}`} className={styles[mark]}>
                  <text className={styles.cipher} textAnchor="middle" x={x} y={figureTop - 8}>
                    {americanCipher(note.midi)}
                  </text>
                  {ledgerSteps(note.step).map((line) => (
                    <line key={line} className={styles.ledger} x1={x - 16} y1={yAt(line)} x2={x + 16} y2={yAt(line)} />
                  ))}
                  {note.sharp ? <Sharp x={x - 22 - sharpShift[index] * 14} y={y} /> : null}
                  {note.figure !== "whole" ? (
                    <line className={styles.stem} x1={stemX} y1={y} x2={stemX} y2={stemEnd} />
                  ) : null}
                  {flagged ? (
                    <path
                      className={styles.flag}
                      d={
                        stemUp
                          ? `M ${stemX} ${stemEnd} c 12 6 16 16 5 26`
                          : `M ${stemX} ${stemEnd} c 12 -6 16 -16 5 -26`
                      }
                    />
                  ) : null}
                  <ellipse
                    className={open ? styles.open : styles.head}
                    cx={x}
                    cy={y}
                    rx="11.5"
                    ry="8.4"
                    transform={`rotate(-20 ${x} ${y})`}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function Sharp({ x, y }: { x: number; y: number }) {
  return (
    <g className={styles.sharp}>
      <line x1={x - 4} y1={y - 10} x2={x - 4} y2={y + 10} />
      <line x1={x + 2} y1={y - 10} x2={x + 2} y2={y + 10} />
      <line x1={x - 8} y1={y - 2} x2={x + 6} y2={y - 5} />
      <line x1={x - 8} y1={y + 5} x2={x + 6} y2={y + 2} />
    </g>
  );
}
