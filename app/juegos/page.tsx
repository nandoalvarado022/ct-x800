import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import { StaffQuiz } from "@/components/StaffQuiz/StaffQuiz";

export const metadata: Metadata = {
  title: "Juegos",
  description:
    "Mini juego para leer las posiciones de Do, Re, Mi, Fa, Sol, La y Si en el pentagrama del Casio CT-X800.",
  alternates: { canonical: "/juegos" },
  openGraph: {
    title: "Mini juegos para el Casio CT-X800",
    description: "Una ronda corta: mira la nota en el pentagrama y elige cuál de las tres es.",
    url: "/juegos",
  },
};

export default function JuegosPage() {
  return (
    <>
      <PageIntro
        kicker="Mini juegos"
        title="¿Dónde está la nota?"
        lede="Cinco preguntas en clave de sol. Mira la figura en el pentagrama y elige el nombre entre tres. El puntaje es solo de esta ronda."
      />
      <StaffQuiz />
    </>
  );
}
