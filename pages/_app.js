import "@/styles/globals.css";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchPalette from "@/components/SearchPalette";
import { ThemeProvider } from "@/lib/theme";
import { Source_Serif_4, JetBrains_Mono } from "next/font/google";

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-source-serif",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <div className={`${sourceSerif.variable} ${jetBrainsMono.variable} font-root`}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon_aa.png" />
        </Head>
        <Header />
        <Component {...pageProps} />
        <Footer />
        <SearchPalette />
      </div>
    </ThemeProvider>
  );
}
