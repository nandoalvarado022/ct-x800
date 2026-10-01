import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryView } from "@/components/EntryView/EntryView";
import { getLearning, getLearningBySlug, getNextLearning, getRelated } from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getLearning().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getLearningBySlug(slug);
  if (!item) return { title: "Práctica no encontrada" };

  return {
    title: item.title,
    description: item.description,
    keywords: [...item.tags, item.difficulty],
    alternates: { canonical: `/aprender/${item.slug}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.description,
      url: `/aprender/${item.slug}`,
    },
  };
}

export default async function AprenderEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getLearningBySlug(slug);
  if (!item) notFound();

  return (
    <EntryView item={item} related={getRelated(item)} nextLesson={getNextLearning(item.slug)} />
  );
}
