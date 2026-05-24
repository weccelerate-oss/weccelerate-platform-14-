import HeroLeumit from './sections/HeroLeumit';
import ScrollVideoStory from './sections/ScrollVideoStory';
import StatsBar from './sections/StatsBar';
import BioScanShowcase from './sections/BioScanShowcase';
import TracksGrid from './sections/TracksGrid';
import MissionMoment from './sections/MissionMoment';
import AdvisoryBoard from './sections/AdvisoryBoard';
import FAQLeumit from './sections/FAQLeumit';
import CTAForm from './sections/CTAForm';

export default function LeumitLandingPage() {
  return (
    <main id="main-content" className="relative">
      <HeroLeumit />
      <ScrollVideoStory />
      <StatsBar />
      <BioScanShowcase />
      <TracksGrid />
      <MissionMoment />
      <AdvisoryBoard />
      <FAQLeumit />
      <CTAForm />
    </main>
  );
}
