export const ROUND_SIZE = 5;

export type StaffNote = {
  id: string;
  name: string;
  /** 0 es el Do de la línea adicional; cada paso sube un espacio o una línea. */
  step: number;
};

export const STAFF_NOTES: StaffNote[] = [
  { id: "do", name: "Do", step: 0 },
  { id: "re", name: "Re", step: 1 },
  { id: "mi", name: "Mi", step: 2 },
  { id: "fa", name: "Fa", step: 3 },
  { id: "sol", name: "Sol", step: 4 },
  { id: "la", name: "La", step: 5 },
  { id: "si", name: "Si", step: 6 },
];

export type StaffQuestion = {
  note: StaffNote;
  options: StaffNote[];
};

function shuffle<T>(items: T[], random: () => number) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }
  return next;
}

export function makeQuestion(
  previousId?: string,
  random: () => number = Math.random,
): StaffQuestion {
  const candidates = STAFF_NOTES.filter((note) => note.id !== previousId);
  const note = candidates[Math.floor(random() * candidates.length)];
  const others = STAFF_NOTES.filter((item) => item.id !== note.id);
  const neighbors = others.filter((item) => Math.abs(item.step - note.step) <= 2);
  const distractorPool = neighbors.length >= 2 ? neighbors : others;
  const distractors = shuffle(distractorPool, random).slice(0, 2);

  return {
    note,
    options: shuffle([note, ...distractors], random),
  };
}
