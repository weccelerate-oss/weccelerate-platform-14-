import HeroLanding from './sections/HeroLanding';
import MultiSelectForm from './sections/MultiSelectForm';
import ValueProps from './sections/ValueProps';
import HowItWorks from './sections/HowItWorks';
import Testimonials from './sections/Testimonials';
import FAQLanding from './sections/FAQLanding';
import FinalCTA from './sections/FinalCTA';

export default function LandingPage() {
  return (
    <main id="main-content" className="relative">
      <HeroLanding />
      <MultiSelectForm />
      <ValueProps />
      <HowItWorks />
      <Testimonials />
      <FAQLanding />
      <FinalCTA />
    </main>
  );
}
