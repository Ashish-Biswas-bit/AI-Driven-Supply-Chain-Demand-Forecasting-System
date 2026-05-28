import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { AuthProvider } from "../hooks/useAuth";
import Layout from "../components/Layout";
import SplashScreen from "../components/SplashScreen";
import "../styles/globals.css";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

const SPLASH_MIN_DURATION = 4000;

// Public routes that don't need the sidebar layout
const publicRoutes = ["/", "/login", "/signup", "/subscribe"];

function AppContent({ Component, pageProps }: { Component: AppProps["Component"]; pageProps: AppProps["pageProps"] }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_MIN_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const isPublic = publicRoutes.includes(router.pathname);

  // Show splash only on first visit and for protected routes
  if (showSplash && !isPublic) {
    return <SplashScreen />;
  }

  // For public routes (landing, login, signup), render without Layout
  if (isPublic) {
    return <Component {...pageProps} />;
  }

  // For protected routes, wrap with Layout
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}
