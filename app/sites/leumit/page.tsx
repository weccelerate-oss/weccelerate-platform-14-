import HeroLeumit from './sections/HeroLeumit';
import StatsBar from './sections/StatsBar';
import BioScanShowcase from './sections/BioScanShowcase';
import TracksGrid from './sections/TracksGrid';
import AdvisoryBoard from './sections/AdvisoryBoard';
import FAQLeumit from './sections/FAQLeumit';
import CTAForm from './sections/CTAForm';

export default function LeumitLandingPage() {
  return (
    <main id="main-content" className="relative">
      <HeroLeumit />
      <StatsBar />
      <BioScanShowcase />
      <TracksGrid />
      <AdvisoryBoard />
      <FAQLeumit />
      <CTAForm />
    </main>
  );
}
