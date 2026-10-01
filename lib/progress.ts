import type { Difficulty } from "@/lib/types";

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  fácil: 40,
  medio: 80,
  avanzado: 140,
};

export const RANKS = [
  { name: "Aprendiz", min: 0 },
  { name: "Ensayo", min: 100 },
  { name: "Sesionista", min: 250 },
  { name: "Solista", min: 450 },
  { name: "Fuente", min: 700 },
] as const;

export function xpForDifficulty(difficulty: Difficulty) {
  return XP_BY_DIFFICULTY[difficulty];
}

export function rankForXp(xp: number) {
  const current =
    [...RANKS].reverse().find((rank) => xp >= rank.min) ?? RANKS[0];
  const next = RANKS.find((rank) => rank.min > current.min) ?? null;
  const span = next ? next.min - current.min : 1;
  const into = next ? xp - current.min : span;
  const ratio = next ? Math.min(into / span, 1) : 1;

  return { current, next, ratio };
}
