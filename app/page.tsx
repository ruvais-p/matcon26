import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import Countdown from "@/components/Countdown/Countdown";
import Speakers from "@/components/Speakers/Speakers";
import Footer from "@/components/Footer/Footer";
import MatrixRain from "@/components/MatrixRain";


export default function Home() {
  return (
    <>
      {/* Fixed Matrix rain behind all page content */}
      <MatrixRain />

      {/* Page content stacked above */}
      <main style={{ position: "relative", zIndex: 1 }} className="flex min-h-screen flex-col">
        <Hero />
        <About />
        <Countdown />
        <Speakers />
      </main>
    </>
  );
}
