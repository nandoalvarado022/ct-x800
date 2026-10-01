"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { learning, practice } from "@/lib/content";
import { rankForXp, xpForDifficulty } from "@/lib/progress";

const STORAGE_KEY = "ctx800-mastery";
const PRACTICE_KEY = "ctx800-practice";

type ProgressValue = {
  ready: boolean;
  completed: string[];
  xp: number;
  rank: ReturnType<typeof rankForXp>;
  isComplete: (slug: string) => boolean;
  toggle: (slug: string) => void;
  isPracticeComplete: (slug: string) => boolean;
  completePractice: (slug: string) => void;
};

const ProgressContext = createContext<ProgressValue | null>(null);

function readSlugs(storageKey: string, known: Set<string>) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (value): value is string => typeof value === "string" && known.has(value),
    );
  } catch {
    return [];
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [practiceDone, setPracticeDone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompleted(readSlugs(STORAGE_KEY, new Set(learning.map((item) => item.slug))));
    setPracticeDone(readSlugs(PRACTICE_KEY, new Set(practice.map((item) => item.slug))));
    setReady(true);
  }, []);

  const toggle = useCallback((slug: string) => {
    setCompleted((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const completePractice = useCallback((slug: string) => {
    setPracticeDone((current) => {
      if (current.includes(slug) || !practice.some((item) => item.slug === slug)) {
        return current;
      }
      const next = [...current, slug];
      localStorage.setItem(PRACTICE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const xp = useMemo(() => {
    const fromLessons = learning.reduce((total, item) => {
      if (!completed.includes(item.slug)) return total;
      return total + xpForDifficulty(item.difficulty);
    }, 0);
    const fromPractice = practice.reduce((total, item) => {
      if (!practiceDone.includes(item.slug)) return total;
      return total + item.xp;
    }, 0);
    return fromLessons + fromPractice;
  }, [completed, practiceDone]);

  const value = useMemo<ProgressValue>(
    () => ({
      ready,
      completed,
      xp,
      rank: rankForXp(xp),
      isComplete: (slug) => completed.includes(slug),
      toggle,
      isPracticeComplete: (slug) => practiceDone.includes(slug),
      completePractice,
    }),
    [completed, completePractice, practiceDone, ready, toggle, xp],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) {
    throw new Error("useProgress debe usarse dentro de ProgressProvider");
  }
  return value;
}
