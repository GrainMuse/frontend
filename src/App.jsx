import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import PageLayout from "./components/layout/PageLayout";
import PageTransition from "./components/ui/PageTransition";
import PageLoader from "./components/ui/PageLoader";

import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

export default function App() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return <Admin />;
  }

  return (
    <>
      <PageLoader />
      <PageLayout>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition variant="slideUp">
                  <Home />
                </PageTransition>
              }
            />
            <Route
              path="/products"
              element={
                <PageTransition variant="slideUp">
                  <Products />
                </PageTransition>
              }
            />
            <Route
              path="/about"
              element={
                <PageTransition variant="slideUp">
                  <About />
                </PageTransition>
              }
            />
            <Route
              path="/team"
              element={
                <PageTransition variant="slideUp">
                  <Team />
                </PageTransition>
              }
            />
            <Route
              path="/contact"
              element={
                <PageTransition variant="slideUp">
                  <Contact />
                </PageTransition>
              }
            />
            <Route
              path="*"
              element={
                <PageTransition variant="slideUp">
                  <NotFound />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </PageLayout>
    </>
  );
}
