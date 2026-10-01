import documentationJson from "@/data/documentation.json";
import learningJson from "@/data/learning.json";
import practiceJson from "@/data/practice.json";
import {
  DIFFICULTIES,
  type ContentItem,
  type DocumentationItem,
  type LearningItem,
  type PracticeExercise,
  type PracticeKey,
} from "@/lib/types";

function assertUniqueSlugs(items: ContentItem[]) {
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.id || !item.slug || !item.title || !item.description || !item.content) {
      throw new Error(`Ficha incompleta: ${item.id || item.slug || "sin id"}`);
    }
    if (seen.has(item.slug)) {
      throw new Error(`Slug duplicado: ${item.slug}`);
    }
    seen.add(item.slug);
  }
}

function asDocumentation(value: unknown): DocumentationItem[] {
  const items = value as DocumentationItem[];
  assertUniqueSlugs(items);
  for (const item of items) {
    if (item.type !== "documentation") {
      throw new Error(`La ficha ${item.id} no es documentación`);
    }
  }
  return items;
}

function asLearning(value: unknown): LearningItem[] {
  const items = value as LearningItem[];
  assertUniqueSlugs(items);
  for (const item of items) {
    if (item.type !== "learning" || !DIFFICULTIES.includes(item.difficulty)) {
      throw new Error(`La ficha ${item.id} no es una lección válida`);
    }
  }
  return items;
}

function asKey(value: PracticeKey, stepId: string) {
  if (!value || typeof value.note !== "string" || !value.note || typeof value.finger !== "string" || !value.finger) {
    throw new Error(`Tecla inválida en el paso ${stepId}`);
  }
}

function asPractice(value: unknown): PracticeExercise[] {
  if (!Array.isArray(value)) {
    throw new Error("practice.json debe ser una lista");
  }

  const items = value as PracticeExercise[];
  const seen = new Set<string>();

  for (const item of items) {
    if (!item.id || !item.slug || !item.title || !item.description || !item.intro) {
      throw new Error(`Ejercicio incompleto: ${item.id || item.slug || "sin id"}`);
    }
    if (!Number.isFinite(item.minutes) || item.minutes <= 0) {
      throw new Error(`El ejercicio ${item.id} necesita una duración`);
    }
    if (!Number.isFinite(item.xp) || item.xp <= 0) {
      throw new Error(`El ejercicio ${item.id} necesita XP`);
    }
    if (!Array.isArray(item.steps) || item.steps.length === 0) {
      throw new Error(`El ejercicio ${item.id} no tiene pasos`);
    }
    if (seen.has(item.slug)) {
      throw new Error(`Slug duplicado: ${item.slug}`);
    }
    seen.add(item.slug);

    const stepIds = new Set<string>();
    for (const step of item.steps) {
      if (!step.id || !step.title || !step.say || !step.tip || !step.cheer || !step.action) {
        throw new Error(`Paso incompleto en ${item.id}`);
      }
      if (stepIds.has(step.id)) {
        throw new Error(`Paso duplicado ${step.id} en ${item.id}`);
      }
      stepIds.add(step.id);
      step.keys?.forEach((key) => asKey(key, step.id));
    }
  }

  return items;
}

export const documentation = asDocumentation(documentationJson);
export const learning = asLearning(learningJson);
export const practice = asPractice(practiceJson);

export function getDocumentation() {
  return documentation;
}

export function getLearning() {
  return learning;
}

export function getDocumentationBySlug(slug: string) {
  return documentation.find((item) => item.slug === slug);
}

export function getLearningBySlug(slug: string) {
  return learning.find((item) => item.slug === slug);
}

export function getPractice() {
  return practice;
}

export function getPracticeBySlug(slug: string) {
  return practice.find((item) => item.slug === slug);
}

export function getNextPractice(slug: string) {
  const index = practice.findIndex((item) => item.slug === slug);
  if (index < 0) return undefined;
  return practice[index + 1];
}

export function getRelated(item: ContentItem, limit = 3) {
  const pool = item.type === "documentation" ? documentation : learning;

  return pool
    .filter((candidate) => candidate.id !== item.id)
    .map((candidate) => ({
      candidate,
      score: candidate.tags.filter((tag) => item.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function getNextLearning(slug: string) {
  const index = learning.findIndex((item) => item.slug === slug);
  if (index < 0) return undefined;
  return learning[index + 1];
}
