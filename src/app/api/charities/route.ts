import { type NextRequest } from 'next/server';
import { db } from '@/db';
import { charities } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get('country')?.toUpperCase();

  if (!country) {
    return Response.json({ error: 'country query param is required' }, { status: 400 });
  }

  // Fetch all charities from DB
  const allCharities = db.select().from(charities).all();

  // Filter charities where display_countries JSON includes the country code
  const filtered = allCharities.filter((c) => {
    if (!c.display_countries) return false;
    try {
      const countries: string[] = JSON.parse(c.display_countries);
      return countries.includes(country);
    } catch {
      return false;
    }
  });

  // Separate into local and international
  const local = filtered
    .filter((c) => c.country_code === country)
    .map(formatCharity);

  const international = filtered
    .filter((c) => c.country_code === 'INT')
    .map(formatCharity);

  return Response.json({ local, international });
}

function formatCharity(c: {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  country_code: string | null;
  brand_color: string | null;
}) {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    category: c.category,
    icon: c.icon,
    countryCode: c.country_code,
    brandColor: c.brand_color,
  };
}
