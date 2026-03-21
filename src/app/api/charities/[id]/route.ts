import { type NextRequest } from 'next/server';
import { db } from '@/db';
import { charities } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const charity = db.select().from(charities).where(eq(charities.id, id)).get();

  if (!charity) {
    return Response.json({ error: 'Charity not found' }, { status: 404 });
  }

  // Parse JSON fields safely
  function parseJson<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  return Response.json({
    id: charity.id,
    name: charity.name,
    description: charity.description,
    category: charity.category,
    icon: charity.icon,
    countryCode: charity.country_code,
    displayCountries: parseJson<string[]>(charity.display_countries, []),
    qualityLabel: charity.quality_label,
    taxRate: charity.tax_rate,
    loiColucheEligible: charity.loi_coluche_eligible === 1,
    mission: charity.mission,
    foundingStory: charity.founding_story,
    impact: parseJson<string[]>(charity.impact, []),
    howYourMoneyHelps: parseJson<{ amount: number; description: string }[]>(
      charity.how_your_money_helps,
      [],
    ),
    financialTransparency: parseJson<{
      programs_pct: number;
      admin_pct: number;
      fundraising_pct: number;
    }>(charity.financial_transparency, {
      programs_pct: 0,
      admin_pct: 0,
      fundraising_pct: 0,
    }),
    certifications: parseJson<{ name: string; year: number }[]>(
      charity.certifications,
      [],
    ),
    milestones: parseJson<{
      year: number;
      title: string;
      description: string;
    }[]>(charity.milestones, []),
    jurisdictionsEligible: parseJson<string[]>(
      charity.jurisdictions_eligible,
      [],
    ),
    crossBorderMethod: charity.cross_border_method,
    story: charity.story,
    websiteUrl: charity.website_url,
    foundedYear: charity.founded_year,
    currency: charity.currency,
    brandColor: charity.brand_color,
  });
}
