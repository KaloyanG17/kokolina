import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/data/site";
import { BagProvider } from "@/components/bag-provider";
import { BagDrawer } from "@/components/bag-drawer";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { EngraveDefs } from "@/components/product-art";
import { LoadingScreen } from "@/components/stitch-loader";
import { ScrollRail } from "@/components/scroll-rail";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

// Monospace only for lot numbers, sizes and other label data
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = `${site.brand}, selvedge denim cut and stitched in small runs`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.brand}` },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.brand,
    title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#131209" },
  ],
  colorScheme: "light dark",
};

// Runs before paint: applies the saved theme, or the system one, with no flash
const themeScript = `(function(){var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)"),s=null;try{s=localStorage.getItem("theme")}catch(e){}d.dataset.theme=s||(m.matches?"dark":"light");if(!s)m.addEventListener("change",function(e){try{if(localStorage.getItem("theme"))return}catch(x){}d.dataset.theme=e.matches?"dark":"light"})})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>{"#loading-screen{display:none}"}</style>
        </noscript>
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <a
          href="#main"
          className="button-sm sr-only z-[300] rounded-sm bg-ink-deep px-3 py-2 text-cotton focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <EngraveDefs />
        <LoadingScreen />
        <BagProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <BagDrawer />
        </BagProvider>
        <ScrollRail />
      </body>
    </html>
  );
}
