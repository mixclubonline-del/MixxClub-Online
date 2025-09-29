import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AudioPreview from "@/components/AudioPreview";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Services />
      <AudioPreview />
      <Pricing />
      <Contact />
      <footer className="border-t border-border py-8 bg-card">
        <div className="container px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 MixClubOnline. Transform your tracks into modern hits.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
