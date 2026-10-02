import type { Metadata } from "next";
import Link from "next/link";
import { ChatPanel } from "@/components/ChatPanel/ChatPanel";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import { getLocale } from "@/lib/get-locale";
import { messages, pageMeta } from "@/lib/messages";
import styles from "./page.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getLocale(), "expert", "/experto");
}

export default async function ExpertoPage() {
  const locale = await getLocale();
  const copy = messages[locale].pages.expert;

  return (
    <>
      <PageIntro kicker={copy.kicker} title={copy.heading} lede={copy.lede} />
      <div className={styles.layout}>
        <aside className={styles.aside}>
          <h2>{copy.asideTitle}</h2>
          <p>{copy.asideBody}</p>
          <ul>
            {copy.topics.map((topic) => (
              <li key={topic.href}>
                <Link href={topic.href}>{topic.label}</Link>
              </li>
            ))}
          </ul>
        </aside>
        <ChatPanel key={locale} />
      </div>
    </>
  );
}
