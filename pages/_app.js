import "@/styles/globals.css";
import "@/styles/stats.css";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/lib/theme";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon_aa.png" />
      </Head>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </ThemeProvider>
  );
}
