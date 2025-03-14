import Experience from "@/components/Experience";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import "@/styles/main.css";

export default function Home() {
  return (
    <>
      <Header showLogo={true} />
      <main style={{ paddingTop: "7rem" }}>
        <section className="z-50">
          <Hero />
        </section>
        <section id="experience" className="z-50">
          <Experience />
        </section>

        <section id="projects" className="z-50">
          <Projects />
        </section>
      </main>
    </>
  );
}
