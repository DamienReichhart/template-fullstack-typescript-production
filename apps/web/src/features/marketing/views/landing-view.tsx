import { FeatureGrid } from '../components/feature-grid';
import { Hero } from '../components/hero';
import { LandingJsonLd } from '../components/landing-json-ld';

export function LandingView() {
  return (
    <>
      <LandingJsonLd />
      <Hero />
      <FeatureGrid />
    </>
  );
}
