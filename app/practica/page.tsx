import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import { PracticeBoard } from "@/components/PracticeBoard/PracticeBoard";
import { getPractice } from "@/lib/content";

export const metadata: Metadata = {
  title: "Práctica",
  description:
    "Calentamiento corto para el Casio CT-X800: soltar las manos y caminar cinco notas antes de abrir una canción.",
  alternates: { canonical: "/practica" },
  openGraph: {
    title: "Calentamiento para el Casio CT-X800",
    description:
      "Dos estaciones breves, con pasos e XP, para entrar en calor antes de tocar.",
    url: "/practica",
  },
};

export default function PracticaPage() {
  const exercises = getPractice();

  return (
    <>
      <PageIntro
        kicker="Calentamiento"
        title="Antes de tocar, entra en calor"
        lede="Una ronda corta: primero el cuerpo y los dedos, después cinco notas de ida y vuelta. Cuando las estaciones queden listas, recién ahí abre una canción."
      />
      <PracticeBoard exercises={exercises} />
    </>
  );
}
