import type { Metadata } from 'next';
import {
  AboutHero,
  AboutPrinciples,
  AboutStats,
  AboutStory,
  AboutTeam,
} from '@/components/marketing/about/about-sections';

export const metadata: Metadata = { title: 'About Ojara' };

/**
 * 11 About. The design's Careers section is left out: there are no open roles or an application
 * flow yet. The closing CTA and footer come from the (site) layout.
 */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutStats />
      <AboutPrinciples />
      <AboutTeam />
    </>
  );
}
