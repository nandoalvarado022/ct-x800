import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { IBM_Plex_Mono, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { ProgressProvider } from "@/components/ProgressProvider/ProgressProvider";
import { getSiteUrl, siteDescription, siteName } from "@/lib/site";
import styles from "./globals.module.scss";
import layout from "./layout.module.scss";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "Casio CT-X800",
    "pedal de sustain",
    "lecciones Step Up",
    "MIDI",
    "banco de canciones",
    "configuración teclado",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeScript = `try{var stored=localStorage.getItem("ctx800-theme");var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",theme);}catch(e){document.documentElement.setAttribute("data-theme","dark");}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} ${styles.theme}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ProgressProvider>
          <a className={layout.skip} href="#contenido">
            Saltar al contenido
          </a>
          <SiteHeader />
          <main id="contenido" className={layout.main}>
            {children}
          </main>
          <SiteFooter />
        </ProgressProvider>
        <Analytics />
      </body>
    </html>
  );
}
