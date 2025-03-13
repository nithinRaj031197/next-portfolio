"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SocialLinks from "@/components/SocialLinks";

export default function Home() {
  return (
    <>
      <Header showLogo={true} />
      <section className="z-50">
        <Hero />
      </section>
      <SocialLinks />
    </>
  );
}
