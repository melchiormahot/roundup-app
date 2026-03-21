import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { nanoid } from "nanoid";
import path from "path";

const dbPath = path.join(process.cwd(), "roundup.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

// Run migrations
migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

// Seed charities
const charityData = [
  {
    id: nanoid(),
    name: "Médecins Sans Frontières",
    description: "Providing medical aid where it is needed most, regardless of borders.",
    category: "health",
    icon: "🏥",
    qualityLabel: "Don en Confiance",
    taxRate: 75,
    mission: "MSF delivers emergency medical care to people affected by conflict, epidemics, disasters, or exclusion from healthcare. Operating in over 70 countries, they provide surgeries, vaccinations, mental health support, and nutrition programmes.",
    impact: JSON.stringify([
      "Treated 2.1 million malaria cases in 2024",
      "Performed 118,000 surgeries worldwide",
      "Vaccinated 3.4 million people against measles"
    ]),
    crisisEligible: true,
  },
  {
    id: nanoid(),
    name: "WWF France",
    description: "Protecting the world's most vulnerable species and habitats.",
    category: "environment",
    icon: "🐼",
    qualityLabel: "Don en Confiance",
    taxRate: 66,
    mission: "WWF France works to conserve biodiversity, reduce humanity's ecological footprint, and build a future where people and nature thrive. They protect forests, oceans, and endangered species across French territories and globally.",
    impact: JSON.stringify([
      "Protected 1.2 million hectares of marine habitat",
      "Restored 340 km of river ecosystems in France",
      "Planted 500,000 trees in degraded forests"
    ]),
    crisisEligible: false,
  },
  {
    id: nanoid(),
    name: "Ligue contre le cancer",
    description: "Fighting cancer through research, prevention, and patient support.",
    category: "health",
    icon: "🎗️",
    qualityLabel: "Don en Confiance",
    taxRate: 66,
    mission: "The Ligue funds cancer research, provides support to patients and families, and leads prevention campaigns. As France's largest independent cancer charity, they fund over 500 research projects annually.",
    impact: JSON.stringify([
      "Funded 532 research projects in 2024",
      "Supported 680,000 patients and families",
      "Trained 12,000 volunteers across France"
    ]),
    crisisEligible: false,
  },
  {
    id: nanoid(),
    name: "Restos du Cœur",
    description: "Providing meals and support to those in need across France.",
    category: "humanitarian",
    icon: "❤️",
    qualityLabel: "Don en Confiance",
    taxRate: 75,
    mission: "Founded by Coluche in 1985, Les Restos du Cœur distributes meals, provides shelter, and offers social integration support. They serve over a million people each winter through 2,000+ centres nationwide.",
    impact: JSON.stringify([
      "Distributed 142 million meals in 2024",
      "Helped 1.2 million people through winter",
      "Operated 2,100 distribution centres"
    ]),
    crisisEligible: true,
  },
  {
    id: nanoid(),
    name: "Amnesty International",
    description: "Defending human rights and fighting injustice worldwide.",
    category: "rights",
    icon: "✊",
    qualityLabel: null,
    taxRate: 66,
    mission: "Amnesty International investigates and exposes human rights abuses, campaigns for change, and supports people at risk. Their researchers and activists work in over 150 countries to protect fundamental freedoms.",
    impact: JSON.stringify([
      "Secured release of 98 prisoners of conscience",
      "Published 340 investigative reports",
      "Mobilised 10 million supporters globally"
    ]),
    crisisEligible: false,
  },
  {
    id: nanoid(),
    name: "Secours Populaire",
    description: "Combating poverty and exclusion through solidarity.",
    category: "humanitarian",
    icon: "🤝",
    qualityLabel: "Don en Confiance",
    taxRate: 75,
    mission: "Secours Populaire fights poverty in France and internationally through food aid, housing support, access to healthcare, culture, and holidays. Their network of 80,000 volunteers reaches 3 million people.",
    impact: JSON.stringify([
      "Assisted 3.3 million people in France",
      "Provided holidays for 65,000 children",
      "Distributed emergency aid in 48 countries"
    ]),
    crisisEligible: true,
  },
];

db.insert(schema.charities).values(charityData).run();

// Seed jurisdiction tax rules
db.insert(schema.jurisdictionTaxRules).values({
  id: nanoid(),
  countryCode: "FR",
  standardRate: 66,
  enhancedRate: 75,
  enhancedCeiling: 2000,
  incomeCapPct: 20,
  receiptFormat: "cerfa_11580",
}).run();

// Seed sample notifications (will be linked to user during signup)
console.log("✅ Database seeded successfully");
console.log(`  ${charityData.length} charities`);
console.log("  1 jurisdiction (France)");

sqlite.close();
