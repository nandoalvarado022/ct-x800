import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog/Catalog";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import { getDocumentation } from "@/lib/content";

export const metadata: Metadata = {
  title: "Documentación",
  description:
    "Configuración técnica del Casio CT-X800: pedal, tacto, split, layer, registros, metrónomo, USB-MIDI y memoria USB.",
  alternates: { canonical: "/documentacion" },
  openGraph: {
    title: "Documentación del Casio CT-X800",
    description:
      "Fichas para configurar el pedal, los sonidos, el MIDI y la memoria USB del CT-X800.",
    url: "/documentacion",
  },
};

export default function DocumentacionPage() {
  const items = getDocumentation();

  return (
    <>
      <PageIntro
        kicker="Configuración"
        title="Documentación del CT-X800"
        lede="El manual de uso en fichas cortas. Busca por el nombre del ajuste, por lo que quieres lograr o por una etiqueta."
      />
      <Catalog items={items} basePath="/documentacion" variant="documentation" />
    </>
  );
}
