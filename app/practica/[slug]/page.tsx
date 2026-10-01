import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PracticeSession } from "@/components/PracticeSession/PracticeSession";
import { getNextPractice, getPractice, getPracticeBySlug } from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPractice().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getPracticeBySlug(slug);
  if (!item) return { title: "Ejercicio no encontrado" };

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/practica/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.description,
      url: `/practica/${item.slug}`,
    },
  };
}

export default async function PracticaEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getPracticeBySlug(slug);
  if (!item) notFound();

  const next = getNextPractice(item.slug);
  const station = getPractice().findIndex((entry) => entry.slug === item.slug) + 1;

  return (
    <PracticeSession
      exercise={item}
      station={station}
      next={next ? { slug: next.slug, title: next.title } : null}
    />
  );
}
