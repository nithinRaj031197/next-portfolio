import About from "@/components/About";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import SocialLinks from "@/components/SocialLinks";
import "@/styles/main.css";

export default function Home() {
  return (
    <>
      <Header showLogo={true} />
      <main style={{ paddingTop: "7rem" }}>
        <section id="home" className="z-50">
          <Hero />
        </section>

        <section id="about" className="z-50 py-40">
          <About />
        </section>

        <section id="experience" className="z-50 py-20">
          <Experience />
        </section>

        <section id="projects" className="z-50 py-20">
          <Projects />
        </section>

        <section id="contact" className="py-20">
          <Contact />
        </section>
      </main>
      <section className="hidden sm:flex">
        <SocialLinks />
      </section>
    </>
  );
}
