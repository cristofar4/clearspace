import { BookingSection } from "@/components/booking/BookingSection";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Hero } from "@/components/hero/Hero";
import { ArtDefs } from "@/components/illustration/ArtDefs";
import { SiteNav } from "@/components/nav/SiteNav";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { ServicesSection } from "@/components/services/ServicesSection";
import { ShowcaseSection } from "@/components/showcase/ShowcaseSection";
import { StandardSection } from "@/components/standard/StandardSection";
import { VisitsSection } from "@/components/visits/VisitsSection";

export default function Home() {
  return (
    <SiteProvider>
      <ArtDefs />
      <SiteNav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <ServicesSection />
        <ShowcaseSection />
        <StandardSection />
        <VisitsSection />
        <BookingSection />
      </main>
      <SiteFooter />
    </SiteProvider>
  );
}
