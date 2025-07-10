
import { DynamicHero } from "@/components/landing/DynamicHero";
import { ServiceCategories } from "@/components/landing/ServiceCategories";
import { CallToAction } from "@/components/landing/CallToAction";
import { FeaturedConsultants } from "@/components/landing/FeaturedConsultants";
import { InteractiveStats } from "@/components/landing/InteractiveStats";
import { InteractiveNavigation } from "@/components/landing/InteractiveNavigation";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { BlogSection } from "@/components/landing/BlogSection";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <InteractiveNavigation />
      <DynamicHero />
      <InteractiveStats />
      <ServiceCategories />
      <FeaturedConsultants />
      <BlogSection />
      <CallToAction />
      <ScrollToTop />
    </div>
  );
};

export default Index;
