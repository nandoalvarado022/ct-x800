import Link from "next/link";
import { HomeHero } from "@/components/HomeHero/HomeHero";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { getDocumentation, getLearning } from "@/lib/content";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";
import styles from "./page.module.scss";

export default function HomePage() {
  const docs = getDocumentation();
  const lessons = getLearning();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          description: siteDescription,
          inLanguage: "es",
          url: getSiteUrl(),
          about: {
            "@type": "Product",
            name: "Casio CT-X800",
            brand: { "@type": "Brand", name: "Casio" },
            category: "Teclado musical",
          },
        }}
      />
      <HomeHero />
      <section className={styles.portals} aria-label="Módulos">
        <Link href="/documentacion">
          <span>Módulo</span>
          <strong>Documentación</strong>
          <p>{docs.length} fichas de configuración: pedal, split, USB-MIDI, efectos y alimentación.</p>
        </Link>
        <Link href="/aprender">
          <span>Módulo</span>
          <strong>Aprendizaje</strong>
          <p>{lessons.length} prácticas con XP: Step Up, banco de 160 y canciones MIDI.</p>
        </Link>
      </section>
      <section className={styles.split}>
        <div>
          <h2>Empieza por el manual</h2>
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
          <h2>Ruta de práctica</h2>
          <ol>
            {lessons.slice(0, 4).map((item) => (
              <li key={item.id}>
                <Link href={`/aprender/${item.slug}`}>
                  <strong>{item.title}</strong>
                  <span>
                    {item.difficulty} · {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={styles.expert}>
        <div>
          <p>Pregúntale al experto</p>
          <h2>Una duda concreta, una respuesta del CT-X800.</h2>
        </div>
        <Link href="/experto">Abrir el chat</Link>
      </section>
    </>
  );
}
