import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/data/site";
import { EngraveDefs } from "@/components/product-art";
import { LocaleProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import { dictionaries } from "@/i18n/dictionaries";
import "./globals.css";

// Cyrillic for the Bulgarian site, latin-ext for the dotted İ in the wordmark
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

// Monospace only for lot numbers, sizes and other label data
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { title, description } = dictionaries[locale].meta;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url),
    title: { default: title, template: `%s · ${site.brand}` },
    description,
    openGraph: {
      type: "website",
      siteName: site.brand,
      locale: locale === "bg" ? "bg_BG" : "en_GB",
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#131209" },
  ],
  colorScheme: "light dark",
};

// Runs before paint: applies the saved theme, or the system one, with no flash
const themeScript = `(function(){var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)"),s=null;try{s=localStorage.getItem("theme")}catch(e){}d.dataset.theme=s||(m.matches?"dark":"light");if(!s)m.addEventListener("change",function(e){try{if(localStorage.getItem("theme"))return}catch(x){}d.dataset.theme=e.matches?"dark":"light"})})()`;

// Runs before paint: hides the intro loader after the first visit of the session
const introScript = `(function(){try{if(sessionStorage.getItem("kokolina-intro"))document.documentElement.dataset.intro="seen"}catch(e){}})()`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <noscript>
          <style>{"#loading-screen{display:none}"}</style>
        </noscript>
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <a
          href="#main"
          className="button-sm sr-only z-[300] rounded-sm bg-ink-deep px-3 py-2 text-cotton focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {dictionaries[locale].meta.skip}
        </a>
        <EngraveDefs />
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
