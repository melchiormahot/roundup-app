import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { StickyNav } from '@/components/landing/StickyNav';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LiveDemo } from '@/components/landing/LiveDemo';
import { TaxCalculator } from '@/components/landing/TaxCalculator';
import { CharityShowcase } from '@/components/landing/CharityShowcase';
import { Comparison } from '@/components/landing/Comparison';
import { Numbers } from '@/components/landing/Numbers';
import { SocialProof } from '@/components/landing/SocialProof';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

export default async function Home() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  if (session.isLoggedIn) {
    redirect('/dashboard');
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'RoundUp',
    description:
      'Round up your everyday purchases and donate the spare change to curated charities. Track your impact and save on taxes.',
    url: 'https://roundup.app',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '12400',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Landing page responsive styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }

            /* Desktop nav visible, mobile hidden */
            .landing-nav-desktop { display: flex !important; }
            .landing-nav-mobile-btn { display: none !important; }

            /* Hero 2-col grid */
            .landing-hero-grid {
              grid-template-columns: 1fr 1fr;
            }
            .landing-hero-phone { display: flex !important; }

            /* Steps 3-col */
            .landing-steps-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            /* Tax results 3-col */
            .landing-tax-results {
              grid-template-columns: repeat(3, 1fr);
            }

            /* Charity 3x2 grid */
            .landing-charity-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            /* Comparison 2-col */
            .landing-comparison-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            /* Numbers 3-col */
            .landing-numbers-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            /* Testimonials 3-col */
            .landing-testimonials-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            /* Counters 3-col */
            .landing-counters-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            /* Footer 4-col */
            .landing-footer-grid {
              grid-template-columns: 1.5fr 1fr 1fr 1fr;
            }

            /* CTA form row */
            .landing-cta-form {
              flex-direction: row;
            }

            /* Tablet: 768px */
            @media (max-width: 1024px) {
              .landing-hero-grid {
                grid-template-columns: 1fr;
                text-align: center;
              }
              .landing-hero-grid > div:first-child {
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .landing-charity-grid {
                grid-template-columns: repeat(2, 1fr);
              }
              .landing-footer-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }

            /* Mobile: 640px */
            @media (max-width: 640px) {
              .landing-nav-desktop { display: none !important; }
              .landing-nav-mobile-btn { display: flex !important; }

              .landing-hero-phone { display: none !important; }

              .landing-steps-grid {
                grid-template-columns: 1fr;
              }
              .landing-tax-results {
                grid-template-columns: 1fr;
              }
              .landing-charity-grid {
                grid-template-columns: 1fr;
              }
              .landing-comparison-grid {
                grid-template-columns: 1fr;
              }
              .landing-numbers-grid {
                grid-template-columns: 1fr;
              }
              .landing-testimonials-grid {
                grid-template-columns: 1fr;
              }
              .landing-counters-grid {
                grid-template-columns: 1fr;
              }
              .landing-footer-grid {
                grid-template-columns: 1fr;
              }
              .landing-cta-form {
                flex-direction: column;
              }
            }
          `,
        }}
      />

      <StickyNav />
      <main>
        <Hero />
        <HowItWorks />
        <LiveDemo />
        <TaxCalculator />
        <CharityShowcase />
        <Comparison />
        <Numbers />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
