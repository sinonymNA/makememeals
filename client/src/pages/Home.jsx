import Header from '../components/home/Header.jsx';
import Hero from '../components/home/Hero.jsx';
import BundleSection from '../components/home/BundleSection.jsx';
import LovedTools from '../components/home/LovedTools.jsx';
import RecipesSection from '../components/home/RecipesSection.jsx';
import ProblemSection from '../components/home/ProblemSection.jsx';
import DealBanner from '../components/home/DealBanner.jsx';
import PlannerSection from '../components/home/PlannerSection.jsx';
import EmailCapture from '../components/home/EmailCapture.jsx';
import Footer from '../components/home/Footer.jsx';

export default function Home() {
  return (
    <div className="mmm-home">
      <Header />
      <Hero />
      <BundleSection />
      <LovedTools />
      <RecipesSection />
      <ProblemSection />
      <DealBanner />
      <PlannerSection />
      <EmailCapture />
      <Footer />
    </div>
  );
}
