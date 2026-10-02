import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryView } from "@/components/EntryView/EntryView";
import { getDocumentation, getDocumentationBySlug, getRelated } from "@/lib/content";
import { getLocale } from "@/lib/get-locale";
import { messages } from "@/lib/messages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getDocumentation().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const item = getDocumentationBySlug(slug, locale);
  if (!item) return { title: messages[locale].entry.missingDoc };

  return {
    title: item.title,
    description: item.description,
    keywords: item.tags,
    alternates: { canonical: `/documentacion/${item.slug}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.description,
      url: `/documentacion/${item.slug}`,
      locale: locale === "es" ? "es_ES" : "en_US",
    },
  };
}

export default async function DocumentacionEntryPage({ params }: PageProps) {
  const locale = await getLocale();
  const { slug } = await params;
  const item = getDocumentationBySlug(slug, locale);
  if (!item) notFound();

  return <EntryView item={item} related={getRelated(item, locale)} />;
}
