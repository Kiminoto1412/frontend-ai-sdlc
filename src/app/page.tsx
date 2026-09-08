import Header from "@/components/Header";
import HeroBanners from "@/components/HeroBanners";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedBrands from "@/components/FeaturedBrands";
import TopSaver from "@/components/TopSaver";
import BestSeller from "@/components/BestSeller";
import JustLanding from "@/components/JustLanding";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <Header />
      <HeroBanners />
      <CategoryGrid />
      <FeaturedBrands />
      <TopSaver />
      <BestSeller />
      <JustLanding />
    </div>
  );
}
