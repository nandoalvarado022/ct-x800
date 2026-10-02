import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import { ScoreGame } from "@/components/ScoreGame/ScoreGame";
import { getLocale } from "@/lib/get-locale";
import { messages, pageMeta } from "@/lib/messages";
import styles from "./page.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getLocale(), "score", "/juegos/partitura");
}

export default async function PartituraPage() {
  const locale = await getLocale();
  const copy = messages[locale].pages.score;

  return (
    <>
      <PageIntro kicker={copy.kicker} title={copy.heading} lede={copy.lede} />
      <ScoreGame />
      <p className={styles.back}>
        <Link href="/juegos">{copy.back}</Link>
      </p>
    </>
  );
}
