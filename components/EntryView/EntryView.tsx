import Link from "next/link";
import { CompleteLesson } from "@/components/CompleteLesson/CompleteLesson";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { Markdown } from "@/components/Markdown/Markdown";
import { getLocale } from "@/lib/get-locale";
import { messages } from "@/lib/messages";
import { xpForDifficulty } from "@/lib/progress";
import { getSiteUrl } from "@/lib/site";
import type { ContentItem, LearningItem } from "@/lib/types";
import styles from "./EntryView.module.scss";

type EntryViewProps = {
  item: ContentItem;
  related: ContentItem[];
  nextLesson?: LearningItem;
};

export async function EntryView({ item, related, nextLesson }: EntryViewProps) {
  const locale = await getLocale();
  const copy = messages[locale];
  const base = item.type === "documentation" ? "/documentacion" : "/aprender";
  const sectionLabel = item.type === "documentation" ? copy.entry.docs : copy.entry.learn;
  const url = `${getSiteUrl()}${base}/${item.slug}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": item.type === "learning" ? "LearningResource" : "TechArticle",
    headline: item.title,
    name: item.title,
    description: item.description,
    keywords: item.tags.join(", "),
    inLanguage: locale,
    url,
    about: {
      "@type": "Product",
      name: "Casio CT-X800",
      brand: { "@type": "Brand", name: "Casio" },
    },
  };

  if (item.type === "learning") {
    jsonLd.learningResourceType = "tutorial";
    jsonLd.educationalLevel = copy.difficulty[item.difficulty];
  }

  return (
    <article className={styles.article}>
      <JsonLd data={jsonLd} />
      <nav className={styles.crumb} aria-label={copy.entry.crumb}>
        <Link href="/">{copy.entry.home}</Link>
        <span aria-hidden="true">/</span>
        <Link href={base}>{sectionLabel}</Link>
      </nav>
      <header className={styles.header}>
        <p>{sectionLabel}</p>
        <h1>{item.title}</h1>
        <p className={styles.description}>{item.description}</p>
        <ul className={styles.tags}>
          {item.type === "learning" ? (
            <li>
              {copy.difficulty[item.difficulty]} · {xpForDifficulty(item.difficulty)} XP
            </li>
          ) : null}
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </header>
      <Markdown content={item.content} />
      {item.type === "learning" ? <CompleteLesson item={item} /> : null}
      {nextLesson ? (
        <p className={styles.next}>
          <Link href={`/aprender/${nextLesson.slug}`}>
            {copy.entry.next(nextLesson.title)}
          </Link>
        </p>
      ) : null}
      {related.length > 0 ? (
        <aside className={styles.related}>
          <h2>{copy.entry.related}</h2>
          <ul>
            {related.map((entry) => (
              <li key={entry.id}>
                <Link href={`${base}/${entry.slug}`}>
                  <strong>{entry.title}</strong>
                  <span>{entry.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
