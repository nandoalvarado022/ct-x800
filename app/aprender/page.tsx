import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog/Catalog";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import { getLearning } from "@/lib/content";
import { getLocale } from "@/lib/get-locale";
import { messages, pageMeta } from "@/lib/messages";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getLocale(), "learn", "/aprender");
}

export default async function AprenderPage() {
  const locale = await getLocale();
  const copy = messages[locale].pages.learn;

  return (
    <>
      <PageIntro kicker={copy.kicker} title={copy.heading} lede={copy.lede} />
      <Catalog items={getLearning(locale)} basePath="/aprender" variant="learning" />
    </>
  );
}
