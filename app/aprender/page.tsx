import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog/Catalog";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import { getLearning } from "@/lib/content";

export const metadata: Metadata = {
  title: "Aprendizaje",
  description:
    "Prácticas para el Casio CT-X800: lecciones Step Up, banco de 160 canciones, acordes e importación de archivos MIDI.",
  alternates: { canonical: "/aprender" },
  openGraph: {
    title: "Aprender con el Casio CT-X800",
    description:
      "Tutoriales con dificultad y XP para tocar las canciones del banco y cargar MIDI.",
    url: "/aprender",
  },
};

export default function AprenderPage() {
  const items = getLearning();

  return (
    <>
      <PageIntro
        kicker="Aprendizaje"
        title="Aprende con el teclado"
        lede="Una ruta corta: primero las lecciones del banco, después una frase propia y al final la carga de canciones MIDI. Cada práctica suma XP."
      />
      <Catalog items={items} basePath="/aprender" variant="learning" />
    </>
  );
}
