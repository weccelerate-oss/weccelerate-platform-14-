import HeroBiz from './sections/HeroBiz';
import TrustBar from './sections/TrustBar';
import ProblemCards from './sections/ProblemCards';
import SolutionTimeline from './sections/SolutionTimeline';
import EnterpriseSpotlight from './sections/EnterpriseSpotlight';
import ValueGrid from './sections/ValueGrid';
import CaseStudies from './sections/CaseStudies';
import FAQBiz from './sections/FAQBiz';
import CTAFormBiz from './sections/CTAFormBiz';

export default function BizLandingPage() {
  return (
    <main id="main-content" className="relative">
      <HeroBiz />
      <TrustBar />
      <ProblemCards />
      <SolutionTimeline />
      <EnterpriseSpotlight />
      <ValueGrid />
      <CaseStudies />
      <FAQBiz />
      <CTAFormBiz />
    </main>
  );
}
