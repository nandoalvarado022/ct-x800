import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryView } from "@/components/EntryView/EntryView";
import { getLearning, getLearningBySlug, getNextLearning, getRelated } from "@/lib/content";
import { getLocale } from "@/lib/get-locale";
import { messages } from "@/lib/messages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getLearning().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const item = getLearningBySlug(slug, locale);
  if (!item) return { title: messages[locale].entry.missingLesson };

  return {
    title: item.title,
    description: item.description,
    keywords: [...item.tags, messages[locale].difficulty[item.difficulty]],
    alternates: { canonical: `/aprender/${item.slug}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.description,
      url: `/aprender/${item.slug}`,
      locale: locale === "es" ? "es_ES" : "en_US",
    },
  };
}

export default async function AprenderEntryPage({ params }: PageProps) {
  const locale = await getLocale();
  const { slug } = await params;
  const item = getLearningBySlug(slug, locale);
  if (!item) notFound();

  return (
    <EntryView
      item={item}
      related={getRelated(item, locale)}
      nextLesson={getNextLearning(item.slug, locale)}
    />
  );
}
