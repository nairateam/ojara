import type { Metadata } from 'next';
import {
  ContactDesks,
  ContactHelpCentre,
  ContactHero,
  ContactOfficeAndHours,
  isSupportOnline,
} from '@/components/marketing/contact/contact-sections';

export const metadata: Metadata = { title: 'Contact' };

/**
 * 14 Contact. The design's "Send us a message" form is left out until there is somewhere to send
 * it; the contact channels take its place in the hero. The closing CTA and footer come from the
 * (site) layout.
 */
export default function ContactPage() {
  const online = isSupportOnline();
  return (
    <>
      <ContactHero online={online} />
      <ContactDesks />
      <ContactOfficeAndHours online={online} />
      <ContactHelpCentre />
    </>
  );
}
