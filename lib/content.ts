import documentationJson from "@/data/documentation.json";
import learningJson from "@/data/learning.json";
import { DIFFICULTIES, type ContentItem, type DocumentationItem, type LearningItem } from "@/lib/types";

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

export const documentation = asDocumentation(documentationJson);
export const learning = asLearning(learningJson);

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
