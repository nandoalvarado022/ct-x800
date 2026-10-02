"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { PitchDetector } from "pitchy";
import { useI18n } from "@/components/LocaleProvider/LocaleProvider";
import type { Messages } from "@/lib/messages";
import {
  firstPlayable,
  measureWindow,
  nextPlayable,
  pageCount,
  pageOf,
  noteCount,
  noteLabel,
  parseMidiScore,
  rightHandTrack,
  type ParsedScore,
  type ScoreTrack,
} from "@/lib/midi-score";
import { MeasureStaff, type NoteMark, type StaffMeasure } from "./MeasureStaff";
import styles from "./ScoreGame.module.scss";

const HOLD_MS = 120;
const SILENCE_MS = 80;

function micErrorMessage(error: unknown, copy: Messages["scoreGame"]) {
  if (error instanceof DOMException && error.name === "NotAllowedError") return copy.micDenied;
  if (error instanceof DOMException && error.name === "NotFoundError") return copy.micMissing;
  return copy.micFailed;
}

function notesLabel(count: number, copy: Messages["scoreGame"]) {
  return `${count} ${count === 1 ? copy.note : copy.notes}`;
}

function closingLine(clean: number, total: number, copy: Messages["scoreGame"]) {
  if (clean === total) return copy.allClean;
  if (clean === 0) return copy.noneClean;
  return copy.someClean;
}

function midiError(error: unknown, copy: Messages["scoreGame"]) {
  if (error instanceof Error && error.message === "no-notes") return copy.noNotes;
  return copy.badMidi;
}

export function ScoreGame() {
  const { locale, m } = useI18n();
  const copy = m.scoreGame;
  const [score, setScore] = useState<ParsedScore | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [trackId, setTrackId] = useState(0);
  const [measureIndex, setMeasureIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const [results, setResults] = useState<Record<string, "clean" | "later">>({});
  const [listening, setListening] = useState(false);
  const [opening, setOpening] = useState(false);
  const [listenError, setListenError] = useState<string | null>(null);
  const [missKey, setMissKey] = useState<string | null>(null);
  const [heard, setHeard] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef({ measure: 0, note: 0 });
  const trackRef = useRef<ScoreTrack | null>(null);
  const doneRef = useRef(false);
  const onPitchRef = useRef<(midi: number) => void>(() => {});
  const stopRef = useRef<(() => void) | null>(null);
  const sessionRef = useRef(0);
  const missTimer = useRef(0);

  const track = score?.tracks.find((item) => item.id === trackId) ?? null;
  trackRef.current = track;

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      stopRef.current?.();
      window.clearTimeout(missTimer.current);
    };
  }, []);

  function stopListening() {
    sessionRef.current += 1;
    stopRef.current?.();
    stopRef.current = null;
    setListening(false);
    setOpening(false);
  }

  function reset(next: ScoreTrack) {
    const measure = firstPlayable(next);
    cursorRef.current = { measure, note: 0 };
    doneRef.current = false;
    setMeasureIndex(measure);
    setNoteIndex(0);
    setResults({});
    setMissKey(null);
    setHeard(null);
    setDone(false);
    setListenError(null);
    window.clearTimeout(missTimer.current);
  }

  function repeatMeasure() {
    cursorRef.current = { measure: measureIndex, note: 0 };
    setNoteIndex(0);
    setMissKey(null);
    setHeard(null);
    window.clearTimeout(missTimer.current);
    setResults((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${measureIndex}-`)) delete next[key];
      }
      return next;
    });
  }

  function moveTo(measure: number, note: number) {
    cursorRef.current = { measure, note };
    setMeasureIndex(measure);
    setNoteIndex(note);
    setMissKey(null);
    setHeard(null);
  }

  function goToPage(nextPage: number) {
    if (!track) return;
    const start = nextPage * 2;
    const landing = track.measures[start]?.notes.length
      ? { measure: start, note: 0 }
      : (nextPlayable(track, start, -1) ?? { measure: start, note: 0 });
    if (landing.measure >= track.measures.length) return;
    moveTo(landing.measure, landing.note);
  }

  onPitchRef.current = (midi) => {
    const currentTrack = trackRef.current;
    if (!currentTrack || doneRef.current) return;
    const cursor = cursorRef.current;
    const expected = currentTrack.measures[cursor.measure]?.notes[cursor.note];
    if (!expected) return;

    const key = `${cursor.measure}-${cursor.note}`;
    if (midi !== expected.midi) {
      setHeard(midi);
      setMissKey(key);
      setResults((prev) => (prev[key] === "clean" ? prev : { ...prev, [key]: "later" }));
      window.clearTimeout(missTimer.current);
      missTimer.current = window.setTimeout(() => {
        setMissKey((current) => (current === key ? null : current));
      }, 450);
      return;
    }

    setHeard(null);
    setMissKey(null);
    setResults((prev) => ({ ...prev, [key]: prev[key] === "later" ? "later" : "clean" }));
    const next = nextPlayable(currentTrack, cursor.measure, cursor.note);
    if (!next) {
      doneRef.current = true;
      setDone(true);
      stopListening();
      return;
    }
    moveTo(next.measure, next.note);
  };

  async function startListening() {
    stopListening();
    const session = sessionRef.current;
    setOpening(true);
    setListenError(null);
    const context = new AudioContext();
    void context.resume();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (sessionRef.current !== session) {
        stream.getTracks().forEach((item) => item.stop());
        void context.close();
        return;
      }

      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      detector.clarityThreshold = 0.9;
      detector.minVolumeDecibels = -45;
      const input = new Float32Array(detector.inputLength);
      let frame = 0;
      let silentSince = 0;
      let stableMidi = -1;
      let stableSince = 0;
      let latched: number | null = null;

      const tick = () => {
        if (sessionRef.current !== session) return;
        analyser.getFloatTimeDomainData(input);
        const [pitch, clarity] = detector.findPitch(input, context.sampleRate);
        const now = performance.now();
        const midi =
          clarity >= 0.9 && pitch >= 50 && pitch <= 2500
            ? Math.round(69 + 12 * Math.log2(pitch / 440))
            : null;

        if (midi === null) {
          if (silentSince === 0) silentSince = now;
          if (now - silentSince >= SILENCE_MS) {
            latched = null;
            stableMidi = -1;
          }
        } else {
          silentSince = 0;
          if (midi !== stableMidi) {
            stableMidi = midi;
            stableSince = now;
          } else if (now - stableSince >= HOLD_MS && midi !== latched) {
            latched = midi;
            onPitchRef.current(midi);
          }
        }

        if (sessionRef.current !== session) return;
        frame = requestAnimationFrame(tick);
      };

      let closed = false;
      frame = requestAnimationFrame(tick);
      stopRef.current = () => {
        if (closed) return;
        closed = true;
        cancelAnimationFrame(frame);
        stream.getTracks().forEach((item) => item.stop());
        void context.close();
      };
      setListening(true);
      setOpening(false);
    } catch (error) {
      void context.close();
      if (sessionRef.current !== session) return;
      setListening(false);
      setOpening(false);
      setListenError(micErrorMessage(error, copy));
    }
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    stopListening();
    try {
      const parsed = parseMidiScore(await file.arrayBuffer(), locale);
      setScore(parsed);
      setFileName(file.name);
      setFileError(null);
      setTrackId(parsed.tracks[0].id);
      reset(parsed.tracks[0]);
    } catch (error) {
      setScore(null);
      setFileName(null);
      setFileError(midiError(error, copy));
    }
  }

  function chooseTrack(id: number) {
    const next = score?.tracks.find((item) => item.id === id);
    if (!next) return;
    setTrackId(id);
    reset(next);
  }

  const clean = Object.values(results).filter((item) => item === "clean").length;
  const total = track ? noteCount(track) : 0;
  const measure = track?.measures[measureIndex];
  const current = measure?.notes[noteIndex];
  const windowIndexes = track ? measureWindow(measureIndex, track.measures.length) : [];
  const rightHand = score ? rightHandTrack(score.tracks) : null;
  const page = pageOf(measureIndex);
  const pages = track ? pageCount(track.measures.length) : 1;
  const pageStart = windowIndexes[0] ?? 0;
  const pageEnd = windowIndexes[windowIndexes.length - 1] ?? pageStart;
  const pageLabel = track
    ? pageStart === pageEnd
      ? copy.measureOf(track.measures[pageStart]?.number ?? pageStart + 1, track.measures.length)
      : copy.measuresOf(
          track.measures[pageStart]?.number ?? pageStart + 1,
          track.measures[pageEnd]?.number ?? pageEnd + 1,
          track.measures.length,
        )
    : "";
  const currentName = current ? noteLabel(current.midi, locale) : "";
  const trackTitle = (name: string, id: number) => name || copy.trackName(id + 1);

  let feedback = copy.choose;
  if (fileError) feedback = fileError;
  else if (listenError) feedback = listenError;
  else if (current && listening && missKey && heard !== null) {
    feedback = copy.heard(noteLabel(heard, locale), currentName);
  } else if (current && listening) feedback = copy.listening(currentName);
  else if (current) feedback = copy.pressListen(currentName);
  else if (measure && measure.notes.length === 0) feedback = copy.emptyMeasure;

  return (
    <section className={styles.game} aria-label={copy.label}>
      <input
        ref={inputRef}
        className={styles.file}
        type="file"
        accept=".mid,.midi,audio/midi,audio/x-midi"
        onChange={onFile}
      />

      {!score || !track || !measure ? (
        <div className={styles.idle}>
          <p className={styles.ask}>{copy.chooseShort}</p>
          <p className={styles.feedback} aria-live="polite">
            {fileError ?? copy.chooseHint}
          </p>
          <button type="button" className={styles.primary} onClick={() => inputRef.current?.click()}>
            {copy.pick}
          </button>
        </div>
      ) : done ? (
        <div className={styles.result}>
          <p>{copy.trackReady}</p>
          <strong>
            {clean} {copy.of} {total}
          </strong>
          <span>{closingLine(clean, total, copy)}</span>
          <div className={styles.controls}>
            <button type="button" className={styles.primary} onClick={() => reset(track)}>
              {copy.again}
            </button>
            <button type="button" className={styles.secondary} onClick={() => inputRef.current?.click()}>
              {copy.otherFile}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.hud}>
            <p>
              {copy.measureOf(measure.number, track.measures.length)}
            </p>
            <p>
              {clean} {copy.firstTry}
            </p>
          </div>
          {score.title ? <p className={styles.song}>{score.title}</p> : null}
          {fileName ? <p className={styles.fileName}>{fileName}</p> : null}
          {score.tracks.length > 1 ? (
            <label className={styles.track}>
              {copy.track}
              <select value={trackId} onChange={(event) => chooseTrack(Number(event.target.value))}>
                {score.tracks.map((item) => (
                  <option key={item.id} value={item.id}>
                    {trackTitle(item.name, item.id)} · {notesLabel(noteCount(item), copy)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <p className={styles.ask}>{current ? copy.playNote(currentName) : copy.restMeasure}</p>
          {rightHand && rightHand.id !== track.id ? (
            <>
              <p className={styles.hand}>{copy.rightHand}</p>
              <div className={styles.score}>
                <MeasureStaff
                  locale={locale}
                  measures={staffMeasures(rightHand, windowIndexes, measureIndex, noteIndex, missKey, false)}
                />
              </div>
              <p className={styles.hand}>{trackTitle(track.name, track.id)}</p>
            </>
          ) : null}
          {rightHand?.id === track.id ? <p className={styles.hand}>{copy.rightHand}</p> : null}
          <div className={styles.score}>
            <MeasureStaff
              locale={locale}
              measures={staffMeasures(track, windowIndexes, measureIndex, noteIndex, missKey, true)}
            />
          </div>
          <nav className={styles.pager} aria-label={copy.measures}>
            <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 0}>
              {copy.back}
            </button>
            <p>{pageLabel}</p>
            <button type="button" onClick={() => goToPage(page + 1)} disabled={page >= pages - 1}>
              {copy.next}
            </button>
          </nav>
          <p className={styles.feedback} aria-live="polite">
            {feedback}
          </p>
          <div className={styles.controls}>
            {current ? (
              <button
                type="button"
                className={styles.primary}
                aria-pressed={listening}
                disabled={opening}
                onClick={() => (listening ? stopListening() : void startListening())}
              >
                {opening ? copy.opening : listening ? copy.stop : copy.listen}
              </button>
            ) : (
              <button
                type="button"
                className={styles.primary}
                onClick={() => {
                  const next = nextPlayable(track, measureIndex, -1);
                  if (!next) {
                    doneRef.current = true;
                    setDone(true);
                    stopListening();
                    return;
                  }
                  moveTo(next.measure, next.note);
                }}
              >
                {copy.nextMeasure}
              </button>
            )}
            <button type="button" className={styles.secondary} onClick={repeatMeasure} disabled={!current}>
              {copy.repeat}
            </button>
            <button type="button" className={styles.secondary} onClick={() => inputRef.current?.click()}>
              {copy.otherFile}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function staffMeasures(
  source: ScoreTrack,
  indexes: number[],
  activeIndex: number,
  noteIndex: number,
  missKey: string | null,
  active: boolean,
): StaffMeasure[] {
  return indexes.map((index) => {
    const measure = source.measures[index];
    const notes = measure?.notes ?? [];
    const number = measure?.number ?? index + 1;
    if (!active) return { number, notes, marks: notes.map(() => "printed" as const) };
    if (index < activeIndex) return { number, notes, marks: notes.map(() => "done" as const) };
    if (index > activeIndex) return { number, notes, marks: notes.map(() => "waiting" as const) };
    return { number, notes, marks: marksFor(notes.length, noteIndex, missKey, activeIndex) };
  });
}

function marksFor(length: number, noteIndex: number, missKey: string | null, measureIndex: number): NoteMark[] {
  return Array.from({ length }, (_, index) => {
    if (index < noteIndex) return "done";
    if (index === noteIndex && missKey === `${measureIndex}-${index}`) return "miss";
    if (index === noteIndex) return "current";
    return "waiting";
  });
}
