import { Midi } from "@tonejs/midi";

import type { Locale } from "@/lib/locale";

const SOLFEGE = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"] as const;
const LETTERS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const DIATONIC = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

export type NoteFigure = "whole" | "half" | "quarter" | "eighth";

export type ScoreNote = {
  midi: number;
  name: string;
  figure: NoteFigure;
  /** Posición dentro del compás, de 0 a 1. */
  place: number;
  step: number;
  sharp: boolean;
};

export type ScoreMeasure = {
  number: number;
  notes: ScoreNote[];
};

export type ScoreTrack = {
  id: number;
  name: string;
  measures: ScoreMeasure[];
};

export type ParsedScore = {
  title: string;
  tracks: ScoreTrack[];
};

export function noteLabel(midi: number, locale: Locale = "en") {
  const rounded = Math.round(midi);
  const pitch = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  const names = locale === "es" ? SOLFEGE : LETTERS;
  return `${names[pitch]}${octave}`;
}

export function americanCipher(midi: number) {
  const rounded = Math.round(midi);
  const pitch = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  return `${LETTERS[pitch]}${octave}`;
}

export function staffStep(midi: number) {
  const rounded = Math.round(midi);
  const pitch = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  return (octave - 4) * 7 + DIATONIC[pitch];
}

function figureFor(durationTicks: number, ppq: number): NoteFigure {
  const quarters = durationTicks / ppq;
  if (quarters >= 3.5) return "whole";
  if (quarters >= 1.75) return "half";
  if (quarters >= 0.875) return "quarter";
  return "eighth";
}

function measurePosition(bars: number) {
  const rounded = Math.round(bars);
  if (Math.abs(bars - rounded) < 1e-6) {
    return { measure: rounded, place: 0 };
  }
  const measure = Math.floor(bars);
  return { measure, place: bars - measure };
}

export function firstPlayable(track: ScoreTrack) {
  const measure = track.measures.findIndex((item) => item.notes.length > 0);
  return measure === -1 ? 0 : measure;
}

export function nextPlayable(track: ScoreTrack, measure: number, note: number) {
  let nextMeasure = measure;
  let nextNote = note + 1;
  while (nextMeasure < track.measures.length) {
    if (nextNote < track.measures[nextMeasure].notes.length) {
      return { measure: nextMeasure, note: nextNote };
    }
    nextMeasure += 1;
    nextNote = 0;
  }
  return null;
}

export function noteCount(track: ScoreTrack) {
  return track.measures.reduce((sum, measure) => sum + measure.notes.length, 0);
}

const PAGE_SIZE = 2;

export function pageOf(index: number) {
  return Math.floor(Math.max(0, index) / PAGE_SIZE);
}

export function pageCount(total: number) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function measureWindow(index: number, total: number) {
  if (total <= 0) return [0];
  const start = pageOf(index) * PAGE_SIZE;
  const indexes: number[] = [];
  for (let cursor = start; cursor < Math.min(total, start + PAGE_SIZE); cursor += 1) indexes.push(cursor);
  return indexes;
}

function handOf(name: string) {
  const value = name.toLowerCase();
  if (/mano\s*derecha|\bright hand\b|\bright\b|\brh\b|\btreble\b/.test(value)) return "right" as const;
  if (/mano\s*izquierda|\bleft hand\b|\bleft\b|\blh\b|\bbass\b/.test(value)) return "left" as const;
  return null;
}

function medianMidi(track: ScoreTrack) {
  const midis = track.measures.flatMap((measure) => measure.notes.map((note) => note.midi)).sort((a, b) => a - b);
  if (midis.length === 0) return 0;
  return midis[Math.floor(midis.length / 2)];
}

export function rightHandTrack(tracks: ScoreTrack[]) {
  const named = tracks.find((track) => handOf(track.name) === "right");
  if (named) return named;

  const unlabeled = tracks.filter((track) => handOf(track.name) === null);
  if (unlabeled.length !== 2 || tracks.length !== 2) return null;

  const [first, second] = unlabeled;
  const higher = medianMidi(first) >= medianMidi(second) ? first : second;
  const lower = higher === first ? second : first;
  if (medianMidi(higher) - medianMidi(lower) < 12) return null;
  return higher;
}

export function parseMidiScore(data: ArrayBuffer, locale: Locale = "en"): ParsedScore {
  if (data.byteLength < 4) {
    throw new Error("bad-midi");
  }

  let midi: Midi;
  try {
    midi = new Midi(data);
  } catch {
    throw new Error("bad-midi");
  }

  const ppq = midi.header.ppq || 480;
  const tracks: ScoreTrack[] = [];

  midi.tracks.forEach((track) => {
    if (track.notes.length === 0) return;

    const sorted = [...track.notes].sort((a, b) => a.ticks - b.ticks || a.midi - b.midi);
    const placed = sorted.map((note) => ({
      note,
      position: measurePosition(note.bars),
    }));
    const lastMeasure = placed.reduce((max, item) => Math.max(max, item.position.measure), 0);
    const measures: ScoreMeasure[] = Array.from({ length: lastMeasure + 1 }, (_, index) => ({
      number: index + 1,
      notes: [],
    }));

    for (const item of placed) {
      const pitch = ((item.note.midi % 12) + 12) % 12;
      measures[item.position.measure].notes.push({
        midi: item.note.midi,
        name: noteLabel(item.note.midi, locale),
        figure: figureFor(item.note.durationTicks, ppq),
        place: item.position.place,
        step: staffStep(item.note.midi),
        sharp: pitch === 1 || pitch === 3 || pitch === 6 || pitch === 8 || pitch === 10,
      });
    }

    const trimmed = track.name.trim();
    tracks.push({
      id: tracks.length,
      name: trimmed,
      measures,
    });
  });

  if (tracks.length === 0) {
    throw new Error("no-notes");
  }

  return {
    title: midi.header.name.trim() || midi.name.trim(),
    tracks,
  };
}
