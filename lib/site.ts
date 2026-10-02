export const siteName = "Fuente CT-X800";

export const siteDescription =
  "A reference for setting up, warming up, and learning on the Casio CT-X800: pedal, Step Up lessons, song bank, and MIDI files.";

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return value || "http://localhost:3000";
}
