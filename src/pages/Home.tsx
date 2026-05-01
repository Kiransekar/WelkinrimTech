import HeroSection from "@/components/HeroSection";
import FamiliesSection from "@/components/FamiliesSection";
import EngineeringDepth from "@/components/EngineeringDepth";
import MotorArchitecture from "@/components/MotorArchitecture";
import LocationMap from "@/components/LocationMap";
import ContactSection from "@/components/ContactSection";
import InvestorsSection from "@/components/InvestorsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FamiliesSection />
      <EngineeringDepth />
      <MotorArchitecture />
      <LocationMap />
      <ContactSection />
      <InvestorsSection />
      <Footer />
    </main>
  );
}
