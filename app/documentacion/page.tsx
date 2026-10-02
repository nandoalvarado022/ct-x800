import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog/Catalog";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import { getDocumentation } from "@/lib/content";
import { getLocale } from "@/lib/get-locale";
import { messages, pageMeta } from "@/lib/messages";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getLocale(), "docs", "/documentacion");
}

export default async function DocumentacionPage() {
  const locale = await getLocale();
  const copy = messages[locale].pages.docs;

  return (
    <>
      <PageIntro kicker={copy.kicker} title={copy.heading} lede={copy.lede} />
      <Catalog items={getDocumentation(locale)} basePath="/documentacion" variant="documentation" />
    </>
  );
}
