import type { ContentItem } from "@/lib/types";

export function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function matchesQuery(item: ContentItem, query: string) {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const blob = normalizeText(
    [item.title, item.description, ...item.tags].join(" "),
  );

  return words.every((word) => blob.includes(word));
}
