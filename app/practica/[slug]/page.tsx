import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PracticeSession } from "@/components/PracticeSession/PracticeSession";
import { getNextPractice, getPractice, getPracticeBySlug } from "@/lib/content";
import { getLocale } from "@/lib/get-locale";
import { messages } from "@/lib/messages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPractice().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const item = getPracticeBySlug(slug, locale);
  if (!item) return { title: messages[locale].entry.missingExercise };

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/practica/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.description,
      url: `/practica/${item.slug}`,
      locale: locale === "es" ? "es_ES" : "en_US",
    },
  };
}

export default async function PracticaEntryPage({ params }: PageProps) {
  const locale = await getLocale();
  const { slug } = await params;
  const item = getPracticeBySlug(slug, locale);
  if (!item) notFound();

  const next = getNextPractice(item.slug, locale);
  const station = getPractice(locale).findIndex((entry) => entry.slug === item.slug) + 1;

  return (
    <PracticeSession
      exercise={item}
      station={station}
      next={next ? { slug: next.slug, title: next.title } : null}
    />
  );
}
