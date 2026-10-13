import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { ArchitectureNotes } from "@/components/sections/ArchitectureNotes";
import { Skills } from "@/components/sections/Skills";
import { Contact } from "@/components/sections/Contact";
import { EnhancementBoundary } from "@/components/layout/EnhancementBoundary";
import { MotionController } from "@/components/layout/MotionController";
import { SceneRoot } from "@/components/three/SceneRoot";
import { personJsonLd } from "@/lib/structured-data";

export default function Home() {
  return (
    <>
      {/* Enhancements: decoration over a complete HTML page, each isolated so a failure cannot take the page with it. */}
      <SceneRoot />
      <EnhancementBoundary>
        <MotionController />
      </EnhancementBoundary>
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <ArchitectureNotes />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
    </>
  );
}
