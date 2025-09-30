import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AudioPreview from "@/components/AudioPreview";
import { SuccessStories } from "@/components/SuccessStories";
import { MasteringChatbot } from "@/components/MasteringChatbot";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Services />
      <AudioPreview />
      <section className="py-20 bg-muted/30">
        <div className="container px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Try Our Instant Mastering Polish</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload any track and hear what pro mastering can do - get instant feedback and an A/B comparison 
              with that radio-ready polish. Totally free!
            </p>
          </div>
          <MasteringChatbot />
        </div>
      </section>
      <SuccessStories />
      <Pricing />
      <Contact />
      <footer className="border-t border-border py-8 bg-card">
        <div className="container px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 MixClubOnline. Make your music sound as good as the pros.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
