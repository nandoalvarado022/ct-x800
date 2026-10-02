import documentationEn from "@/data/documentation.en.json";
import documentationEs from "@/data/documentation.json";
import learningEn from "@/data/learning.en.json";
import learningEs from "@/data/learning.json";
import practiceEn from "@/data/practice.en.json";
import practiceEs from "@/data/practice.json";
import type { Locale } from "@/lib/locale";
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

const documentation = {
  en: asDocumentation(documentationEn),
  es: asDocumentation(documentationEs),
} satisfies Record<Locale, DocumentationItem[]>;

const learning = {
  en: asLearning(learningEn),
  es: asLearning(learningEs),
} satisfies Record<Locale, LearningItem[]>;

const practice = {
  en: asPractice(practiceEn),
  es: asPractice(practiceEs),
} satisfies Record<Locale, PracticeExercise[]>;

function assertSameSlugs(label: string, left: { slug: string }[], right: { slug: string }[]) {
  const a = left.map((item) => item.slug).join("|");
  const b = right.map((item) => item.slug).join("|");
  if (a !== b) {
    throw new Error(`Slugs distintos en ${label}`);
  }
}

assertSameSlugs("documentación", documentation.en, documentation.es);
assertSameSlugs("aprendizaje", learning.en, learning.es);
assertSameSlugs("práctica", practice.en, practice.es);

export function getDocumentation(locale: Locale = "en") {
  return documentation[locale];
}

export function getLearning(locale: Locale = "en") {
  return learning[locale];
}

export function getDocumentationBySlug(slug: string, locale: Locale = "en") {
  return documentation[locale].find((item) => item.slug === slug);
}

export function getLearningBySlug(slug: string, locale: Locale = "en") {
  return learning[locale].find((item) => item.slug === slug);
}

export function getPractice(locale: Locale = "en") {
  return practice[locale];
}

export function getPracticeBySlug(slug: string, locale: Locale = "en") {
  return practice[locale].find((item) => item.slug === slug);
}

export function getNextPractice(slug: string, locale: Locale = "en") {
  const items = practice[locale];
  const index = items.findIndex((item) => item.slug === slug);
  if (index < 0) return undefined;
  return items[index + 1];
}

export function getRelated(item: ContentItem, locale: Locale = "en", limit = 3) {
  const pool = item.type === "documentation" ? documentation[locale] : learning[locale];

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

export function getNextLearning(slug: string, locale: Locale = "en") {
  const items = learning[locale];
  const index = items.findIndex((item) => item.slug === slug);
  if (index < 0) return undefined;
  return items[index + 1];
}
