import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryView } from "@/components/EntryView/EntryView";
import { getDocumentation, getDocumentationBySlug, getRelated } from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getDocumentation().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getDocumentationBySlug(slug);
  if (!item) return { title: "Ficha no encontrada" };

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
    },
  };
}

export default async function DocumentacionEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getDocumentationBySlug(slug);
  if (!item) notFound();

  return <EntryView item={item} related={getRelated(item)} />;
}
