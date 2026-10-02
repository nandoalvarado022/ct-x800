import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import { PracticeBoard } from "@/components/PracticeBoard/PracticeBoard";
import { getPractice } from "@/lib/content";
import { getLocale } from "@/lib/get-locale";
import { messages, pageMeta } from "@/lib/messages";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getLocale(), "practice", "/practica");
}

export default async function PracticaPage() {
  const locale = await getLocale();
  const copy = messages[locale].pages.practice;

  return (
    <>
      <PageIntro kicker={copy.kicker} title={copy.heading} lede={copy.lede} />
      <PracticeBoard exercises={getPractice(locale)} />
    </>
  );
}
