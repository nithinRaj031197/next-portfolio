import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header showLogo={true} />
      <section className="min-h-screen bg-[#0b192e] text-white flex items-center justify-center">
        <h1>Welcome to My Portfolio</h1>
      </section>
    </>
  );
}
