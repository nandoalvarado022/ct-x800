import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { IBM_Plex_Mono, Outfit } from "next/font/google";
import { LocaleProvider } from "@/components/LocaleProvider/LocaleProvider";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { ProgressProvider } from "@/components/ProgressProvider/ProgressProvider";
import { getLocale } from "@/lib/get-locale";
import { messages } from "@/lib/messages";
import { getSiteUrl } from "@/lib/site";
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const meta = messages[locale].meta;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: meta.siteName,
      template: `%s · ${meta.siteName}`,
    },
    description: meta.description,
    applicationName: meta.siteName,
    keywords: [...meta.keywords],
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      siteName: meta.siteName,
      title: meta.siteName,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.siteName,
      description: meta.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const themeScript = `try{var stored=localStorage.getItem("ctx800-theme");var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",theme);}catch(e){document.documentElement.setAttribute("data-theme","dark");}`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const copy = messages[locale];

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} ${styles.theme}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {/* Adsense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4730353912478910"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <LocaleProvider locale={locale}>
          <ProgressProvider>
            <a className={layout.skip} href="#contenido">
              {copy.skip}
            </a>
            <SiteHeader />
            <main id="contenido" className={layout.main}>
              {children}
            </main>
            <SiteFooter />
          </ProgressProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
