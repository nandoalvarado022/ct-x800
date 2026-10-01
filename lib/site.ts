export const siteName = "Fuente CT-X800";

export const siteDescription =
  "Referencia para configurar, calentar y aprender con el teclado Casio CT-X800: pedal, lecciones Step Up, banco de canciones y archivos MIDI.";

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return value || "http://localhost:3000";
}
