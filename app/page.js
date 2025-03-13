"use client";

import Experience from "@/components/Experience";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SocialLinks from "@/components/SocialLinks";

export default function Home() {
  return (
    <>
      <Header showLogo={true} />
      <main style={{ paddingTop: "7rem" }} className="pt-[80px]">
        <section className="z-50">
          <Hero />
        </section>
        <section id="experience" className="z-50">
          <Experience />
        </section>
      </main>
      <SocialLinks />
    </>
  );
}
