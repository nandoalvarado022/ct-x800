import type { Metadata } from "next";
import Link from "next/link";
import { ChatPanel } from "@/components/ChatPanel/ChatPanel";
import { PageIntro } from "@/components/PageIntro/PageIntro";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Pregúntale al experto",
  description:
    "Consulta dudas concretas del Casio CT-X800: pedal, lecciones Step Up, ritmos, USB-MIDI y carga de archivos SMF.",
  alternates: { canonical: "/experto" },
  openGraph: {
    title: "Experto del Casio CT-X800",
    description: "Un chat enfocado en la configuración y el estudio del CT-X800.",
    url: "/experto",
  },
};

const topics = [
  { href: "/documentacion/configurar-pedal-sustain", label: "Asignar el pedal" },
  { href: "/aprender/lecciones-step-up", label: "Lecciones Step Up" },
  { href: "/aprender/importar-cancion-midi", label: "Importar un MIDI" },
  { href: "/documentacion/conexion-usb-midi", label: "Conectar un DAW" },
];

export default function ExpertoPage() {
  return (
    <>
      <PageIntro
        kicker="Consulta"
        title="Pregúntale al experto"
        lede="El chat responde solo sobre el CT-X800: procedimientos del pedal, el banco de canciones, el grabador y los archivos MIDI. Si un detalle no está en la ficha, te lo dice."
      />
      <div className={styles.layout}>
        <aside className={styles.aside}>
          <h2>Antes de preguntar</h2>
          <p>
            Las fichas ya resuelven el caso general. El experto sirve cuando tu duda mezcla dos ajustes, por ejemplo un pedal en sostenuto dentro de una lección, o un SMF que no entra en los 320 KB.
          </p>
          <ul>
            {topics.map((topic) => (
              <li key={topic.href}>
                <Link href={topic.href}>{topic.label}</Link>
              </li>
            ))}
          </ul>
        </aside>
        <ChatPanel />
      </div>
    </>
  );
}
