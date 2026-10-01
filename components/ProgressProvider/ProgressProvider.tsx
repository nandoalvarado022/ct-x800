"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { learning } from "@/lib/content";
import { rankForXp, xpForDifficulty } from "@/lib/progress";

const STORAGE_KEY = "ctx800-mastery";

type ProgressValue = {
  ready: boolean;
  completed: string[];
  xp: number;
  rank: ReturnType<typeof rankForXp>;
  isComplete: (slug: string) => boolean;
  toggle: (slug: string) => void;
};

const ProgressContext = createContext<ProgressValue | null>(null);

function readCompleted() {
  const known = new Set(learning.map((item) => item.slug));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompleted(readCompleted());
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

  const xp = useMemo(() => {
    return learning.reduce((total, item) => {
      if (!completed.includes(item.slug)) return total;
      return total + xpForDifficulty(item.difficulty);
    }, 0);
  }, [completed]);

  const value = useMemo<ProgressValue>(
    () => ({
      ready,
      completed,
      xp,
      rank: rankForXp(xp),
      isComplete: (slug) => completed.includes(slug),
      toggle,
    }),
    [completed, ready, toggle, xp],
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
