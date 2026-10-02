import Link from "next/link";
import { HomeHero } from "@/components/HomeHero/HomeHero";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { getDocumentation, getLearning, getPractice } from "@/lib/content";
import { getLocale } from "@/lib/get-locale";
import { messages } from "@/lib/messages";
import { getSiteUrl } from "@/lib/site";
import styles from "./page.module.scss";

export default async function HomePage() {
  const locale = await getLocale();
  const copy = messages[locale];
  const docs = getDocumentation(locale);
  const lessons = getLearning(locale);
  const warmups = getPractice(locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: copy.meta.siteName,
          description: copy.meta.description,
          inLanguage: locale,
          url: getSiteUrl(),
          about: {
            "@type": "Product",
            name: "Casio CT-X800",
            brand: { "@type": "Brand", name: "Casio" },
            category: copy.home.category,
          },
        }}
      />
      <HomeHero />
      <section className={styles.portals} aria-label={copy.home.modules}>
        <Link className={styles.doc} href="/documentacion">
          <span>{copy.home.module}</span>
          <strong>{copy.home.docsTitle}</strong>
          <p>{copy.home.docsBody(docs.length)}</p>
        </Link>
        <Link className={styles.practice} href="/practica">
          <span>{copy.home.module}</span>
          <strong>{copy.home.practiceTitle}</strong>
          <p>{copy.home.practiceBody(warmups.length)}</p>
        </Link>
        <Link className={styles.learn} href="/aprender">
          <span>{copy.home.module}</span>
          <strong>{copy.home.learnTitle}</strong>
          <p>{copy.home.learnBody(lessons.length)}</p>
        </Link>
        <Link className={styles.games} href="/juegos">
          <span>{copy.home.module}</span>
          <strong>{copy.home.gamesTitle}</strong>
          <p>{copy.home.gamesBody}</p>
        </Link>
      </section>
      <section className={styles.split}>
        <div>
          <h2>{copy.home.startManual}</h2>
          <ul>
            {docs.slice(0, 4).map((item) => (
              <li key={item.id}>
                <Link href={`/documentacion/${item.slug}`}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{copy.home.practicePath}</h2>
          <ol>
            {lessons.slice(0, 4).map((item) => (
              <li key={item.id}>
                <Link href={`/aprender/${item.slug}`}>
                  <strong>{item.title}</strong>
                  <span>
                    {copy.difficulty[item.difficulty]} · {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={styles.expert}>
        <div>
          <p>{copy.home.expertKicker}</p>
          <h2>{copy.home.expertTitle}</h2>
        </div>
        <Link href="/experto">{copy.home.openChat}</Link>
      </section>
    </>
  );
}
