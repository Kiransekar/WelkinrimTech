import HeroSection from "@/components/HeroSection";
import EngineeringDepth from "@/components/EngineeringDepth";
import LocationMap from "@/components/LocationMap";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <EngineeringDepth />
      <LocationMap />
      <ContactSection />
      <Footer />
    </main>
  );
}
