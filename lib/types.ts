export const DIFFICULTIES = ["fácil", "medio", "avanzado"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];
export type ContentType = "documentation" | "learning";

type EntryBase = {
  id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  content: string;
};

export type DocumentationItem = EntryBase & {
  type: "documentation";
};

export type LearningItem = EntryBase & {
  type: "learning";
  difficulty: Difficulty;
};

export type ContentItem = DocumentationItem | LearningItem;
