import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SplashScreen from "../components/SplashScreen";
import "../styles/globals.css";

const SPLASH_MIN_DURATION = 4000; // minimum splash screen display time in ms

export default function App({ Component, pageProps }: AppProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_MIN_DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
