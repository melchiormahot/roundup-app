import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import path from 'path';
import * as schema from './schema';

const ALL_COUNTRIES = ['FR', 'GB', 'DE', 'ES', 'BE'];

// ─── Seed function ───────────────────────────────────────────────────────────

export async function seed() {
  const dbPath = path.join(process.cwd(), 'roundup.db');
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });

  console.log('Seeding database...');

  // ── Create tables ──────────────────────────────────────────────────────────

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      jurisdiction TEXT DEFAULT 'FR',
      income_bracket INTEGER DEFAULT 0,
      debit_frequency TEXT DEFAULT 'weekly',
      onboarding_completed INTEGER DEFAULT 0,
      onboarding_step_reached INTEGER DEFAULT 0,
      referral_code TEXT UNIQUE,
      is_admin INTEGER DEFAULT 0,
      user_level INTEGER DEFAULT 1,
      level_unlocked_at TEXT,
      theme_preference TEXT DEFAULT 'dark',
      haptic_enabled INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS charities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      icon TEXT,
      country_code TEXT,
      display_countries TEXT,
      quality_label TEXT,
      tax_rate INTEGER,
      loi_coluche_eligible INTEGER DEFAULT 0,
      mission TEXT,
      founding_story TEXT,
      impact TEXT,
      how_your_money_helps TEXT,
      financial_transparency TEXT,
      certifications TEXT,
      milestones TEXT,
      jurisdictions_eligible TEXT,
      cross_border_method TEXT,
      story TEXT,
      website_url TEXT,
      founded_year INTEGER,
      currency TEXT DEFAULT 'EUR',
      brand_color TEXT
    );

    CREATE TABLE IF NOT EXISTS user_charities (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      charity_id TEXT REFERENCES charities(id),
      allocation_pct INTEGER
    );

    CREATE TABLE IF NOT EXISTS roundups (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      amount REAL,
      merchant_name TEXT,
      category TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS debits (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      total_amount REAL,
      period_start TEXT,
      period_end TEXT,
      roundup_count INTEGER,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS allocations (
      id TEXT PRIMARY KEY,
      debit_id TEXT REFERENCES debits(id),
      charity_id TEXT REFERENCES charities(id),
      amount REAL,
      tax_rate INTEGER
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      type TEXT,
      title TEXT,
      body TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS jurisdiction_tax_rules (
      id TEXT PRIMARY KEY,
      country_code TEXT,
      standard_rate INTEGER,
      enhanced_rate INTEGER,
      enhanced_ceiling REAL,
      income_cap_pct INTEGER,
      carry_forward_years INTEGER,
      receipt_format TEXT,
      currency TEXT,
      currency_symbol TEXT
    );

    CREATE TABLE IF NOT EXISTS early_access (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      country TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS simulation_state (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      current_date TEXT,
      day_count INTEGER DEFAULT 0,
      notification_style TEXT DEFAULT 'warm'
    );
  `);

  // ── Clear existing data ────────────────────────────────────────────────────

  sqlite.exec(`
    DELETE FROM allocations;
    DELETE FROM debits;
    DELETE FROM roundups;
    DELETE FROM user_charities;
    DELETE FROM notifications;
    DELETE FROM simulation_state;
    DELETE FROM early_access;
    DELETE FROM jurisdiction_tax_rules;
    DELETE FROM charities;
    DELETE FROM users;
  `);

  // ── Password hash ─────────────────────────────────────────────────────────

  const hash = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  // ── Users ──────────────────────────────────────────────────────────────────

  db.insert(schema.users).values([
    {
      id: nanoid(),
      email: 'demo@roundup.app',
      password_hash: hash,
      name: 'Demo User',
      jurisdiction: 'FR',
      income_bracket: 1,
      debit_frequency: 'weekly',
      onboarding_completed: 1,
      onboarding_step_reached: 4,
      referral_code: 'DEMO2026',
      is_admin: 1,
      user_level: 2,
      level_unlocked_at: JSON.stringify({ '1': now, '2': now }),
      theme_preference: 'dark',
      haptic_enabled: 1,
      created_at: now,
    },
    {
      id: nanoid(),
      email: 'admin@roundup.app',
      password_hash: hash,
      name: 'Admin',
      jurisdiction: 'FR',
      income_bracket: 2,
      debit_frequency: 'weekly',
      onboarding_completed: 1,
      onboarding_step_reached: 4,
      referral_code: 'ADMIN2026',
      is_admin: 1,
      user_level: 4,
      level_unlocked_at: JSON.stringify({ '1': now, '2': now, '3': now, '4': now }),
      theme_preference: 'dark',
      haptic_enabled: 1,
      created_at: now,
    },
  ]).run();

  console.log('Users seeded.');

  // ── Tax Rules ──────────────────────────────────────────────────────────────

  db.insert(schema.jurisdiction_tax_rules).values([
    {
      id: nanoid(),
      country_code: 'FR',
      standard_rate: 66,
      enhanced_rate: 75,
      enhanced_ceiling: 2000,
      income_cap_pct: 20,
      carry_forward_years: 0,
      receipt_format: 'Cerfa 11580',
      currency: 'EUR',
      currency_symbol: '€',
    },
    {
      id: nanoid(),
      country_code: 'GB',
      standard_rate: 25,
      enhanced_rate: 45,
      enhanced_ceiling: 0,
      income_cap_pct: 0,
      carry_forward_years: 0,
      receipt_format: 'Gift Aid Declaration',
      currency: 'GBP',
      currency_symbol: '£',
    },
    {
      id: nanoid(),
      country_code: 'DE',
      standard_rate: 30,
      enhanced_rate: 45,
      enhanced_ceiling: 0,
      income_cap_pct: 20,
      carry_forward_years: 0,
      receipt_format: 'Zuwendungsbestätigung',
      currency: 'EUR',
      currency_symbol: '€',
    },
    {
      id: nanoid(),
      country_code: 'ES',
      standard_rate: 80,
      enhanced_rate: 40,
      enhanced_ceiling: 0,
      income_cap_pct: 10,
      carry_forward_years: 0,
      receipt_format: 'Certificado de Donación',
      currency: 'EUR',
      currency_symbol: '€',
    },
    {
      id: nanoid(),
      country_code: 'BE',
      standard_rate: 30,
      enhanced_rate: 30,
      enhanced_ceiling: 397850,
      income_cap_pct: 10,
      carry_forward_years: 0,
      receipt_format: 'Attestation fiscale',
      currency: 'EUR',
      currency_symbol: '€',
    },
  ]).run();

  console.log('Tax rules seeded.');

  // ── Charities ──────────────────────────────────────────────────────────────

  const charityData = getAllCharities();
  db.insert(schema.charities).values(charityData).run();

  console.log(`${charityData.length} charities seeded.`);
  console.log('Database seeded successfully!');

  sqlite.close();
}

// ─── Charity data ────────────────────────────────────────────────────────────

function getAllCharities() {
  return [
    // ═══════════════════════════════════════════════════════════════════════
    // INTERNATIONAL (5) - display in ALL countries
    // ═══════════════════════════════════════════════════════════════════════

    {
      id: nanoid(),
      name: 'Red Cross / Red Crescent',
      description: 'The world\'s largest humanitarian network, providing emergency relief and long-term support in 192 countries.',
      category: 'Humanitarian',
      icon: '🔴',
      country_code: 'INT',
      display_countries: JSON.stringify(ALL_COUNTRIES),
      quality_label: 'Don en Confiance',
      tax_rate: 75,
      loi_coluche_eligible: 1,
      mission: 'Born on a battlefield in 1859, the Red Cross and Red Crescent movement exists to prevent and alleviate human suffering wherever it is found. With volunteers in nearly every country on earth, it is a quiet promise that when disaster strikes, someone will come. Its seven fundamental principles -- humanity, impartiality, neutrality, independence, voluntary service, unity, and universality -- are not just words on a wall but the daily compass for millions of volunteers who show up when the world turns upside down.',
      founding_story: 'In June 1859, Swiss businessman Henry Dunant stumbled upon the aftermath of the Battle of Solferino in northern Italy, where 40,000 soldiers lay wounded and dying with no medical care. Horrified, he organized local villagers to tend to the injured regardless of which side they fought for. His account of that day, published as "A Memory of Solferino" in 1862, sparked the creation of the International Committee of the Red Cross and the first Geneva Convention. Dunant went on to win the very first Nobel Peace Prize in 1901, having transformed a moment of private anguish into the world\'s most enduring humanitarian institution.',
      impact: JSON.stringify([
        'Assisted 107 million people across armed conflicts and natural disasters in 2024',
        'Facilitated 15.8 million family reconnections through Restoring Family Links since 2020',
        'Trained 26 million people in first aid worldwide in 2023 alone',
        'Distributed 4.2 billion litres of clean water to disaster-affected communities in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides a hygiene kit with soap, toothbrush, and sanitary items for a displaced family of four' },
        { amount: 20, description: 'Funds a full day of emergency medical care at a field hospital in a conflict zone' },
        { amount: 50, description: 'Supplies clean drinking water for an entire village of 200 people for one week' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 89, admin_pct: 5, fundraising_pct: 6 }),
      certifications: JSON.stringify([
        { name: 'Don en Confiance', year: 1989 },
        { name: 'Geneva Convention Mandate', year: 1949 },
        { name: 'Nobel Peace Prize', year: 1901 }
      ]),
      milestones: JSON.stringify([
        { year: 1863, title: 'Founded in Geneva', description: 'Henry Dunant and four colleagues established the International Committee of the Red Cross' },
        { year: 1901, title: 'First Nobel Peace Prize', description: 'Henry Dunant shared the inaugural Nobel Peace Prize for founding the movement' },
        { year: 1949, title: 'Geneva Conventions adopted', description: 'The four Geneva Conventions established the legal framework for humanitarian law worldwide' },
        { year: 1997, title: 'Landmine treaty', description: 'ICRC advocacy helped secure the Ottawa Treaty banning anti-personnel mines, signed by 122 nations' },
        { year: 2020, title: 'COVID-19 global response', description: 'Deployed emergency health teams to 140 countries during the pandemic, reaching 800 million people' }
      ]),
      jurisdictions_eligible: JSON.stringify(ALL_COUNTRIES),
      cross_border_method: 'national_entity',
      story: 'When the earthquake struck southern Turkey at 4:17 a.m., Fatima Yilmaz was trapped under the rubble of her apartment building with her two young daughters. A Red Cross emergency response team reached her neighbourhood within 14 hours, locating the family through thermal imaging. All three were pulled out alive and treated at a field hospital set up in a school gymnasium -- Fatima later said the first thing she saw when the dust cleared was the red crescent on the medic\'s vest.',
      website_url: 'https://www.icrc.org',
      founded_year: 1863,
      currency: 'EUR',
      brand_color: '#FF0000',
    },

    {
      id: nanoid(),
      name: 'UNICEF',
      description: 'The United Nations agency dedicated to protecting children\'s rights, health, nutrition, and education in 190 countries.',
      category: 'Children',
      icon: '🧒',
      country_code: 'INT',
      display_countries: JSON.stringify(ALL_COUNTRIES),
      quality_label: 'Don en Confiance',
      tax_rate: 75,
      loi_coluche_eligible: 1,
      mission: 'UNICEF works in the world\'s toughest places to reach the most disadvantaged children and adolescents, and to protect the rights of every child, everywhere. Across more than 190 countries and territories, it does whatever it takes -- from vaccinating children in war zones to getting girls into school in remote villages -- to give every child a fair chance in life. It is one of the only organizations with the reach, the mandate, and the stubborn optimism to believe that no child should be left behind.',
      founding_story: 'In December 1946, the United Nations General Assembly created UNICEF as an emergency fund to feed and vaccinate children in post-war Europe. Its first executive director, Maurice Pate, was an American relief worker who had seen children starving in Poland during World War I and vowed it would not happen again. What was meant to be a temporary agency proved so essential that the UN made it permanent in 1953. Pate worked until the day before he died in 1965, having expanded UNICEF\'s reach from European rubble to every developing nation on earth.',
      impact: JSON.stringify([
        'Vaccinated 48% of the world\'s children under five, reaching nearly 2 billion doses delivered in 2024',
        'Provided safe drinking water to 43 million people in humanitarian emergencies in 2023',
        'Helped 12 million children access formal or informal education in crisis-affected countries in 2024',
        'Treated 6.7 million children for severe acute malnutrition with ready-to-use therapeutic food in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Vaccinates 7 children against polio, protecting an entire classroom for life' },
        { amount: 20, description: 'Provides a month of therapeutic food packets to save a severely malnourished toddler' },
        { amount: 50, description: 'Equips a "school in a box" kit serving 40 children in a conflict zone with basic learning materials' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 87, admin_pct: 5, fundraising_pct: 8 }),
      certifications: JSON.stringify([
        { name: 'Don en Confiance', year: 2001 },
        { name: 'UN Agency Mandate', year: 1946 },
        { name: 'Nobel Peace Prize', year: 1965 }
      ]),
      milestones: JSON.stringify([
        { year: 1946, title: 'Founded by the United Nations', description: 'Created as an emergency fund to help children in post-war Europe' },
        { year: 1965, title: 'Nobel Peace Prize', description: 'Awarded the Nobel Peace Prize for its work promoting brotherhood among nations through child welfare' },
        { year: 1989, title: 'Convention on the Rights of the Child', description: 'Instrumental in drafting the most widely ratified human rights treaty in history' },
        { year: 2000, title: 'Global polio eradication push', description: 'Helped reduce polio cases by 99% from 350,000 annual cases to near-zero through mass vaccination' },
        { year: 2021, title: 'COVAX vaccine equity', description: 'Co-led the delivery of 1 billion COVID-19 vaccine doses to lower-income countries' }
      ]),
      jurisdictions_eligible: JSON.stringify(ALL_COUNTRIES),
      cross_border_method: 'national_entity',
      story: 'In a village outside Bamako, Mali, a three-year-old boy named Moussa was brought to a UNICEF-supported nutrition centre barely conscious, weighing less than he had at birth. Over eight weeks of therapeutic feeding with Plumpy\'Nut sachets, community health visits, and his grandmother\'s fierce determination, Moussa gained four kilograms and started laughing again. His community health worker, Aminata, still checks on him every Tuesday, and Moussa now runs to greet her at the gate.',
      website_url: 'https://www.unicef.org',
      founded_year: 1946,
      currency: 'EUR',
      brand_color: '#00AEEF',
    },

    {
      id: nanoid(),
      name: 'MSF (Doctors Without Borders)',
      description: 'An independent medical humanitarian organization delivering emergency medical care in conflict zones, epidemics, and natural disasters.',
      category: 'Humanitarian',
      icon: '🏥',
      country_code: 'INT',
      display_countries: JSON.stringify(ALL_COUNTRIES),
      quality_label: 'Don en Confiance',
      tax_rate: 75,
      loi_coluche_eligible: 1,
      mission: 'Medecins Sans Frontieres exists for a single, stubborn reason: no one should die of a treatable disease simply because they were born in the wrong place or caught in someone else\'s war. Founded by doctors and journalists who believed that medical care should cross every border, MSF sends surgical teams into active conflict zones, sets up cholera treatment centres in the middle of epidemics, and speaks out publicly when governments and armies target hospitals or block aid. It answers to patients, not politics.',
      founding_story: 'In 1968, a group of young French doctors volunteered with the Red Cross in Biafra during the Nigerian civil war. They watched children starve while the international community stayed silent, bound by rules of neutrality that felt more like complicity. Frustrated and angry, Bernard Kouchner and twelve colleagues founded MSF in 1971 with a radical idea: that doctors had not only the right but the obligation to cross borders uninvited and to speak out about the suffering they witnessed. It was medicine as an act of defiance, and it changed humanitarian aid forever.',
      impact: JSON.stringify([
        'Conducted 12.6 million outpatient consultations across 72 countries in 2024',
        'Delivered 368,000 babies safely in MSF facilities in 2023, many in areas with no other healthcare',
        'Treated 2.9 million malaria cases, the world\'s largest non-governmental malaria response, in 2023',
        'Performed 118,000 surgical interventions including war-wound surgery in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides a full course of antibiotics to treat a child with pneumonia in a rural clinic' },
        { amount: 20, description: 'Funds a safe delivery assisted by a trained midwife in a conflict-zone maternity ward' },
        { amount: 50, description: 'Covers one emergency surgery in a field hospital, including anaesthesia and post-op care' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 86, admin_pct: 5, fundraising_pct: 9 }),
      certifications: JSON.stringify([
        { name: 'Don en Confiance', year: 1992 },
        { name: 'Nobel Peace Prize', year: 1999 },
        { name: 'UN ECOSOC Consultative Status', year: 1991 }
      ]),
      milestones: JSON.stringify([
        { year: 1971, title: 'Founded in Paris', description: 'Thirteen French doctors and journalists created MSF with the principle that medical aid transcends borders' },
        { year: 1999, title: 'Nobel Peace Prize', description: 'Awarded the Nobel Peace Prize for pioneering humanitarian work across several continents' },
        { year: 2014, title: 'Ebola frontline response', description: 'Treated more Ebola patients than any other organization during the West Africa outbreak' },
        { year: 2015, title: 'Kunduz hospital attack', description: 'After a US airstrike destroyed its Afghan hospital, MSF led global advocacy for protection of medical facilities' },
        { year: 2023, title: 'Sudan and Gaza emergencies', description: 'Scaled operations in Sudan and Gaza, maintaining medical care under extreme bombardment' }
      ]),
      jurisdictions_eligible: JSON.stringify(ALL_COUNTRIES),
      cross_border_method: 'national_entity',
      story: 'When the fighting intensified in Khartoum in May 2023, MSF nurse Halima kept the paediatric ward running for 72 hours straight, carrying infants to a basement shelter during airstrikes. One of those babies, a premature girl named Amal, weighed barely a kilogram and needed oxygen that was running dangerously low. Halima rigged a makeshift CPAP device from spare tubing until a resupply convoy arrived; Amal is now a healthy toddler, and Halima still carries her photo in her scrubs pocket.',
      website_url: 'https://www.msf.org',
      founded_year: 1971,
      currency: 'EUR',
      brand_color: '#000000',
    },

    {
      id: nanoid(),
      name: 'WWF',
      description: 'The world\'s leading conservation organization, working to protect wildlife, forests, oceans, and the climate across 100 countries.',
      category: 'Environment',
      icon: '🐼',
      country_code: 'INT',
      display_countries: JSON.stringify(ALL_COUNTRIES),
      quality_label: 'Don en Confiance',
      tax_rate: 66,
      loi_coluche_eligible: 0,
      mission: 'The World Wildlife Fund works to conserve nature and reduce the most pressing threats to the diversity of life on Earth. From protecting tiger habitats in India to restoring coral reefs in the Pacific, WWF combines on-the-ground conservation with global policy advocacy. Its panda logo is recognized in every country on earth, but behind that gentle symbol is a fierce determination to halt biodiversity loss, fight climate change, and ensure that nature can sustain both wildlife and the human communities that depend on it.',
      founding_story: 'In 1961, a group of concerned scientists and conservationists gathered in Morges, Switzerland, alarmed by the destruction of African wildlife habitats. Among them was Sir Peter Scott, the British naturalist and painter, who sketched the now-famous panda logo on a napkin during lunch. The original idea was simple: create an international fund that could raise money anywhere and spend it where nature needed it most. Scott\'s panda, inspired by Chi Chi at the London Zoo, became the most recognized conservation symbol in history, and what started as a fundraising vehicle grew into the world\'s largest environmental organization.',
      impact: JSON.stringify([
        'Helped protect over 1.5 billion hectares of land and ocean ecosystems since founding',
        'Contributed to a 40% increase in wild tiger numbers from 3,200 to 4,500 between 2010 and 2024',
        'Removed 12,000 tonnes of ghost fishing nets from oceans through the Global Ghost Gear Initiative in 2023',
        'Supported 120 million hectares of sustainably managed forests through FSC certification by 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Plants 10 native trees in a deforested mangrove zone, creating nursery habitat for fish and shrimp' },
        { amount: 20, description: 'Funds a week of anti-poaching patrols protecting rhinos and elephants in a 500-hectare wildlife corridor' },
        { amount: 50, description: 'Installs a camera trap system in a tiger habitat, tracking population recovery across a national park' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 82, admin_pct: 8, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'Don en Confiance', year: 2006 },
        { name: 'IUCN Partner', year: 1961 },
        { name: 'Charity Navigator 4-Star', year: 2022 }
      ]),
      milestones: JSON.stringify([
        { year: 1961, title: 'Founded in Morges, Switzerland', description: 'Established by Sir Peter Scott and colleagues to raise international funds for conservation' },
        { year: 1973, title: 'CITES treaty', description: 'Helped negotiate the Convention on International Trade in Endangered Species, protecting thousands of animals and plants' },
        { year: 1998, title: 'Living Planet Report launched', description: 'Published the first global index of biodiversity, now the world\'s leading measure of nature\'s health' },
        { year: 2010, title: 'TX2 tiger initiative', description: 'Launched the global goal to double wild tiger numbers by 2022, rallying 13 tiger-range governments' },
        { year: 2022, title: 'Kunming-Montreal Framework', description: 'Played a central role in securing the landmark 30x30 agreement to protect 30% of land and sea by 2030' }
      ]),
      jurisdictions_eligible: JSON.stringify(ALL_COUNTRIES),
      cross_border_method: 'national_entity',
      story: 'In Borneo\'s Kinabatangan floodplain, a young orangutan named Puan was found clinging to a single tree in a sea of palm oil plantation, her forest home cleared overnight. WWF field workers rescued her and spent 18 months rehabilitating her at a sanctuary before releasing her into a newly protected corridor linking two forest fragments. Puan was spotted last year with a baby of her own, nesting high in the canopy of the corridor that would not exist without the land-swap negotiations WWF brokered with local plantation owners.',
      website_url: 'https://www.worldwildlife.org',
      founded_year: 1961,
      currency: 'EUR',
      brand_color: '#000000',
    },

    {
      id: nanoid(),
      name: 'Amnesty International',
      description: 'A global movement of over 10 million people campaigning for human rights, justice, and dignity in every country.',
      category: 'Human Rights',
      icon: '🕯️',
      country_code: 'INT',
      display_countries: JSON.stringify(ALL_COUNTRIES),
      quality_label: null,
      tax_rate: 66,
      loi_coluche_eligible: 0,
      mission: 'Amnesty International investigates and exposes human rights abuses, pressures governments and corporations to respect international law, and mobilizes millions of ordinary people to demand justice. From prisoners of conscience rotting in solitary confinement to communities poisoned by industrial pollution, Amnesty shines a light on what power would prefer to keep in the dark. It is independent of any government, political ideology, or economic interest, funded almost entirely by individual donations because that independence is exactly what makes its voice credible.',
      founding_story: 'In November 1960, British lawyer Peter Benenson read a newspaper article about two Portuguese students sentenced to seven years in prison for raising a toast to freedom. Outraged, he wrote an article in The Observer newspaper on 28 May 1961 titled "The Forgotten Prisoners," calling on readers to write letters demanding their release. The response was overwhelming: within a year, volunteer letter-writing groups had formed in a dozen countries, and Amnesty International was born. Benenson\'s original insight -- that a flood of polite, persistent letters from strangers could embarrass a dictator into opening a cell door -- turned out to be one of the most powerful ideas in human rights history.',
      impact: JSON.stringify([
        'Helped secure the release or improved conditions of over 60,000 prisoners of conscience since 1961',
        'Published 320 investigative reports documenting abuses in 155 countries in 2024',
        'Mobilized 8.2 million urgent action letters and digital campaigns leading to 84 documented case victories in 2023',
        'Contributed legal research to 23 landmark international court rulings on human rights in 2023-2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds the translation and distribution of one urgent action case alert to volunteer networks in 30 countries' },
        { amount: 20, description: 'Supports a week of on-the-ground research by a human rights investigator documenting abuses' },
        { amount: 50, description: 'Finances a legal brief submitted to an international court on behalf of wrongfully imprisoned individuals' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 80, admin_pct: 9, fundraising_pct: 11 }),
      certifications: JSON.stringify([
        { name: 'Nobel Peace Prize', year: 1977 },
        { name: 'UN ECOSOC Consultative Status', year: 1964 },
        { name: 'Charity Commission (UK) Registered', year: 1961 }
      ]),
      milestones: JSON.stringify([
        { year: 1961, title: '"The Forgotten Prisoners"', description: 'Peter Benenson\'s Observer article launched the global letter-writing movement for political prisoners' },
        { year: 1977, title: 'Nobel Peace Prize', description: 'Awarded the Nobel Peace Prize for contributing to securing human rights and freedoms globally' },
        { year: 1998, title: 'Rome Statute for ICC', description: 'Amnesty\'s advocacy was instrumental in establishing the International Criminal Court' },
        { year: 2011, title: 'Arab Spring documentation', description: 'Provided real-time human rights monitoring during the revolutions across the Middle East and North Africa' },
        { year: 2024, title: 'AI and human rights framework', description: 'Published the first comprehensive framework for protecting human rights in the age of artificial intelligence' }
      ]),
      jurisdictions_eligible: JSON.stringify(ALL_COUNTRIES),
      cross_border_method: 'national_entity',
      story: 'When journalist and blogger Narges Mohammadi was sentenced to 16 years in prison in Iran for her human rights activism, Amnesty launched a global letter-writing campaign that generated 2.4 million messages to Iranian authorities. While Narges remained imprisoned, the international pressure ensured she received medical care she had been denied for months. In October 2023, she was awarded the Nobel Peace Prize while still behind bars, and read her acceptance speech through her children, telling the world that every letter had been a candle in the darkness of solitary confinement.',
      website_url: 'https://www.amnesty.org',
      founded_year: 1961,
      currency: 'EUR',
      brand_color: '#FFCD00',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FRANCE (7)
    // ═══════════════════════════════════════════════════════════════════════

    {
      id: nanoid(),
      name: 'Ligue contre le cancer',
      description: 'France\'s leading independent cancer research and patient support organization, funding research and accompanying patients since 1918.',
      category: 'Health',
      icon: '🎗️',
      country_code: 'FR',
      display_countries: JSON.stringify(['FR']),
      quality_label: 'Don en Confiance',
      tax_rate: 66,
      loi_coluche_eligible: 0,
      mission: 'The Ligue contre le cancer is France\'s oldest and most trusted cancer charity, funding cutting-edge research while ensuring that no patient faces the disease alone. With 103 departmental committees across mainland France and overseas territories, it combines the reach of a national institution with the warmth of a neighbour who drives you to chemo. It funds one in three cancer research grants in France, operates free helplines, and runs holiday camps for children whose parents are in treatment -- because cancer doesn\'t just attack cells, it upends entire families.',
      founding_story: 'In 1918, as World War I was ending, radiologist Justin Godart witnessed soldiers returning from the trenches with cancers caused by chemical exposure, only to find there was virtually no research or support infrastructure for them. Godart, who was also a senator, founded the Ligue as a citizens\' movement to fund cancer research outside the slow machinery of government. He believed that ordinary people pooling small donations could move faster than bureaucracies, and he was right. Over a century later, the Ligue remains independent of pharmaceutical companies and government funding, one of the few cancer organizations in Europe that can say that honestly.',
      impact: JSON.stringify([
        'Funded 643 cancer research projects totalling 52 million euros in 2024',
        'Supported 1.2 million patients and families through free accompaniment services in 2023',
        'Operated 362 Espace Ligue centres offering free psychological support and information across France',
        'Sent 4,200 children affected by parental cancer to free holiday camps in summer 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds one hour of free psychological support for a cancer patient at an Espace Ligue centre' },
        { amount: 20, description: 'Contributes to a day of laboratory research on immunotherapy treatments for childhood leukaemia' },
        { amount: 50, description: 'Sends a child whose parent is undergoing chemotherapy to a one-week free holiday camp' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 79, admin_pct: 8, fundraising_pct: 13 }),
      certifications: JSON.stringify([
        { name: 'Don en Confiance', year: 2001 },
        { name: 'Reconnue d\'utilité publique', year: 1920 },
        { name: 'Comité de la charte', year: 2001 }
      ]),
      milestones: JSON.stringify([
        { year: 1918, title: 'Founded by Justin Godart', description: 'Created as a citizens\' movement to fund cancer research independently of government and industry' },
        { year: 1950, title: 'First research grants', description: 'Established the national cancer research grant programme that now funds one in three French cancer studies' },
        { year: 1998, title: 'Espace Ligue network', description: 'Opened the first free patient support centres, now numbering 362 across all departments' },
        { year: 2010, title: 'Children\'s camps programme', description: 'Launched the Vacances pour les Enfants initiative for children of cancer patients' },
        { year: 2024, title: 'Record research funding', description: 'Committed a record 52 million euros to cancer research in a single year' }
      ]),
      jurisdictions_eligible: JSON.stringify(['FR']),
      cross_border_method: 'none',
      story: 'Marie-Claire, a single mother of two from Rennes, was diagnosed with breast cancer at 38 and terrified not of the treatment but of her children seeing her afraid. The Ligue\'s local committee arranged weekly art therapy sessions for her eight-year-old son, Lucas, who started drawing pictures of "Maman\'s invisible shield" to help her through chemo. When Marie-Claire rang the bell after her last treatment, Lucas presented her with a bound book of 24 drawings -- one for each week -- that she now keeps on her bedside table.',
      website_url: 'https://www.ligue-cancer.net',
      founded_year: 1918,
      currency: 'EUR',
      brand_color: '#E30613',
    },

    {
      id: nanoid(),
      name: 'France Nature Environnement',
      description: 'France\'s oldest and largest environmental federation, uniting 6,200 local associations defending nature and biodiversity across every region.',
      category: 'Environment',
      icon: '🌿',
      country_code: 'FR',
      display_countries: JSON.stringify(['FR']),
      quality_label: null,
      tax_rate: 66,
      loi_coluche_eligible: 0,
      mission: 'France Nature Environnement is the quiet backbone of French environmentalism -- a federation of 6,200 associations whose volunteers monitor rivers, challenge polluters in court, and plant hedgerows in industrial farmland. Unlike flashier environmental groups, FNE works through patient legal action, citizen science, and local activism. Its members are the retired teachers counting bird species in their commune, the farmers transitioning to organic, and the lawyers filing suit against companies that dump chemicals into rivers. It is environmentalism as civic duty, rooted in the French republican tradition that citizens have not just the right but the responsibility to defend their shared natural heritage.',
      founding_story: 'In 1968, as student protests rocked Paris, a quieter revolution was happening in the French countryside. Fishermen on the Loire, hikers in the Alps, and birdwatchers in the Camargue realized they were all fighting the same battle against pollution and habitat destruction, but doing it alone. They came together to form the Fédération Française des Sociétés de Protection de la Nature, which became France Nature Environnement. The founding meeting happened in a village hall in Burgundy with 40 people and a pot of coffee; today FNE represents 900,000 members and is the most frequent environmental plaintiff in French courts.',
      impact: JSON.stringify([
        'Won 247 environmental court cases protecting rivers, wetlands, and endangered species in 2022-2024',
        'Mobilized 85,000 citizen scientists monitoring water quality across 3,400 river sites in 2024',
        'Planted 1.2 million native hedgerows restoring biodiversity corridors in agricultural landscapes since 2020',
        'Blocked 18 major industrial projects threatening protected habitats through legal action in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Equips a citizen scientist volunteer with a water testing kit to monitor their local river for a full season' },
        { amount: 20, description: 'Funds legal research for one day toward a court case to protect a threatened wetland from development' },
        { amount: 50, description: 'Plants 100 native hedgerow saplings creating a biodiversity corridor between two forest fragments' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 84, admin_pct: 8, fundraising_pct: 8 }),
      certifications: JSON.stringify([
        { name: 'Reconnue d\'utilité publique', year: 1976 },
        { name: 'Agrément national protection de l\'environnement', year: 1978 },
        { name: 'European Environmental Bureau member', year: 1990 }
      ]),
      milestones: JSON.stringify([
        { year: 1968, title: 'Federation founded in Burgundy', description: 'Forty local associations united to create a national voice for environmental protection' },
        { year: 1976, title: 'Recognised as public utility', description: 'Granted official recognition as a public interest organization by the French state' },
        { year: 2001, title: 'Environmental charter advocacy', description: 'Contributed to enshrining environmental rights in the French Constitution via the Charte de l\'environnement' },
        { year: 2016, title: 'Citizen science programme', description: 'Launched the national Sentinelles de la Nature platform for citizen-reported environmental damage' },
        { year: 2024, title: 'Record legal victories', description: 'Won more environmental court cases in a single year than any previous period in the federation\'s history' }
      ]),
      jurisdictions_eligible: JSON.stringify(['FR']),
      cross_border_method: 'none',
      story: 'When the textile factory upstream from Saint-Julien-de-Concelles began illegally dumping dye chemicals into the Loire, retired schoolteacher Gérard Morin spent six months documenting the discolouration with water samples and photographs through FNE\'s Sentinelles de la Nature network. His evidence formed the core of a successful prosecution that resulted in the factory paying 340,000 euros in damages and installing proper treatment systems. The river section is now home to otters again for the first time in twenty years, and Gérard still walks the bank every Sunday morning with his sample kit, just in case.',
      website_url: 'https://fne.asso.fr',
      founded_year: 1968,
      currency: 'EUR',
      brand_color: '#8CC63F',
    },

    {
      id: nanoid(),
      name: 'Les Restos du Coeur',
      description: 'Founded by comedian Coluche, providing free meals, shelter, and social support to people in poverty across France.',
      category: 'Humanitarian',
      icon: '🍲',
      country_code: 'FR',
      display_countries: JSON.stringify(['FR']),
      quality_label: 'Don en Confiance',
      tax_rate: 75,
      loi_coluche_eligible: 1,
      mission: 'Les Restos du Coeur is France\'s most beloved charity, born from the irreverent genius of Coluche and powered by the quiet determination of 73,000 volunteers who serve hot meals to anyone who needs one, no questions asked. What started as a winter food distribution has grown into a year-round network offering baby supplies, job training, literacy classes, legal aid, and even micro-gardens for families in tower blocks. The Restos are proof that generosity scales: four decades later, the volunteers still cook with the same stubborn warmth, and the queues, sadly, are still there.',
      founding_story: 'On 26 September 1985, comedian Coluche went on Europe 1 radio and said, in his trademark growl: "I have a little idea -- when there are surplus food stocks and people who are hungry, we should be able to arrange something." Within weeks, donations poured in, and the first Restos du Coeur opened in December 1985. Coluche personally served meals that winter, cracking jokes while ladling soup. He died in a motorcycle accident in June 1986, just months after the first season ended, but his "little idea" had already taken root. The tax provision allowing 75% deductions for food-aid charities in France is named after him: the Loi Coluche.',
      impact: JSON.stringify([
        'Distributed 171 million meals and food packages to 1.2 million people during the 2023-2024 winter campaign',
        'Provided 3,400 emergency shelter places nightly across 16 centres in winter 2024',
        'Offered 42,000 people access to job training, literacy, and digital skills programmes in 2023',
        'Distributed baby supplies (nappies, formula, clothing) to 78,000 infants through Restos Bébés in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides four balanced meals to a person in need, including fresh vegetables, protein, and fruit' },
        { amount: 20, description: 'Funds a full week of baby supplies -- nappies, formula, and clothing -- for an infant through Restos Bébés' },
        { amount: 50, description: 'Covers one month of French literacy classes for an adult migrant learning to read and find work' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 91, admin_pct: 4, fundraising_pct: 5 }),
      certifications: JSON.stringify([
        { name: 'Don en Confiance', year: 1989 },
        { name: 'Reconnue d\'utilité publique', year: 1992 },
        { name: 'Loi Coluche eligible', year: 2005 }
      ]),
      milestones: JSON.stringify([
        { year: 1985, title: 'Coluche\'s radio appeal', description: 'A single radio appearance by comedian Coluche launched France\'s largest food aid organization' },
        { year: 1986, title: 'Enfoirés benefit concert', description: 'The first celebrity benefit concert raised funds and awareness, becoming an annual French cultural event' },
        { year: 2005, title: 'Loi Coluche enacted', description: 'French law granted the 75% enhanced tax deduction for donations to food-aid organizations, named in his honour' },
        { year: 2020, title: 'COVID emergency response', description: 'Adapted overnight to contactless distribution, serving 30% more meals during lockdowns' },
        { year: 2024, title: 'Record distribution year', description: 'Distributed 171 million meals, the highest in the organization\'s history, reflecting rising food insecurity' }
      ]),
      jurisdictions_eligible: JSON.stringify(['FR']),
      cross_border_method: 'none',
      story: 'Leïla arrived at the Restos du Coeur centre in Marseille with her two children on a cold January evening, having just fled a violent relationship with nothing but the clothes they were wearing. The volunteers gave them hot soup and blankets that first night, but what changed Leïla\'s life was the six-month job training programme she joined in March, learning commercial accounting. She now works as a bookkeeper at a small shipping company and volunteers at the same Restos centre every Saturday, serving soup to people who remind her of the person she was a year ago.',
      website_url: 'https://www.restosducoeur.org',
      founded_year: 1985,
      currency: 'EUR',
      brand_color: '#E2001A',
    },

    {
      id: nanoid(),
      name: 'Apprentis d\'Auteuil',
      description: 'A Catholic foundation helping vulnerable young people through education, vocational training, and family support across France.',
      category: 'Children',
      icon: '📚',
      country_code: 'FR',
      display_countries: JSON.stringify(['FR']),
      quality_label: 'Don en Confiance',
      tax_rate: 66,
      loi_coluche_eligible: 0,
      mission: 'Apprentis d\'Auteuil takes in the young people France has given up on -- the school dropouts, the kids in foster care who aged out of the system, the unaccompanied minors who arrived with nothing -- and gives them a trade, a roof, and someone who believes in them. Founded in 1866, it runs 230 establishments across France offering everything from bakery apprenticeships to horticulture diplomas, combined with counselling, housing, and the patient insistence that every young person, no matter how rough their start, can build a life worth living.',
      founding_story: 'In 1866, Abbé Louis Roussel was walking through the streets of Auteuil, then a village on the outskirts of Paris, when he encountered a group of orphaned boys sleeping under a bridge. He took six of them into his presbytery that night, fed them, and began teaching them to read. Word spread, and soon he was housing dozens of boys, funding their care by selling vegetables they grew in the garden. Roussel\'s simple formula -- a safe place, an education, and useful work -- proved timeless. Over 158 years later, Apprentis d\'Auteuil has helped more than a million young people, and the gardens at the original Auteuil site are still tended by students learning horticulture.',
      impact: JSON.stringify([
        'Accompanied 40,000 young people and 8,000 families through educational and social programmes in 2024',
        'Achieved a 78% employment or continued education rate among vocational training graduates in 2023',
        'Operated 230 establishments including schools, training centres, and family support homes across France',
        'Housed and educated 3,200 unaccompanied minor refugees in specialized centres in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides school supplies for one week to a young person who arrived at the centre with nothing' },
        { amount: 20, description: 'Funds a practical workshop day in bakery, carpentry, or horticulture for a vocational student' },
        { amount: 50, description: 'Covers one week of housing, meals, and mentorship for an unaccompanied minor refugee' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 83, admin_pct: 7, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'Don en Confiance', year: 1996 },
        { name: 'Reconnue d\'utilité publique', year: 1929 },
        { name: 'IDEAS Label', year: 2018 }
      ]),
      milestones: JSON.stringify([
        { year: 1866, title: 'Abbé Roussel takes in six orphans', description: 'A parish priest in Auteuil began housing and educating orphaned boys, founding the institution' },
        { year: 1929, title: 'Recognised as public utility', description: 'The French state formally recognized the foundation\'s public interest mission' },
        { year: 1975, title: 'Girls and vocational training', description: 'Opened programmes to young women and expanded from general education to vocational trades' },
        { year: 2015, title: 'Refugee youth programmes', description: 'Launched dedicated centres for unaccompanied minors arriving in France from conflict zones' },
        { year: 2023, title: 'Digital skills initiative', description: 'Added coding, digital marketing, and tech repair to the vocational curriculum across 40 centres' }
      ]),
      jurisdictions_eligible: JSON.stringify(['FR']),
      cross_border_method: 'none',
      story: 'Mamadou arrived at the Apprentis d\'Auteuil centre in Lyon at 16, having travelled alone from Guinea after both parents died in a mining accident. He spoke no French and had never attended school. A patient educator named Véronique spent two years teaching him to read, discovering along the way that he had a gift for precision work with his hands. Mamadou completed a watchmaking apprenticeship, graduated top of his class, and now works at a jeweller\'s workshop in the Presqu\'île, where his colleagues say his hands are the steadiest they\'ve ever seen.',
      website_url: 'https://www.apprentis-auteuil.org',
      founded_year: 1866,
      currency: 'EUR',
      brand_color: '#00A19A',
    },

    {
      id: nanoid(),
      name: 'Ligue des droits de l\'Homme',
      description: 'France\'s oldest human rights organization, defending civil liberties, equality, and justice since the Dreyfus Affair.',
      category: 'Human Rights',
      icon: '⚖️',
      country_code: 'FR',
      display_countries: JSON.stringify(['FR']),
      quality_label: null,
      tax_rate: 66,
      loi_coluche_eligible: 0,
      mission: 'The Ligue des droits de l\'Homme et du citoyen has been France\'s civil liberties watchdog since 1898, intervening wherever fundamental rights are threatened -- in courtrooms, police stations, refugee camps, and legislative chambers. It is not flashy or fashionable; it is the kind of organization that sends volunteer observers to police custody hearings at 3 a.m. and publishes 80-page reports on administrative detention that no one reads until a scandal breaks. The LDH exists because democracies do not defend themselves; citizens must do it, case by case, right by right.',
      founding_story: 'In 1898, France was tearing itself apart over the Dreyfus Affair -- the wrongful conviction of Jewish army officer Alfred Dreyfus for treason. After Émile Zola published "J\'accuse...!" in L\'Aurore, Senator Ludovic Trarieux founded the Ligue des droits de l\'Homme to defend Dreyfus and, more broadly, to ensure that the state could never again sacrifice an innocent person to protect its own prestige. Dreyfus was eventually exonerated, but the Ligue kept going, because the pattern of injustice Trarieux identified -- powerful institutions crushing individuals to save face -- turned out to be a permanent feature of every society.',
      impact: JSON.stringify([
        'Filed 187 legal interventions defending civil liberties in French courts in 2024',
        'Sent 2,400 volunteer observers to monitor police custody and detention conditions in 2023',
        'Published 34 investigative reports on discrimination, surveillance, and civil liberties in 2024',
        'Provided free legal aid to 5,600 individuals facing rights violations, including asylum seekers and protesters, in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Prints and distributes "Know Your Rights" guides for people in police custody, available in 12 languages' },
        { amount: 20, description: 'Sends a trained volunteer observer to a full day of detention hearings to monitor due process' },
        { amount: 50, description: 'Funds a legal intervention filing in a civil liberties case before the Conseil d\'État or European Court' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 81, admin_pct: 10, fundraising_pct: 9 }),
      certifications: JSON.stringify([
        { name: 'Reconnue d\'utilité publique', year: 1977 },
        { name: 'UN ECOSOC Consultative Status', year: 1947 },
        { name: 'FIDH founding member', year: 1922 }
      ]),
      milestones: JSON.stringify([
        { year: 1898, title: 'Founded during the Dreyfus Affair', description: 'Ludovic Trarieux created the Ligue to defend Captain Dreyfus and protect individual rights against state power' },
        { year: 1922, title: 'Co-founded FIDH', description: 'Helped establish the International Federation for Human Rights, the world\'s oldest human rights federation' },
        { year: 1940, title: 'Dissolved by Vichy, went underground', description: 'Banned by the Vichy regime, continued operating clandestinely, with many members joining the Resistance' },
        { year: 2005, title: 'Anti-discrimination testing', description: 'Pioneered "testing" methods to prove systemic discrimination in housing and employment in France' },
        { year: 2023, title: 'Surveillance law challenge', description: 'Successfully challenged provisions of France\'s intelligence surveillance law before the Constitutional Council' }
      ]),
      jurisdictions_eligible: JSON.stringify(['FR']),
      cross_border_method: 'none',
      story: 'When Boubacar, a 23-year-old delivery driver from Montreuil, was stopped and searched by police for the fourteenth time in a single year without ever being charged, he contacted the LDH\'s local section. A volunteer lawyer documented the pattern, gathered testimony from six other young men in the same neighbourhood experiencing the same thing, and filed a complaint that contributed to France\'s first successful class action against discriminatory identity checks. Boubacar now trains as a legal assistant at the LDH office, helping other people navigate the complaints process he once found so daunting.',
      website_url: 'https://www.ldh-france.org',
      founded_year: 1898,
      currency: 'EUR',
      brand_color: '#1B3A6B',
    },

    {
      id: nanoid(),
      name: 'SPA',
      description: 'France\'s leading animal welfare organization, running 63 shelters and rescuing over 48,000 animals annually since 1845.',
      category: 'Animals',
      icon: '🐾',
      country_code: 'FR',
      display_countries: JSON.stringify(['FR']),
      quality_label: 'Don en Confiance',
      tax_rate: 66,
      loi_coluche_eligible: 0,
      mission: 'The Société Protectrice des Animaux is France\'s oldest animal welfare charity, running the country\'s largest network of shelters and fighting for animal rights in the courts and in parliament. Every year, tens of thousands of abandoned, abused, and injured animals pass through SPA doors -- dogs left tied to motorway railings, cats thrown from windows, horses found starving in fields. The SPA takes them in, heals them, and finds them homes, while simultaneously pushing for stronger laws against cruelty and abandonment. It is thankless, messy, and exhausting work, and France would be a crueller country without it.',
      founding_story: 'In 1845, a physician named Étienne Pariset persuaded a group of Parisian notables to create the Société Protectrice des Animaux, making it the first animal welfare organization in France and one of the oldest in the world. Pariset was motivated by the routine brutality he witnessed on Paris streets: horses whipped until they collapsed, dogs drowned in the Seine, fighting pits operating openly in working-class neighbourhoods. The SPA\'s first campaigns focused on horse welfare, successfully lobbying for the Grammont Law of 1850 -- the first French law to criminalize animal cruelty. The organisation\'s shelter network grew from that original Parisian stable to 63 facilities across the country.',
      impact: JSON.stringify([
        'Rescued and sheltered 48,612 abandoned animals across 63 facilities in 2024',
        'Successfully rehomed 41,300 animals through adoption campaigns in 2023',
        'Investigated 12,400 reports of animal cruelty and filed 890 criminal complaints in 2024',
        'Sterilized 22,000 feral cats through the trap-neuter-return programme in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides a week of food and basic veterinary care for a rescued cat recovering in a shelter' },
        { amount: 20, description: 'Funds the sterilization of a feral cat, preventing dozens of unwanted kittens from being born on the streets' },
        { amount: 50, description: 'Covers the full veterinary treatment and rehabilitation of an abused dog, including surgery if needed' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 80, admin_pct: 9, fundraising_pct: 11 }),
      certifications: JSON.stringify([
        { name: 'Don en Confiance', year: 2005 },
        { name: 'Reconnue d\'utilité publique', year: 1860 },
        { name: 'Agrément protection animale', year: 1979 }
      ]),
      milestones: JSON.stringify([
        { year: 1845, title: 'Founded by Dr. Étienne Pariset', description: 'France\'s first animal welfare organization, initially focused on protecting working horses in Paris' },
        { year: 1850, title: 'Grammont Law', description: 'SPA lobbying led to France\'s first animal cruelty law, criminalizing public mistreatment of domestic animals' },
        { year: 1960, title: 'National shelter network', description: 'Expanded from Paris to a nationwide network of refuges, becoming France\'s largest shelter operator' },
        { year: 2015, title: 'Animals recognised as sentient beings', description: 'SPA advocacy contributed to the landmark change in the French Civil Code recognising animals as sentient' },
        { year: 2024, title: 'Record rescue year', description: 'Took in more animals than any previous year, reflecting both increased abandonment and expanded capacity' }
      ]),
      jurisdictions_eligible: JSON.stringify(['FR']),
      cross_border_method: 'none',
      story: 'A three-legged labrador named Oscar was found tied to a fence near the A6 motorway with a note that simply read "désolé" -- sorry. The SPA team at the Gennevilliers refuge treated his infected stump, fitted him with a prosthetic support, and spent three months helping him trust humans again. Oscar was adopted by a retired firefighter named Jean-Marc who had lost his own dog the year before; they now visit nursing homes together every Wednesday, and Oscar -- tail always wagging despite everything -- has become the most popular visitor in the building.',
      website_url: 'https://www.la-spa.fr',
      founded_year: 1845,
      currency: 'EUR',
      brand_color: '#FF6B00',
    },

    {
      id: nanoid(),
      name: 'Fondation de France',
      description: 'France\'s leading philanthropic foundation, connecting donors with causes and incubating innovative social programmes since 1969.',
      category: 'Education',
      icon: '🏛️',
      country_code: 'FR',
      display_countries: JSON.stringify(['FR']),
      quality_label: 'Don en Confiance',
      tax_rate: 66,
      loi_coluche_eligible: 0,
      mission: 'The Fondation de France is not a charity in the traditional sense -- it is a bridge between people who want to give and the causes that need it most, operating as France\'s largest philanthropy platform. It hosts 1,000 individual foundations under its umbrella, funds innovative social programmes that fall between the cracks of government policy, and runs its own initiatives in education, poverty, disability, and scientific research. When you have an idea to help people but no infrastructure to make it happen, the Fondation de France is where you go. It is the operating system of French generosity.',
      founding_story: 'In 1969, André Malraux, France\'s Minister of Culture, had a problem: wealthy French citizens wanted to fund charitable work, but France had no legal framework for private foundations comparable to the American model. Malraux, working with financial advisor Pierre Pflimlin, created the Fondation de France as a public-interest institution that could receive donations, shelter individual foundations, and distribute grants -- essentially inventing the infrastructure of modern French philanthropy from scratch. The genius of the model was its flexibility: rather than choosing one cause, the Fondation could fund anything that served the public good, making it a permanent engine of social innovation.',
      impact: JSON.stringify([
        'Distributed 380 million euros in grants to 12,000 projects across all social causes in 2024',
        'Sheltered and managed 1,006 individual foundations representing 5.2 billion euros in assets in 2024',
        'Funded 4,800 educational initiatives including scholarships, after-school programmes, and school renovation in 2023',
        'Supported 28,000 isolated elderly people through the Monalisa anti-loneliness programme in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Contributes to a scholarship fund providing school supplies and tutoring for a disadvantaged student for one month' },
        { amount: 20, description: 'Funds a weekly visit from a trained volunteer to an isolated elderly person through the anti-loneliness programme' },
        { amount: 50, description: 'Supports a month of an innovative education pilot project in an underserved neighbourhood school' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 85, admin_pct: 7, fundraising_pct: 8 }),
      certifications: JSON.stringify([
        { name: 'Don en Confiance', year: 1996 },
        { name: 'Reconnue d\'utilité publique', year: 1969 },
        { name: 'IDEAS Label', year: 2016 }
      ]),
      milestones: JSON.stringify([
        { year: 1969, title: 'Created by André Malraux', description: 'France\'s Minister of Culture established the legal framework for modern French philanthropy' },
        { year: 1987, title: 'Shelter foundation model', description: 'Pioneered the concept of hosting individual foundations under an umbrella institution, now copied worldwide' },
        { year: 2010, title: 'Monalisa programme', description: 'Launched the national mobilisation against isolation of elderly people, now France\'s largest anti-loneliness initiative' },
        { year: 2019, title: 'Notre-Dame reconstruction', description: 'Managed the largest single fundraising effort in French history after the cathedral fire, collecting 230 million euros' },
        { year: 2024, title: '1,000th foundation sheltered', description: 'Reached the milestone of hosting over 1,000 individual foundations, representing the full breadth of French philanthropy' }
      ]),
      jurisdictions_eligible: JSON.stringify(['FR']),
      cross_border_method: 'none',
      story: 'Eighty-two-year-old Simone hadn\'t left her apartment in Belleville for three months when Fondation de France\'s Monalisa programme matched her with Youssef, a 24-year-old engineering student who volunteered to visit once a week. What started as awkward tea and biscuits turned into a genuine friendship: Simone taught Youssef to make her mother\'s Alsatian tarte flambée, and Youssef taught Simone to video-call her grandchildren in Toulouse. When Youssef graduated, Simone sat in the front row holding a sign she\'d painted herself, and Youssef still brings her tarte dough every other Sunday.',
      website_url: 'https://www.fondationdefrance.org',
      founded_year: 1969,
      currency: 'EUR',
      brand_color: '#003DA5',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNITED KINGDOM (6 + Amnesty UK from international)
    // ═══════════════════════════════════════════════════════════════════════

    {
      id: nanoid(),
      name: 'Cancer Research UK',
      description: 'The world\'s largest independent cancer research charity, funding groundbreaking science that has saved millions of lives since 1902.',
      category: 'Health',
      icon: '🔬',
      country_code: 'GB',
      display_countries: JSON.stringify(['GB']),
      quality_label: 'Charity Commission',
      tax_rate: 25,
      loi_coluche_eligible: 0,
      mission: 'Cancer Research UK is the world\'s largest independent cancer research charity, funding the work of 4,000 scientists, doctors, and nurses across the UK. It has been behind some of the most important breakthroughs in cancer treatment -- from the development of tamoxifen for breast cancer to pioneering immunotherapy trials -- and aims to see three in four people survive their cancer by 2034. Unlike pharmaceutical-funded research, CRUK\'s science belongs to everyone, published openly and freely, because the organisation believes that beating cancer is too important to be locked behind patents.',
      founding_story: 'In 1902, a small group of doctors and businessmen founded the Imperial Cancer Research Fund, convinced that cancer could be understood and eventually defeated through scientific research at a time when the disease was considered a mysterious death sentence. In 2002, the ICRF merged with the Cancer Research Campaign to form Cancer Research UK, creating a single, powerful research funder. The merger was controversial -- two proud institutions with different cultures -- but it created an organisation that now funds more cancer research than any non-governmental body in the world. The merger\'s architect, Paul Nurse, went on to win the Nobel Prize in Medicine.',
      impact: JSON.stringify([
        'Invested 544 million pounds in cancer research across 90 UK institutions in 2024',
        'CRUK-funded research contributed to treatments that now save 37,000 lives annually in the UK',
        'Running 250 active clinical trials involving 28,000 patients testing new treatments in 2024',
        'UK cancer survival rates have doubled since the 1970s, in significant part due to CRUK-funded science'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds 30 minutes of laboratory research time, enough to analyse a tumour biopsy for genetic markers' },
        { amount: 20, description: 'Contributes to one patient\'s participation in a clinical trial testing a new immunotherapy treatment' },
        { amount: 50, description: 'Provides a day of researcher salary for a PhD student investigating how to stop cancer spreading to other organs' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 84, admin_pct: 6, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'Charity Commission England & Wales', year: 2002 },
        { name: 'OSCR (Scotland)', year: 2002 },
        { name: 'Fundraising Regulator', year: 2016 }
      ]),
      milestones: JSON.stringify([
        { year: 1902, title: 'Imperial Cancer Research Fund founded', description: 'Created as one of the world\'s first dedicated cancer research organisations' },
        { year: 1962, title: 'Tamoxifen discovery', description: 'ICRF-funded research led to the development of tamoxifen, which has since saved millions of breast cancer patients' },
        { year: 2002, title: 'CRUK formed from merger', description: 'The Imperial Cancer Research Fund and Cancer Research Campaign merged to create the world\'s largest independent cancer research charity' },
        { year: 2014, title: 'Immunotherapy breakthrough', description: 'CRUK clinical trials demonstrated the effectiveness of checkpoint inhibitor immunotherapy for melanoma' },
        { year: 2024, title: 'Liquid biopsy programme', description: 'Launched the UK\'s largest blood test screening programme for early cancer detection across 140,000 participants' }
      ]),
      jurisdictions_eligible: JSON.stringify(['GB']),
      cross_border_method: 'none',
      story: 'When Sarah Mitchell, a 34-year-old primary school teacher from Leeds, was diagnosed with aggressive melanoma that had spread to her lymph nodes, her oncologist enrolled her in a CRUK-funded immunotherapy trial at St James\'s Hospital. The treatment -- a combination of two checkpoint inhibitors -- shrank her tumours by 90% within three months. Two years later, Sarah is in complete remission and has returned to teaching, bringing her Year 3 class to the CRUK labs to meet the scientists, because she wants them to understand that research is not abstract -- it is someone deciding you get to live.',
      website_url: 'https://www.cancerresearchuk.org',
      founded_year: 2002,
      currency: 'GBP',
      brand_color: '#2E008B',
    },

    {
      id: nanoid(),
      name: 'Greenpeace UK',
      description: 'An independent environmental campaigning organization using direct action, research, and lobbying to protect the planet.',
      category: 'Environment',
      icon: '🌍',
      country_code: 'GB',
      display_countries: JSON.stringify(['GB']),
      quality_label: null,
      tax_rate: 25,
      loi_coluche_eligible: 0,
      mission: 'Greenpeace UK is the British branch of the global environmental movement known for showing up where the damage is happening -- on the decks of whaling ships, at the gates of polluting factories, in the boardrooms of oil companies -- and making it impossible to look away. It accepts no government or corporate funding, relying entirely on individual donors to maintain the fierce independence that is its most powerful asset. Greenpeace does not just protest; it investigates, publishes scientific research, and proposes policy alternatives, then makes enough noise to ensure those alternatives cannot be ignored.',
      founding_story: 'Greenpeace was born in 1971 when a small crew of activists sailed a fishing boat from Vancouver toward the US nuclear test site at Amchitka Island in Alaska. The boat was intercepted by the US Coast Guard before reaching the site, but the publicity forced the US to cancel the tests within a year. The UK office opened in 1977, initially operating from a cramped office above a bookshop in Islington, staffed by volunteers who spent their evenings hand-addressing envelopes. The organisation grew rapidly through the 1980s anti-nuclear and anti-whaling campaigns, powered by a combination of courage, scientific rigour, and an instinct for images that could change public opinion overnight.',
      impact: JSON.stringify([
        'Campaigns contributed to the UK\'s legally binding commitment to net zero emissions by 2050, enacted in 2019',
        'Documented and publicised illegal overfishing by 340 vessels in UK Marine Protected Areas in 2023-2024',
        'Successfully lobbied to halt three new North Sea oil and gas exploration licences through legal challenges in 2024',
        'Investigations exposed 12 major corporate greenwashing claims, leading to regulatory action in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds water sampling equipment for a volunteer team monitoring pollution at a UK river or coastal site' },
        { amount: 20, description: 'Supports a day of scientific investigation work on a corporate pollution or greenwashing case' },
        { amount: 50, description: 'Contributes to legal costs for a judicial review challenging a new fossil fuel extraction licence' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 78, admin_pct: 9, fundraising_pct: 13 }),
      certifications: JSON.stringify([
        { name: 'Charity Commission England & Wales', year: 1977 },
        { name: 'Fundraising Regulator', year: 2016 },
        { name: 'UN ECOSOC Observer Status', year: 1998 }
      ]),
      milestones: JSON.stringify([
        { year: 1977, title: 'UK office founded', description: 'Opened above a bookshop in Islington with a handful of volunteers and a photocopier' },
        { year: 1995, title: 'Brent Spar campaign', description: 'Occupied the Brent Spar oil platform, preventing its deep-sea dumping and changing European waste disposal policy' },
        { year: 2015, title: 'Arctic drilling victory', description: 'Shell abandoned Arctic oil drilling after sustained Greenpeace campaigns, a landmark win for the climate' },
        { year: 2019, title: 'Net zero legislation', description: 'Helped secure the UK\'s legally binding commitment to achieve net zero carbon emissions by 2050' },
        { year: 2024, title: 'North Sea legal challenge', description: 'Won a High Court ruling that the government had failed to properly assess climate impacts of new oil licences' }
      ]),
      jurisdictions_eligible: JSON.stringify(['GB']),
      cross_border_method: 'none',
      story: 'When fisherman Dave Stevens noticed dead shellfish washing up on the Yorkshire coast near a chemical plant outfall, he contacted Greenpeace UK. An investigation team spent three weeks secretly sampling the water, documenting that cadmium levels were 40 times the legal limit. The resulting report and media campaign forced the Environment Agency to issue an enforcement notice, and the company invested 8 million pounds in treatment facilities. Dave\'s stretch of coast now has some of the cleanest water quality readings in the North Sea, and his granddaughter swims there every summer.',
      website_url: 'https://www.greenpeace.org.uk',
      founded_year: 1977,
      currency: 'GBP',
      brand_color: '#66CC33',
    },

    {
      id: nanoid(),
      name: 'Oxfam GB',
      description: 'A global development and humanitarian organization fighting poverty, inequality, and injustice through aid, advocacy, and long-term development.',
      category: 'Humanitarian',
      icon: '🤝',
      country_code: 'GB',
      display_countries: JSON.stringify(['GB']),
      quality_label: 'Charity Commission',
      tax_rate: 25,
      loi_coluche_eligible: 0,
      mission: 'Oxfam GB fights the systemic causes of poverty and inequality, not just their symptoms. It delivers emergency aid when disaster strikes, but its real work is longer-term: helping communities build their own economic resilience, advocating for fair trade policies, and holding governments and corporations accountable for the rules that keep billions of people poor. Oxfam\'s annual inequality reports have become essential reading for anyone who wants to understand why the richest 1% own more than the rest of humanity combined, and what can be done about it.',
      founding_story: 'In 1942, a group of Oxford academics, Quakers, and social activists formed the Oxford Committee for Famine Relief to campaign for food supplies to be sent to starving civilians in Nazi-occupied Greece, which was subject to an Allied naval blockade. Their first public meeting, held in the University Church of St Mary the Virgin, raised enough money to send food parcels through the Red Cross. After the war, the committee kept going, expanding to fight famine wherever it occurred. The name was shortened to Oxfam, and the High Street charity shop model it pioneered -- staffed by volunteers selling donated goods -- was copied by virtually every British charity that followed.',
      impact: JSON.stringify([
        'Reached 25.4 million people with humanitarian and development programmes across 87 countries in 2024',
        'Provided clean water access to 8.7 million people in crisis-affected regions in 2023',
        'Oxfam\'s 600+ UK charity shops generated 112 million pounds for programmes while recycling 14,000 tonnes of goods in 2024',
        'Advocacy campaigns contributed to debt relief agreements worth 2.1 billion dollars for developing nations in 2023-2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides a family of five with water purification tablets for three months in a drought-affected community' },
        { amount: 20, description: 'Trains a woman farmer in climate-resilient agriculture techniques, increasing her harvest yield for years to come' },
        { amount: 50, description: 'Funds a community savings group for 25 women, enabling them to start small businesses and become financially independent' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 81, admin_pct: 7, fundraising_pct: 12 }),
      certifications: JSON.stringify([
        { name: 'Charity Commission England & Wales', year: 1942 },
        { name: 'OSCR (Scotland)', year: 1965 },
        { name: 'Fundraising Regulator', year: 2016 }
      ]),
      milestones: JSON.stringify([
        { year: 1942, title: 'Oxford Committee for Famine Relief', description: 'Founded in wartime Oxford to send food to starving civilians in Nazi-occupied Greece' },
        { year: 1948, title: 'First charity shop', description: 'Opened the first permanent Oxfam shop on Broad Street, Oxford, pioneering the charity retail model' },
        { year: 1995, title: 'Jubilee 2000 campaign', description: 'Co-founded the campaign to cancel developing-world debt, eventually securing 100 billion dollars in relief' },
        { year: 2014, title: 'First inequality report', description: 'Published "Working for the Few," launching annual inequality analysis that reshaped global economic debate' },
        { year: 2024, title: 'Climate justice campaign', description: 'Led advocacy resulting in the first Loss and Damage fund disbursements to climate-vulnerable nations' }
      ]),
      jurisdictions_eligible: JSON.stringify(['GB']),
      cross_border_method: 'none',
      story: 'In northern Kenya\'s Turkana County, a prolonged drought had killed most of pastoralist Mary Lokwameri\'s goats and left her family surviving on wild berries. An Oxfam-supported savings group in her village gave her a small loan to buy drought-resistant seeds and two goats from a hardier breed. Within a year, Mary had repaid the loan, her vegetable garden was feeding her family, and her goat herd had grown to eight. She now leads the savings group herself, and has helped 14 other women in her community start the same journey from crisis to self-sufficiency.',
      website_url: 'https://www.oxfam.org.uk',
      founded_year: 1942,
      currency: 'GBP',
      brand_color: '#61A534',
    },

    {
      id: nanoid(),
      name: 'NSPCC',
      description: 'The UK\'s leading children\'s charity, preventing child abuse and helping children recover through Childline, research, and direct services.',
      category: 'Children',
      icon: '🧸',
      country_code: 'GB',
      display_countries: JSON.stringify(['GB']),
      quality_label: 'Charity Commission',
      tax_rate: 25,
      loi_coluche_eligible: 0,
      mission: 'The NSPCC exists to end cruelty to children in the UK. It runs Childline -- the free, confidential helpline that every British child knows the number for -- investigates abuse, supports families in crisis, and campaigns for stronger laws to protect children. It is one of the few charities in the UK with statutory powers to take action on behalf of children at risk, a responsibility it carries with the weight it deserves. Behind every statistic about child abuse is a child who needed an adult to notice, and the NSPCC trains those adults -- teachers, doctors, coaches, parents -- to see the signs.',
      founding_story: 'In 1884, a Liverpool banker named Thomas Agnew attended a lecture by a visiting American animal welfare campaigner and was struck by a paradox: Britain had laws protecting animals from cruelty but none protecting children. Agnew founded the Liverpool Society for the Prevention of Cruelty to Children that same year, and by 1889 the movement had spread nationwide and secured the first Prevention of Cruelty to Children Act, giving authorities the right to intervene in abusive homes. Queen Victoria granted the "Royal" prefix, but the NSPCC has always been powered by ordinary people who refuse to accept that what happens behind closed doors is nobody else\'s business.',
      impact: JSON.stringify([
        'Childline handled 278,000 counselling sessions with children and young people in 2024',
        'Trained 184,000 adults in child protection awareness through the NSPCC\'s Speak Out Stay Safe programme in 2023',
        'Helped 32,000 children and families through direct therapeutic and safeguarding services in 2024',
        'NSPCC investigations and referrals led to protective action for 14,600 children at risk in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds a Childline counselling session, giving a frightened child someone to talk to when they feel they have no one' },
        { amount: 20, description: 'Trains a schoolteacher in child protection awareness so they can recognise signs of abuse in their classroom' },
        { amount: 50, description: 'Provides a week of therapeutic support for a child recovering from abuse, including art therapy and counselling' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 83, admin_pct: 6, fundraising_pct: 11 }),
      certifications: JSON.stringify([
        { name: 'Charity Commission England & Wales', year: 1884 },
        { name: 'OSCR (Scotland)', year: 1889 },
        { name: 'Fundraising Regulator', year: 2016 }
      ]),
      milestones: JSON.stringify([
        { year: 1884, title: 'Founded in Liverpool', description: 'Thomas Agnew created the first Society for the Prevention of Cruelty to Children in Britain' },
        { year: 1889, title: 'Children\'s Charter Act', description: 'NSPCC campaigning secured the first law allowing intervention to protect children from abuse' },
        { year: 1986, title: 'Childline launched', description: 'Esther Rantzen founded the free children\'s helpline, which merged with the NSPCC in 2006' },
        { year: 2015, title: 'Mandatory reporting campaign', description: 'Successfully campaigned for a legal duty to act on child abuse knowledge in regulated settings' },
        { year: 2023, title: 'Online safety advocacy', description: 'Helped shape the UK Online Safety Act, securing stronger protections for children on social media platforms' }
      ]),
      jurisdictions_eligible: JSON.stringify(['GB']),
      cross_border_method: 'none',
      story: 'Eleven-year-old Jake called Childline at 11:30 p.m. on a Tuesday, whispering into a borrowed phone that he was scared of his mother\'s new boyfriend, who had started hitting him when she was at work. The counsellor, a volunteer named Rachel, spent 45 minutes talking to Jake, gently gathering enough information to make a referral while making him feel heard and safe. Social services intervened the following day, and Jake was placed with his grandmother. A year later, with the NSPCC\'s support, Jake\'s mother had left the relationship, and Jake -- back home and starting secondary school -- wrote a thank-you letter to "the lady on the phone who believed me."',
      website_url: 'https://www.nspcc.org.uk',
      founded_year: 1884,
      currency: 'GBP',
      brand_color: '#00A84F',
    },

    {
      id: nanoid(),
      name: 'RSPCA',
      description: 'The world\'s oldest and largest animal welfare charity, rescuing and rehabilitating animals across England and Wales since 1824.',
      category: 'Animals',
      icon: '🐕',
      country_code: 'GB',
      display_countries: JSON.stringify(['GB']),
      quality_label: 'Charity Commission',
      tax_rate: 25,
      loi_coluche_eligible: 0,
      mission: 'The RSPCA is the world\'s oldest animal welfare charity, and its mission has barely changed since 1824: to rescue animals from suffering, rehabilitate them, and prevent cruelty through education and law enforcement. It is one of the few charities in the UK that investigates and prosecutes animal cruelty, running its own inspectorate of 300 officers who respond to over 100,000 reports a year. From puppy farms to factory farming, from dog fighting to wildlife crime, the RSPCA goes wherever animals suffer and does whatever it takes -- legally and practically -- to make it stop.',
      founding_story: 'On 16 June 1824, a group of 22 reformers met in a London coffee shop to found the Society for the Prevention of Cruelty to Animals -- the first animal welfare organization in the world. Its leading figure, Richard Martin MP, had already pushed through Parliament the Cruel Treatment of Cattle Act in 1822, but knew that a law without enforcement was just words on paper. The Society hired its first inspectors to patrol London\'s streets and markets, prosecuting carters who beat their horses. Queen Victoria granted the "Royal" prefix in 1840, making the RSPCA one of the first charities to receive royal patronage, and the model of charity-led animal welfare enforcement it created has been replicated in 47 countries.',
      impact: JSON.stringify([
        'Rescued and collected 117,000 animals through its inspectorate and rescue teams in 2024',
        'Successfully prosecuted 748 animal cruelty cases, securing 1,432 convictions in 2023',
        'Rehomed or released 44,600 animals through its network of centres and branches in 2024',
        'Responded to 1.2 million contacts through its 24-hour cruelty reporting line in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides emergency veterinary first aid for a rescued animal brought in by an RSPCA inspector' },
        { amount: 20, description: 'Funds a full day of an RSPCA inspector investigating a report of animal cruelty or neglect' },
        { amount: 50, description: 'Covers the complete rehabilitation and rehoming of a rescued dog, including veterinary care and behavioural support' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 82, admin_pct: 7, fundraising_pct: 11 }),
      certifications: JSON.stringify([
        { name: 'Charity Commission England & Wales', year: 1824 },
        { name: 'Fundraising Regulator', year: 2016 },
        { name: 'Royal Patronage', year: 1840 }
      ]),
      milestones: JSON.stringify([
        { year: 1824, title: 'World\'s first animal welfare charity', description: 'Founded in a London coffee shop by 22 reformers determined to enforce animal cruelty laws' },
        { year: 1840, title: 'Royal patronage', description: 'Queen Victoria granted the "Royal" prefix, giving the society national recognition and credibility' },
        { year: 1911, title: 'Protection of Animals Act', description: 'RSPCA lobbying secured comprehensive animal cruelty legislation that remains the foundation of UK animal law' },
        { year: 2006, title: 'Animal Welfare Act', description: 'Decades of RSPCA campaigning led to a landmark law establishing a duty of care for all domestic animals' },
        { year: 2024, title: 'Sentience Act implementation', description: 'Helped establish the UK Animal Sentience Committee, ensuring animal welfare is considered in all government policy' }
      ]),
      jurisdictions_eligible: JSON.stringify(['GB']),
      cross_border_method: 'none',
      story: 'RSPCA inspector Kate Aldridge responded to a call about a house in Birmingham where neighbours reported hearing dogs crying. Inside, she found 23 dogs living in complete darkness, some so matted they could barely walk, with no food or clean water. Over the following months, each dog was veterinarily treated, patiently socialised, and eventually rehomed. The last to find a home was a deaf Staffie cross named Biscuit, who had been so traumatised he couldn\'t be touched; after four months with a foster carer who communicated through hand signals, Biscuit learned to trust again and was adopted by a retired sign language interpreter.',
      website_url: 'https://www.rspca.org.uk',
      founded_year: 1824,
      currency: 'GBP',
      brand_color: '#0054A6',
    },

    {
      id: nanoid(),
      name: 'Teach First',
      description: 'Placing outstanding graduates as teachers in disadvantaged schools across England and Wales to tackle educational inequality.',
      category: 'Education',
      icon: '🎓',
      country_code: 'GB',
      display_countries: JSON.stringify(['GB']),
      quality_label: 'Charity Commission',
      tax_rate: 25,
      loi_coluche_eligible: 0,
      mission: 'Teach First attacks educational inequality at its root by recruiting the UK\'s most talented graduates and placing them as teachers in schools serving the most disadvantaged communities. The idea is simple but radical: if the postcode you\'re born in determines the quality of teacher you get, then send the best teachers to the toughest postcodes. Teach First participants commit to two years of teaching in a challenging school while completing a PGCE qualification. Many stay far longer, and the network of 16,000 alumni -- now headteachers, policy advisors, and entrepreneurs -- has become the most powerful force for educational equity in the UK.',
      founding_story: 'In 2002, management consultant Brett Wigdortz was working on a McKinsey project studying education systems worldwide when he noticed something that infuriated him: in England, the gap in educational outcomes between rich and poor children was wider than in almost any other developed country, and the most disadvantaged schools had the hardest time recruiting good teachers. Inspired by Teach for America, Wigdortz launched Teach First with 186 participants placed in London secondary schools. The teaching establishment was sceptical -- what could a management consultant know about education? -- but the results spoke for themselves, and the programme expanded to every region of England and Wales.',
      impact: JSON.stringify([
        'Placed over 16,000 teachers in disadvantaged schools since 2002, reaching 1.7 million pupils',
        'Schools with Teach First participants saw GCSE pass rates improve 6 percentage points faster than comparable schools in 2023',
        'Trained 1,400 new teachers in 2024, with 72% remaining in education five years after completing the programme',
        '64% of Teach First alumni hold senior leadership positions in education, policy, or social enterprise by 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides classroom materials for a new Teach First teacher setting up their first lesson plans in a challenging school' },
        { amount: 20, description: 'Funds a day of intensive teacher training for a recent graduate preparing to lead a classroom in a disadvantaged area' },
        { amount: 50, description: 'Contributes to a full week of mentoring and coaching support for a first-year teacher in a high-need school' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 85, admin_pct: 7, fundraising_pct: 8 }),
      certifications: JSON.stringify([
        { name: 'Charity Commission England & Wales', year: 2002 },
        { name: 'Ofsted Outstanding Provider', year: 2018 },
        { name: 'Social Enterprise Mark', year: 2015 }
      ]),
      milestones: JSON.stringify([
        { year: 2002, title: 'First cohort of 186 teachers', description: 'Brett Wigdortz launched the programme with graduates placed in London secondary schools' },
        { year: 2010, title: 'National expansion', description: 'Expanded from London to every region of England, reaching primary schools for the first time' },
        { year: 2015, title: 'Wales programme', description: 'Launched in Wales, addressing educational inequality in some of the UK\'s most deprived communities' },
        { year: 2018, title: 'Ofsted Outstanding', description: 'Rated Outstanding by Ofsted as an initial teacher training provider, the highest possible grade' },
        { year: 2024, title: 'Career Changers programme', description: 'Expanded beyond graduates to recruit mid-career professionals, bringing industry expertise into classrooms' }
      ]),
      jurisdictions_eligible: JSON.stringify(['GB']),
      cross_border_method: 'none',
      story: 'Priya Patel left a graduate position at a City law firm to join Teach First and was placed at a secondary school in Tower Hamlets where 78% of pupils were eligible for free school meals. Her Year 11 English class included Dayo, a quiet Nigerian-British boy who had been predicted a grade 3 and written off by previous teachers. Priya spent lunch breaks helping him with close reading and persuaded him to apply for a creative writing competition; Dayo won, achieved a grade 7 in his GCSE, and is now studying English Literature at Queen Mary University, the first in his family to attend university.',
      website_url: 'https://www.teachfirst.org.uk',
      founded_year: 2002,
      currency: 'GBP',
      brand_color: '#F0AB00',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // GERMANY (6 + Amnesty DE from international)
    // ═══════════════════════════════════════════════════════════════════════

    {
      id: nanoid(),
      name: 'Deutsche Krebshilfe',
      description: 'Germany\'s leading independent cancer charity, funding research, patient support, and prevention since 1974.',
      category: 'Health',
      icon: '🎗️',
      country_code: 'DE',
      display_countries: JSON.stringify(['DE']),
      quality_label: 'DZI Spendensiegel',
      tax_rate: 30,
      loi_coluche_eligible: 0,
      mission: 'Deutsche Krebshilfe is Germany\'s largest citizen-funded cancer charity, financing research, supporting patients and their families, and running prevention campaigns that reach millions. Unlike many health charities, it accepts no public subsidies and no pharmaceutical industry funding, maintaining total independence at a time when the boundaries between medical research and commercial interests are increasingly blurred. It was built on the belief that cancer is too serious to be left to the state alone, and that ordinary people pooling their donations can move faster and more freely than any government ministry.',
      founding_story: 'In 1974, Dr. Mildred Scheel, a physician and the wife of then-President of the Federal Republic Walter Scheel, was shocked by how little public funding was available for cancer research in Germany and how isolated patients were in their suffering. She appeared on national television to appeal for donations and founded Deutsche Krebshilfe that same year, raising 800,000 Deutschmarks in the first month. Mildred Scheel had cancer herself -- a fact she kept private -- and she poured her personal urgency into building an organization that funded both laboratory science and patient support. She died of cancer in 1985, having transformed how Germany fights the disease.',
      impact: JSON.stringify([
        'Invested 72 million euros in cancer research grants across German universities and hospitals in 2024',
        'Funded 14 Comprehensive Cancer Centres providing world-class integrated treatment across Germany',
        'Supported 340,000 patients and families through free counselling hotlines and financial aid in 2023',
        'Trained 28,000 healthcare professionals in the latest oncology practices through continuing education in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds a call to the cancer information hotline, where trained counsellors answer patients\' questions about diagnosis and treatment' },
        { amount: 20, description: 'Provides a day of hardship financial support to a cancer patient who cannot work during treatment' },
        { amount: 50, description: 'Contributes to a week of cutting-edge cancer research at one of the 14 Comprehensive Cancer Centres' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 84, admin_pct: 6, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'DZI Spendensiegel', year: 1992 },
        { name: 'Transparenzpreis', year: 2018 },
        { name: 'Initiative Transparente Zivilgesellschaft', year: 2010 }
      ]),
      milestones: JSON.stringify([
        { year: 1974, title: 'Founded by Mildred Scheel', description: 'The First Lady of Germany created the charity after a national television appeal raised 800,000 DM in one month' },
        { year: 1995, title: 'Comprehensive Cancer Centres', description: 'Began funding an integrated network of specialised cancer treatment centres across Germany' },
        { year: 2005, title: 'National Cancer Plan', description: 'Contributed to Germany\'s first coordinated National Cancer Plan, shaping federal health policy' },
        { year: 2018, title: 'Transparency award', description: 'Recognised as Germany\'s most transparent large charity for financial reporting and governance' },
        { year: 2024, title: 'Record research investment', description: 'Committed a record 72 million euros to cancer research, the largest single-year investment in the charity\'s history' }
      ]),
      jurisdictions_eligible: JSON.stringify(['DE']),
      cross_border_method: 'none',
      story: 'When Thomas Bauer, a 45-year-old carpenter from Freiburg, was diagnosed with pancreatic cancer, his greatest fear was not the treatment but how his family would survive financially while he was unable to work. Deutsche Krebshilfe\'s Härtefonds provided immediate financial assistance covering three months of rent, while a counsellor helped his wife navigate the complex web of health insurance and disability benefits. Thomas completed his treatment, returned to work part-time, and now volunteers at the charity\'s local office, helping other patients fill out the same forms that once overwhelmed him.',
      website_url: 'https://www.krebshilfe.de',
      founded_year: 1974,
      currency: 'EUR',
      brand_color: '#E30613',
    },

    {
      id: nanoid(),
      name: 'BUND (Friends of the Earth Germany)',
      description: 'Germany\'s largest grassroots environmental organization, protecting nature through local action, legal challenges, and national policy advocacy.',
      category: 'Environment',
      icon: '🌳',
      country_code: 'DE',
      display_countries: JSON.stringify(['DE']),
      quality_label: 'DZI Spendensiegel',
      tax_rate: 30,
      loi_coluche_eligible: 0,
      mission: 'BUND -- the Bund für Umwelt und Naturschutz Deutschland -- is Germany\'s largest environmental grassroots organization, with 680,000 members and supporters fighting to protect rivers, forests, insects, and the climate. What makes BUND different from international environmental groups is its deep roots in local communities: 2,000 local groups monitor their own rivers, protect their own hedgerows, and challenge their own local authorities. It combines this ground-level activism with national policy advocacy and high-profile legal challenges, making it both the friendly neighbour who sets up a toad tunnel under the road and the fierce litigant who takes the government to court over air pollution.',
      founding_story: 'In 1975, Bernhard Grzimek -- the legendary Frankfurt Zoo director and filmmaker whose documentary "Serengeti Shall Not Die" had made him Germany\'s most famous conservationist -- helped found BUND as a federation uniting Germany\'s scattered local environmental groups into a national force. Grzimek understood that passion without organisation was just noise, and that Germany\'s environmental activists needed both a common platform and professional legal expertise to challenge industry and government. The federation grew explosively during the anti-nuclear movement of the late 1970s and the acid rain crisis of the 1980s, becoming the backbone of German environmentalism.',
      impact: JSON.stringify([
        'Won 42 environmental lawsuits protecting rivers, forests, and endangered species in German courts in 2023-2024',
        'Coordinated 680,000 members and 2,000 local groups monitoring and protecting ecosystems across all 16 Bundesländer',
        'Successfully campaigned for Germany\'s coal phase-out timeline, secured in legislation in 2020',
        'Protected 45,000 hectares of valuable habitats through direct land stewardship and conservation agreements in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides materials for a local group to build a wildflower meadow and insect hotel in their community' },
        { amount: 20, description: 'Funds expert ecological assessment for a court case challenging a development project threatening a protected habitat' },
        { amount: 50, description: 'Supports a month of river monitoring by trained volunteers, detecting pollution before it causes permanent damage' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 82, admin_pct: 8, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'DZI Spendensiegel', year: 2000 },
        { name: 'Anerkannter Naturschutzverband', year: 1977 },
        { name: 'Friends of the Earth International member', year: 1975 }
      ]),
      milestones: JSON.stringify([
        { year: 1975, title: 'Founded with Bernhard Grzimek', description: 'Germany\'s scattered environmental groups united into a national federation for the first time' },
        { year: 1986, title: 'Chernobyl response', description: 'Led the German anti-nuclear campaign after Chernobyl, fundamentally shaping the country\'s energy debate' },
        { year: 2007, title: 'Elbe river victory', description: 'Won a landmark legal battle stopping a proposed dam on the Elbe, preserving Europe\'s largest untouched floodplain' },
        { year: 2020, title: 'Coal phase-out', description: 'Decades of campaigning contributed to Germany\'s legally binding commitment to end coal power' },
        { year: 2024, title: 'Insect protection programme', description: 'Launched the largest citizen science insect monitoring programme in Germany, involving 12,000 volunteers' }
      ]),
      jurisdictions_eligible: JSON.stringify(['DE']),
      cross_border_method: 'none',
      story: 'When a local BUND group in the Spreewald discovered that a planned motorway bypass would destroy the last breeding site of a rare aquatic warbler, retired biology teacher Helga Krause spent 14 months documenting the bird population with photographs, recordings, and nest counts. Her evidence formed the core of a successful legal challenge that rerouted the bypass and established a protected zone around the marshland. Three years later, the aquatic warbler population at the site had doubled, and Helga still leads dawn birdwatching walks there every Saturday in spring, pointing out the birds she saved to schoolchildren.',
      website_url: 'https://www.bund.net',
      founded_year: 1975,
      currency: 'EUR',
      brand_color: '#007A3D',
    },

    {
      id: nanoid(),
      name: 'Welthungerhilfe',
      description: 'One of the largest private aid organisations in Germany, fighting hunger and poverty in the world\'s most vulnerable communities since 1962.',
      category: 'Humanitarian',
      icon: '🌾',
      country_code: 'DE',
      display_countries: JSON.stringify(['DE']),
      quality_label: 'DZI Spendensiegel',
      tax_rate: 30,
      loi_coluche_eligible: 0,
      mission: 'Welthungerhilfe works to create a world in which everyone has enough to eat. That means not just delivering food in emergencies -- though it does that too, responding to floods, droughts, and conflicts around the world -- but tackling the root causes of hunger through sustainable agriculture, clean water, education, and community empowerment. It is one of the largest private aid organizations in Germany and one of the most effective: its approach combines immediate relief with long-term development that puts communities in charge of their own food security, rather than creating dependence on aid.',
      founding_story: 'In 1962, the United Nations declared the first Freedom from Hunger Campaign, and Germany\'s first President, Theodor Heuss, called on German citizens to do their part. A national committee was formed, chaired by Heuss himself, to channel German donations toward fighting world hunger. What was meant to be a one-year campaign proved so necessary that it became permanent, evolving into Welthungerhilfe. The organisation\'s founding principle -- that hunger is not a natural disaster but a political failure that citizens can help correct -- reflected post-war Germany\'s determination to rebuild not just at home but globally.',
      impact: JSON.stringify([
        'Reached 21 million people across 36 countries with food security and development programmes in 2024',
        'Improved access to clean water and sanitation for 4.3 million people in 2023',
        'Trained 890,000 smallholder farmers in sustainable agriculture techniques increasing yields by 30-50% in 2024',
        'Provided emergency food assistance to 6.1 million people in acute crisis situations in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides emergency food rations for a family of four for three days during a hunger crisis' },
        { amount: 20, description: 'Trains a smallholder farmer in drought-resistant farming techniques that increase food production for years' },
        { amount: 50, description: 'Installs a solar-powered water pump providing clean drinking water to a village of 500 people' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 88, admin_pct: 4, fundraising_pct: 8 }),
      certifications: JSON.stringify([
        { name: 'DZI Spendensiegel', year: 1992 },
        { name: 'Transparenzpreis', year: 2016 },
        { name: 'Alliance2015 member', year: 2000 }
      ]),
      milestones: JSON.stringify([
        { year: 1962, title: 'Founded during Freedom from Hunger Campaign', description: 'Germany\'s first President called on citizens to fight world hunger, creating a permanent institution' },
        { year: 1984, title: 'Ethiopian famine response', description: 'Mounted one of the largest German aid operations during the Ethiopian famine, reaching 2 million people' },
        { year: 2000, title: 'Alliance2015', description: 'Co-founded the European alliance of development organisations to coordinate poverty reduction efforts' },
        { year: 2013, title: 'Zero Hunger initiative', description: 'Launched a comprehensive approach linking emergency response with long-term sustainable food systems' },
        { year: 2024, title: 'Climate-smart agriculture', description: 'Rolled out the largest climate-adapted farming programme in its history, reaching farmers in 18 countries' }
      ]),
      jurisdictions_eligible: JSON.stringify(['DE']),
      cross_border_method: 'none',
      story: 'In Sindh province, Pakistan, after the catastrophic 2022 floods destroyed 80% of cropland, rice farmer Amina Bibi received seeds, tools, and training from Welthungerhilfe in a programme that taught raised-bed farming to cope with future flooding. Her first harvest using the new technique yielded more than double her pre-flood output, and she began teaching the method to neighbouring farmers. By the following season, 40 families in her village had adopted the raised-bed approach, and Amina had been elected head of the local farmers\' cooperative -- the first woman to hold the position in the village\'s history.',
      website_url: 'https://www.welthungerhilfe.org',
      founded_year: 1962,
      currency: 'EUR',
      brand_color: '#E3000B',
    },

    {
      id: nanoid(),
      name: 'Deutsches Kinderhilfswerk',
      description: 'Germany\'s leading children\'s rights organization, fighting child poverty and championing children\'s participation in decisions that affect their lives.',
      category: 'Children',
      icon: '🧒',
      country_code: 'DE',
      display_countries: JSON.stringify(['DE']),
      quality_label: 'DZI Spendensiegel',
      tax_rate: 30,
      loi_coluche_eligible: 0,
      mission: 'The Deutsches Kinderhilfswerk fights child poverty in one of the world\'s richest countries and campaigns for children\'s rights to be taken as seriously as any other civil liberty. In Germany, 2.8 million children live in poverty, and the Kinderhilfswerk funds school meals, play spaces, and digital access programmes while simultaneously pushing for structural change: children\'s rights in the constitution, a guaranteed child basic income, and genuine participation of young people in political decisions. It is an organisation that takes children\'s voices literally, running youth councils, funding child-led projects, and insisting that democracy must include people under 18.',
      founding_story: 'In 1972, a group of concerned citizens in Munich came together with a provocative question: why does the richest country in Europe tolerate child poverty? They founded the Deutsches Kinderhilfswerk initially as a fundraising body for children\'s play spaces -- believing that every child has a right to play regardless of their family\'s income. From those first playgrounds, the organisation grew to address all dimensions of child poverty and rights, discovering that the lack of a safe place to play was just the visible symptom of a deeper failure to consider children\'s needs in German policy. The playground ethos endured: the Kinderhilfswerk still believes that a society that cannot give its children room to play has lost something fundamental.',
      impact: JSON.stringify([
        'Funded 6,400 projects supporting children in poverty across all 16 German states in 2024',
        'Provided school meals to 28,000 children from low-income families through the Kinderrestarant programme in 2023',
        'Enabled 180,000 children to participate in democratic decision-making through youth councils and participatory budgets in 2024',
        'Distributed 2.3 million euros in emergency aid to families in acute financial crisis in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides a week of healthy school lunches for a child whose family cannot afford the meal fee' },
        { amount: 20, description: 'Funds a month of after-school homework help and tutoring for a child in a low-income family' },
        { amount: 50, description: 'Equips a child with a laptop and internet access for a full school year through the digital participation programme' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 83, admin_pct: 7, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'DZI Spendensiegel', year: 1998 },
        { name: 'Initiative Transparente Zivilgesellschaft', year: 2012 },
        { name: 'National Coalition member (UN CRC)', year: 1995 }
      ]),
      milestones: JSON.stringify([
        { year: 1972, title: 'Founded in Munich', description: 'Citizens created the Kinderhilfswerk to build playgrounds for children in poverty, launching a broader rights movement' },
        { year: 1992, title: 'Children\'s rights campaign', description: 'Began the campaign to enshrine children\'s rights in the German constitution, still ongoing' },
        { year: 2005, title: 'World Children\'s Day', description: 'Established the annual celebration that now involves 500,000 children in events across Germany' },
        { year: 2018, title: 'Digital participation initiative', description: 'Launched the programme to ensure children in poverty have equal access to digital education tools' },
        { year: 2024, title: 'Kindergrundsicherung advocacy', description: 'Central role in the national debate on introducing a guaranteed child basic income in Germany' }
      ]),
      jurisdictions_eligible: JSON.stringify(['DE']),
      cross_border_method: 'none',
      story: 'Twelve-year-old Elif from Berlin-Neukölln had never been on a school trip because her mother, a single parent working two cleaning jobs, could never afford the fees. When the Kinderhilfswerk funded the trip and provided Elif with a backpack and rain jacket, she went to the Harz Mountains for the first time and discovered she loved hiking. The youth council at her school, also supported by the Kinderhilfswerk, helped Elif propose a "no-cost outdoor club" that now takes 30 students on monthly nature walks, funded through a participatory budget that the children themselves voted on.',
      website_url: 'https://www.dkhw.de',
      founded_year: 1972,
      currency: 'EUR',
      brand_color: '#FFD700',
    },

    {
      id: nanoid(),
      name: 'Deutscher Tierschutzbund',
      description: 'Germany\'s largest animal welfare umbrella organization, running shelters, fighting factory farming, and advocating for animal rights since 1881.',
      category: 'Animals',
      icon: '🐱',
      country_code: 'DE',
      display_countries: JSON.stringify(['DE']),
      quality_label: 'DZI Spendensiegel',
      tax_rate: 30,
      loi_coluche_eligible: 0,
      mission: 'The Deutscher Tierschutzbund is the umbrella organization for over 740 local animal welfare associations running more than 550 animal shelters across Germany. It fights on every front where animals suffer: rescuing and rehoming abandoned pets, campaigning against factory farming, lobbying for an end to animal testing, and pushing for constitutional protections that treat animals as sentient beings rather than property. Germany\'s 2002 constitutional amendment recognizing animal welfare as a state objective was largely the result of the Tierschutzbund\'s decades of patient, persistent advocacy.',
      founding_story: 'In 1881, animal welfare activists from across the German Empire gathered in Cologne to federate their local societies into a national organization. The movement had roots in the philosophical tradition of Schopenhauer, who argued that the capacity to suffer -- not the ability to reason -- was the basis of moral consideration. The Tierschutzbund survived two world wars, a dictatorship, and German reunification, absorbing East German animal welfare groups after 1990 and discovering thousands of abandoned animals in the chaos of reunification. Through every crisis, the shelters stayed open, because the animals had nowhere else to go.',
      impact: JSON.stringify([
        'Network of 740 member organizations operating 550+ animal shelters took in 380,000 animals in 2024',
        'Rehomed 285,000 animals through shelter adoption programmes and transfer agreements in 2023',
        'Successfully lobbied for the 2002 constitutional amendment making animal welfare a state obligation in Germany',
        'Campaigned for and achieved a ban on fur farming in Germany, effective 2022'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides three days of shelter care for an abandoned cat, including food, bedding, and veterinary checks' },
        { amount: 20, description: 'Funds the complete health examination and vaccination of a shelter dog preparing for adoption' },
        { amount: 50, description: 'Supports emergency veterinary surgery for a rescued animal suffering from neglect or abuse injuries' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 81, admin_pct: 8, fundraising_pct: 11 }),
      certifications: JSON.stringify([
        { name: 'DZI Spendensiegel', year: 1996 },
        { name: 'Initiative Transparente Zivilgesellschaft', year: 2011 },
        { name: 'Eurogroup for Animals member', year: 1980 }
      ]),
      milestones: JSON.stringify([
        { year: 1881, title: 'Founded in Cologne', description: 'Local animal welfare societies across the German Empire federated into a national organization' },
        { year: 1933, title: 'Survived the Nazi era', description: 'Navigated the complexities of the Third Reich, maintaining shelter operations despite political interference' },
        { year: 1990, title: 'Reunification expansion', description: 'Absorbed East German animal welfare groups and rescued thousands of animals abandoned in the chaos of reunification' },
        { year: 2002, title: 'Constitutional protection', description: 'Decades of lobbying secured the amendment adding animal welfare to Article 20a of the German Basic Law' },
        { year: 2022, title: 'Fur farming ban', description: 'Campaign success: Germany officially banned fur farming, the culmination of 20 years of advocacy' }
      ]),
      jurisdictions_eligible: JSON.stringify(['DE']),
      cross_border_method: 'none',
      story: 'When the Tierschutzbund shelter in Dresden received a call about a dog locked in a car in 35-degree heat, inspector Markus Friedemann raced to the parking lot and found a border collie named Luna barely breathing, her tongue grey. After breaking the window with police authorization, Markus rushed Luna to the shelter\'s veterinary clinic, where she was cooled with wet towels and intravenous fluids over four tense hours. Luna made a full recovery and was rehomed with a retired couple who give her long walks by the Elbe every morning; her former owner was prosecuted and banned from keeping animals.',
      website_url: 'https://www.tierschutzbund.de',
      founded_year: 1881,
      currency: 'EUR',
      brand_color: '#009640',
    },

    {
      id: nanoid(),
      name: 'Stiftung Lesen',
      description: 'Germany\'s leading reading promotion foundation, fostering literacy and a love of books among children and adults since 1988.',
      category: 'Education',
      icon: '📖',
      country_code: 'DE',
      display_countries: JSON.stringify(['DE']),
      quality_label: null,
      tax_rate: 30,
      loi_coluche_eligible: 0,
      mission: 'Stiftung Lesen exists because literacy is not just a skill but the foundation of equal opportunity, democratic participation, and personal freedom. In Germany, 6.2 million adults struggle with basic reading, and one in five children starts school without having been read to at home. The foundation runs programmes that put books into the hands and homes and waiting rooms and barber shops where children actually are, rather than where adults think they should be. It trains reading mentors, distributes free books, and works with schools, libraries, and businesses to create a culture where every child grows up surrounded by stories.',
      founding_story: 'In 1988, a group of publishers, educators, and media figures in Mainz founded Stiftung Lesen in response to alarming studies showing that German reading habits were declining sharply and that functional illiteracy was far more widespread than anyone had assumed. The founding was deliberately bipartisan -- involving figures from across the political spectrum -- because the founders believed that literacy should be above politics. The foundation\'s first major initiative was distributing free books to first-graders through their schools, a programme that has since become one of the largest of its kind in Europe. The city of Mainz, home of Gutenberg\'s printing press, was a fitting birthplace.',
      impact: JSON.stringify([
        'Distributed 5.1 million free books to children in 2024 through schools, paediatricians, and community partners',
        'Trained 42,000 reading mentors who volunteer in schools, libraries, and refugee shelters across Germany in 2023',
        'Reached 3.8 million children through the national Vorlesetag (Reading Aloud Day), Germany\'s largest reading event, in 2024',
        'Provided reading materials in 14 languages to 180,000 newly arrived refugee children in 2023-2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Puts a brand-new age-appropriate book into the hands of a child who has none at home' },
        { amount: 20, description: 'Trains a volunteer reading mentor who will read aloud to children in a school or shelter for an entire year' },
        { amount: 50, description: 'Stocks a "Leseclub" (reading club) in a disadvantaged neighbourhood school with books, games, and digital materials' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 86, admin_pct: 6, fundraising_pct: 8 }),
      certifications: JSON.stringify([
        { name: 'Gemeinnützige Stiftung (charitable foundation)', year: 1988 },
        { name: 'UNESCO City of Literature partner', year: 2017 },
        { name: 'Federal President patronage', year: 1988 }
      ]),
      milestones: JSON.stringify([
        { year: 1988, title: 'Founded in Mainz', description: 'Publishers, educators, and media figures created Germany\'s reading promotion foundation in Gutenberg\'s city' },
        { year: 2004, title: 'Lesestart programme', description: 'Launched the national early childhood reading programme distributing free book sets through paediatricians' },
        { year: 2013, title: 'National Reading Pact', description: 'Signed the first national agreement with all 16 Bundesländer to coordinate reading promotion across Germany' },
        { year: 2015, title: 'Refugee literacy programme', description: 'Created multilingual reading materials and mentor training for newly arrived refugee children' },
        { year: 2024, title: '1 million reading mentors', description: 'Reached the cumulative milestone of having trained over one million volunteer reading mentors since founding' }
      ]),
      jurisdictions_eligible: JSON.stringify(['DE']),
      cross_border_method: 'none',
      story: 'Seven-year-old Ahmad arrived in Hamburg from Syria speaking no German and terrified of school. A Stiftung Lesen volunteer named Brigitte came to his classroom once a week with picture books, sitting beside him and reading aloud while pointing at the illustrations. Within three months, Ahmad was picking up books on his own, sounding out German words and giggling at the pictures. By the end of the school year, he had become the class\'s most enthusiastic reader and insisted on being the one to read aloud to the kindergartners next door -- in German, with a Hamburg accent he\'d picked up from Brigitte.',
      website_url: 'https://www.stiftunglesen.de',
      founded_year: 1988,
      currency: 'EUR',
      brand_color: '#E30613',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SPAIN (6 + Amnistía Internacional from international)
    // ═══════════════════════════════════════════════════════════════════════

    {
      id: nanoid(),
      name: 'AECC (Asociación Española Contra el Cáncer)',
      description: 'Spain\'s leading cancer charity, funding research, supporting patients, and raising awareness since 1953.',
      category: 'Health',
      icon: '🎗️',
      country_code: 'ES',
      display_countries: JSON.stringify(['ES']),
      quality_label: 'Fundación Lealtad',
      tax_rate: 80,
      loi_coluche_eligible: 0,
      mission: 'The AECC is Spain\'s largest and oldest cancer charity, combining ground-breaking research funding with the most extensive network of patient and family support in the country. With a presence in every Spanish province, it provides free psychological counselling, home care, and legal advice to anyone affected by cancer, regardless of their economic situation. Its research arm, the AECC Scientific Foundation, funds some of Spain\'s most promising oncology scientists, while its volunteers -- many of them cancer survivors -- provide the human connection that no medical treatment can replace.',
      founding_story: 'In 1953, when cancer was barely discussed in Spanish society and patients were often not even told their diagnosis, a group of doctors and concerned citizens in Madrid decided that silence was the enemy. They founded the AECC to break the taboo, fund research, and ensure that cancer patients had someone in their corner. In Franco\'s Spain, where public health was underfunded and civil society weak, this act of civic initiative was quietly radical. The organisation grew slowly through the dictatorship and then rapidly after the democratic transition, building a provincial network that means no cancer patient in Spain is more than a phone call away from free help.',
      impact: JSON.stringify([
        'Funded 428 cancer research projects with a total investment of 98 million euros since 2015',
        'Provided free psychological support to 142,000 patients and family members in 2024',
        'Operated the 24-hour Infocáncer helpline, handling 86,000 calls in 2023',
        'Sent 12,000 home care volunteers to accompany patients through treatment across all 52 provinces in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds a free psychological counselling session for a cancer patient or family member at a local AECC office' },
        { amount: 20, description: 'Contributes to a day of cancer research at the AECC Scientific Foundation, advancing new treatment approaches' },
        { amount: 50, description: 'Provides a month of free home care visits to an elderly cancer patient living alone during chemotherapy' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 82, admin_pct: 8, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'Fundación Lealtad seal', year: 2008 },
        { name: 'Declarada de utilidad pública', year: 1970 },
        { name: 'OECI member', year: 2005 }
      ]),
      milestones: JSON.stringify([
        { year: 1953, title: 'Founded in Madrid', description: 'Created to break the taboo around cancer in Spanish society and provide support to patients' },
        { year: 1971, title: 'Scientific Foundation created', description: 'Established a dedicated research arm that has since funded over 400 oncology research projects' },
        { year: 2003, title: 'Provincial network complete', description: 'Achieved presence in all 52 Spanish provinces, ensuring nationwide patient access to free support' },
        { year: 2018, title: 'Todos Contra el Cáncer campaign', description: 'Launched Spain\'s largest cancer awareness campaign, reaching 40 million people through media partnerships' },
        { year: 2024, title: 'Record research funding', description: 'Committed 34 million euros to cancer research in a single year, the highest in the organisation\'s history' }
      ]),
      jurisdictions_eligible: JSON.stringify(['ES']),
      cross_border_method: 'none',
      story: 'When Carmen García, a 58-year-old schoolteacher from Sevilla, was diagnosed with ovarian cancer, her daughter Isabel called the AECC helpline in tears at midnight, not knowing where to turn. The counsellor on the line not only calmed her down but connected the family with a local psychologist, a home care volunteer named Pilar, and a patient support group. Pilar visited Carmen every Thursday for the seven months of treatment, bringing homemade gazpacho and the companionship of someone who had been through the same journey herself. Carmen is now in remission and volunteers alongside Pilar, visiting other patients with a thermos of gazpacho.',
      website_url: 'https://www.contraelcancer.es',
      founded_year: 1953,
      currency: 'EUR',
      brand_color: '#00A651',
    },

    {
      id: nanoid(),
      name: 'Greenpeace España',
      description: 'The Spanish branch of the global environmental movement, campaigning against pollution, overfishing, and climate destruction.',
      category: 'Environment',
      icon: '🌊',
      country_code: 'ES',
      display_countries: JSON.stringify(['ES']),
      quality_label: null,
      tax_rate: 80,
      loi_coluche_eligible: 0,
      mission: 'Greenpeace España fights to protect Spain\'s extraordinary natural heritage -- from the Mediterranean coastline disappearing under concrete to the Canary Islands\' marine ecosystems threatened by oil exploration. It accepts no government or corporate funding, relying on 130,000 individual supporters to fund investigations, direct actions, and legal challenges. Spain\'s particular environmental battles -- coastal overdevelopment, water scarcity, industrial agriculture\'s impact on aquifers, and the devastating effects of wildfires amplified by climate change -- make the local office\'s work distinct from the global brand, deeply rooted in Iberian realities.',
      founding_story: 'Greenpeace España opened in 1984, during the transition to democracy, when Spaniards were discovering that environmental protection had been almost entirely absent from Franco-era governance. The first campaign targeted the planned dumping of nuclear waste in the Atlantic off the Galician coast, bringing international attention to an issue that the young democracy was trying to sweep aside. The Spanish office quickly developed its own identity, driven by Mediterranean environmental concerns -- coastal urbanization, overfishing, water privatization -- while drawing on the global network\'s scientific expertise and talent for dramatic, media-friendly direct actions.',
      impact: JSON.stringify([
        'Campaigns contributed to Spain closing its last coal power plants, with the final closure confirmed for 2025',
        'Documented illegal construction on 1,200 km of protected Spanish coastline, leading to 84 demolition orders in 2022-2024',
        'Blocked the expansion of industrial pig farming permits in five provinces through legal challenges in 2023',
        'Investigations exposed illegal overfishing by 47 vessels in the Mediterranean, leading to EU enforcement action in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds drone surveillance of a protected coastline, detecting illegal construction before it becomes permanent' },
        { amount: 20, description: 'Supports a day of water quality testing at industrial farming sites suspected of contaminating aquifers' },
        { amount: 50, description: 'Contributes to legal costs for a court challenge blocking an environmentally damaging industrial project' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 77, admin_pct: 10, fundraising_pct: 13 }),
      certifications: JSON.stringify([
        { name: 'Declarada de utilidad pública', year: 2002 },
        { name: 'Fundraising Transparency Certificate', year: 2015 },
        { name: 'Greenpeace International member', year: 1984 }
      ]),
      milestones: JSON.stringify([
        { year: 1984, title: 'Spanish office founded', description: 'Opened during the democratic transition, with the first campaign against Atlantic nuclear waste dumping' },
        { year: 2002, title: 'Prestige oil spill response', description: 'Led the environmental response and cleanup advocacy after the Prestige tanker disaster off Galicia' },
        { year: 2013, title: 'Coastal destruction report', description: 'Published the landmark "Destrucción a Toda Costa" report documenting illegal coastal urbanization nationwide' },
        { year: 2021, title: 'Coal phase-out', description: 'Successfully campaigned for Spain\'s accelerated coal plant closure timeline' },
        { year: 2024, title: 'Macro-farm moratorium', description: 'Legal victories contributed to regional moratoriums on new industrial pig farming operations in three communities' }
      ]),
      jurisdictions_eligible: JSON.stringify(['ES']),
      cross_border_method: 'none',
      story: 'When fisherman Jordi Mas noticed that the posidonia seagrass meadows near his village in Mallorca were being destroyed by illegal yacht anchoring in a protected zone, he reported it to Greenpeace España. The team spent a summer documenting the damage with underwater cameras and GPS tracking of anchored vessels, producing a report that went viral in Spanish media. The Balearic government responded by installing permanent mooring buoys and increasing patrol boats, and Jordi\'s stretch of coast has seen the posidonia regenerating, bringing back the fish populations his family has depended on for three generations.',
      website_url: 'https://www.greenpeace.org/spain',
      founded_year: 1984,
      currency: 'EUR',
      brand_color: '#66CC33',
    },

    {
      id: nanoid(),
      name: 'Cáritas España',
      description: 'The social action arm of the Catholic Church in Spain, providing direct aid to the most vulnerable and advocating against poverty and exclusion.',
      category: 'Humanitarian',
      icon: '❤️',
      country_code: 'ES',
      display_countries: JSON.stringify(['ES']),
      quality_label: 'Fundación Lealtad',
      tax_rate: 80,
      loi_coluche_eligible: 0,
      mission: 'Cáritas España is the largest social action organization in Spain, reaching people that the welfare state misses: undocumented migrants, families one paycheck away from homelessness, elderly people living alone without adequate pensions, and young people trapped in cycles of precarious employment. While it is the social arm of the Catholic Church, its doors are open to everyone regardless of belief. Its network of 85,000 volunteers operates in every parish in Spain, giving it a capillary presence in communities that no government agency can match. Cáritas sees poverty not as an individual failure but as a structural injustice, and it says so publicly, even when that makes powerful people uncomfortable.',
      founding_story: 'Cáritas was officially constituted in Spain in 1947, during the years of hunger and deprivation that followed the Civil War, when the Catholic Church organized food and clothing distribution to a devastated population. For decades it functioned primarily as a charity -- distributing surplus American food aid and clothing. The transformation came in the 1960s and 1970s, when a new generation of clergy and lay workers influenced by liberation theology reimagined Cáritas as an instrument of social justice, not just charity. The organisation began publishing poverty reports, advocating for policy changes, and speaking out against the social causes of destitution, evolving from a food pantry into Spain\'s most authoritative voice on poverty and exclusion.',
      impact: JSON.stringify([
        'Assisted 1.9 million people through direct social services across 70 dioceses in 2024',
        'Provided emergency housing and homelessness prevention to 124,000 people in 2023',
        'Distributed 78 million euros in direct economic aid to families in crisis in 2024',
        'Offered employment support and vocational training to 215,000 people seeking work in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides emergency food supplies for a family of three for two days through a parish distribution centre' },
        { amount: 20, description: 'Funds a week of emergency housing for a person at risk of sleeping on the street' },
        { amount: 50, description: 'Covers a month of vocational training and job placement support for a long-term unemployed person' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 87, admin_pct: 5, fundraising_pct: 8 }),
      certifications: JSON.stringify([
        { name: 'Fundación Lealtad seal', year: 2006 },
        { name: 'Declarada de utilidad pública', year: 1968 },
        { name: 'Caritas Internationalis member', year: 1947 }
      ]),
      milestones: JSON.stringify([
        { year: 1947, title: 'Constituted in Spain', description: 'Organised the Catholic Church\'s social response to post-Civil War hunger and deprivation' },
        { year: 1978, title: 'Transformation to social justice', description: 'Evolved from pure charity to structural poverty analysis and advocacy during Spain\'s democratic transition' },
        { year: 2008, title: 'Financial crisis response', description: 'Doubled its assistance during Spain\'s economic crisis, reaching families who had never needed help before' },
        { year: 2018, title: 'FOESSA poverty report', description: 'Published the landmark VIII FOESSA Report, the most comprehensive analysis of poverty in Spain ever produced' },
        { year: 2024, title: 'Housing emergency programme', description: 'Launched an expanded housing programme in response to Spain\'s escalating rental crisis' }
      ]),
      jurisdictions_eligible: JSON.stringify(['ES']),
      cross_border_method: 'none',
      story: 'When the pandemic hit, Raúl Jiménez, a 42-year-old construction worker in Valencia, lost his job and his landlord began eviction proceedings within two months. A Cáritas social worker named Ana intervened to negotiate a rent payment plan, provided food parcels for Raúl and his teenage daughter, and enrolled him in a welding certification course. Six months later, Raúl was working at a shipyard with a stable contract, and his daughter had won a Cáritas-funded scholarship for her final year of bachillerato. Raúl now donates 20 euros a month to Cáritas -- exactly the amount of his first food parcel.',
      website_url: 'https://www.caritas.es',
      founded_year: 1947,
      currency: 'EUR',
      brand_color: '#C8102E',
    },

    {
      id: nanoid(),
      name: 'Aldeas Infantiles SOS',
      description: 'Part of the global SOS Children\'s Villages network, providing family-based care and education to vulnerable children across Spain.',
      category: 'Children',
      icon: '🏠',
      country_code: 'ES',
      display_countries: JSON.stringify(['ES']),
      quality_label: 'Fundación Lealtad',
      tax_rate: 80,
      loi_coluche_eligible: 0,
      mission: 'Aldeas Infantiles SOS provides what every child needs and too many lack: a stable, loving family. For children who cannot live with their biological families due to abuse, neglect, or crisis, Aldeas creates family-like homes where SOS mothers and caregivers raise small groups of siblings together, providing the continuity and emotional security that institutional care cannot. Beyond its villages, Aldeas runs family strengthening programmes that help at-risk families stay together, youth programmes that support teenagers transitioning to independence, and emergency response for children caught in crises.',
      founding_story: 'In 1949, Austrian medical student Hermann Gmeiner used his modest war disability pension to build the first SOS Children\'s Village in Imst, Austria, for orphans of World War II. His revolutionary insight was that children don\'t need institutions; they need families. Instead of dormitories and wardens, Gmeiner created houses with a mother figure and a small group of children who grew up as siblings. The model came to Spain in 1967, when the first Aldea Infantil SOS opened in Barcelona. Gmeiner, who was nominated for the Nobel Peace Prize but never won it, died in 1986 having created the world\'s largest non-governmental childcare organisation, operating in 137 countries.',
      impact: JSON.stringify([
        'Provided direct care and family strengthening support to 32,400 children and young people in Spain in 2024',
        'Operated 8 SOS Villages, 5 youth facilities, and 32 family strengthening programmes across Spain',
        'Supported 14,600 at-risk families to stay together and avoid child separation through prevention programmes in 2023',
        '87% of young people who aged out of Aldeas care were in employment or education within one year in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides a day of nutritious meals and after-school tutoring for a child in an SOS family home' },
        { amount: 20, description: 'Funds a week of family strengthening workshops helping an at-risk family stay together and avoid child separation' },
        { amount: 50, description: 'Supports a month of independent living preparation for a teenager aging out of care, including housing and mentorship' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 84, admin_pct: 6, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'Fundación Lealtad seal', year: 2005 },
        { name: 'Declarada de utilidad pública', year: 1981 },
        { name: 'SOS Children\'s Villages International member', year: 1967 }
      ]),
      milestones: JSON.stringify([
        { year: 1967, title: 'First Spanish village in Barcelona', description: 'Opened the first Aldea Infantil SOS in Spain, bringing Hermann Gmeiner\'s family-based care model to Iberia' },
        { year: 1981, title: 'Declared of public utility', description: 'The Spanish government formally recognised Aldeas Infantiles as a public interest institution' },
        { year: 2005, title: 'Family strengthening programmes', description: 'Shifted from purely residential care to prevention, helping vulnerable families stay together' },
        { year: 2018, title: 'Youth independence programme', description: 'Launched comprehensive support for young people aging out of care, addressing Spain\'s high youth unemployment' },
        { year: 2024, title: 'Digital inclusion initiative', description: 'Ensured every child in Aldeas care had access to a personal device and digital skills training' }
      ]),
      jurisdictions_eligible: JSON.stringify(['ES']),
      cross_border_method: 'tge',
      story: 'When Social Services removed five-year-old twins Lucía and Marcos from a home where they faced severe neglect, the children were placed in separate institutional centres because no single foster family could take both. An Aldeas SOS mother named Marisol took both children into her home in the Valencia village, keeping the siblings together. Over two years, the twins -- who arrived unable to speak in full sentences and terrified of adults -- blossomed into confident, chatty children who called Marisol "Mama Sol." Lucía now wants to be a doctor, and Marcos insists he\'ll be a firefighter, and they still share a room because neither wants to be without the other.',
      website_url: 'https://www.aldeasinfantiles.es',
      founded_year: 1967,
      currency: 'EUR',
      brand_color: '#E30613',
    },

    {
      id: nanoid(),
      name: 'Fundación Affinity',
      description: 'Spain\'s leading animal welfare foundation, promoting responsible pet adoption and fighting abandonment through education and shelters.',
      category: 'Animals',
      icon: '🐕‍🦺',
      country_code: 'ES',
      display_countries: JSON.stringify(['ES']),
      quality_label: 'Fundación Lealtad',
      tax_rate: 80,
      loi_coluche_eligible: 0,
      mission: 'Fundación Affinity fights to end the abandonment of companion animals in Spain, a country that for decades had one of the highest pet abandonment rates in Europe. It attacks the problem from every angle: running adoption campaigns, educating children about responsible pet ownership, producing Spain\'s authoritative annual study on animal abandonment, and promoting the human-animal bond through therapy programmes in hospitals, prisons, and care homes. Its approach is based on the belief that if people understood the depth of the bond between humans and animals, they would find abandonment as unthinkable as abandoning a family member.',
      founding_story: 'In 1987, pet food company Affinity Petcare created the foundation out of genuine distress at the scale of animal abandonment in Spain, where over 300,000 dogs and cats were being abandoned every year. The early sceptics -- who saw it as mere corporate social responsibility -- were proved wrong as the foundation developed genuine independence, publishing unflinching research that sometimes embarrassed the pet industry and Spanish society alike. Its annual "Estudio Fundación Affinity" became the most-cited source on animal abandonment in Spain, and its "Ningún Animal Sin Hogar" (No Animal Without a Home) campaign became one of the most recognised social campaigns in the country.',
      impact: JSON.stringify([
        'Published 37 annual studies on animal abandonment, providing the data basis for Spain\'s animal welfare legislation',
        'Promoted the adoption of 580,000 animals through campaigns and shelter partnerships since founding',
        'Reached 2.1 million children through school-based animal welfare education programmes in 2024',
        'Operated 48 animal-assisted therapy programmes in hospitals, prisons, and care homes in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Provides educational materials about responsible pet ownership to a classroom of 30 children' },
        { amount: 20, description: 'Funds a week of animal-assisted therapy sessions at a hospital or elderly care home' },
        { amount: 50, description: 'Supports the veterinary care and rehoming process for an abandoned dog, from rescue to new family' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 83, admin_pct: 7, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'Fundación Lealtad seal', year: 2010 },
        { name: 'Fundación registrada', year: 1987 },
        { name: 'European Animal Welfare Platform member', year: 2009 }
      ]),
      milestones: JSON.stringify([
        { year: 1987, title: 'Foundation established', description: 'Created to combat Spain\'s epidemic of companion animal abandonment through research, education, and advocacy' },
        { year: 1999, title: 'First abandonment study', description: 'Published the first comprehensive national study on why Spaniards abandon their pets, becoming the authoritative reference' },
        { year: 2008, title: 'Animal-assisted therapy', description: 'Launched therapy programmes bringing trained animals into hospitals and care homes across Spain' },
        { year: 2019, title: 'Animals in schools programme', description: 'Introduced a national curriculum-linked programme teaching children empathy through animal welfare education' },
        { year: 2023, title: 'New animal welfare law', description: 'Foundation research was central to Spain\'s landmark Ley de Protección de los Derechos y el Bienestar de los Animales' }
      ]),
      jurisdictions_eligible: JSON.stringify(['ES']),
      cross_border_method: 'none',
      story: 'In a care home in Zaragoza, 89-year-old Dolores hadn\'t spoken a complete sentence in three months, her dementia having gradually stolen her words. When a Fundación Affinity therapy dog named Nube -- a gentle golden retriever -- was placed on her lap during a weekly visit, Dolores looked into the dog\'s eyes and said, clearly and perfectly: "Qué bonita eres, mi niña" -- how beautiful you are, my girl. The caregivers wept, and Nube became a weekly fixture, arriving every Thursday to sit with Dolores, who always remembered the dog\'s name even when she forgot her own grandchildren\'s.',
      website_url: 'https://www.fundacion-affinity.org',
      founded_year: 1987,
      currency: 'EUR',
      brand_color: '#00B5E2',
    },

    {
      id: nanoid(),
      name: 'Fundación ONCE',
      description: 'Spain\'s leading disability inclusion foundation, creating employment, education, and accessibility opportunities for people with disabilities.',
      category: 'Education',
      icon: '♿',
      country_code: 'ES',
      display_countries: JSON.stringify(['ES']),
      quality_label: 'Fundación Lealtad',
      tax_rate: 80,
      loi_coluche_eligible: 0,
      mission: 'Fundación ONCE exists to ensure that disability is not a barrier to a full life in Spain. It funds job training and employment for people with disabilities, promotes accessibility in buildings and digital spaces, awards university scholarships, and supports technological innovation that makes everyday life possible for the 4.3 million Spaniards with some form of disability. What makes it unique is its funding model: it is financed by the ONCE lottery, which is itself run by blind and visually impaired people, meaning that people with disabilities are not just the beneficiaries but the architects and funders of their own inclusion.',
      founding_story: 'In 1938, during the Spanish Civil War, the Organización Nacional de Ciegos Españoles (ONCE) was created to give blind people economic independence through a national lottery. For fifty years, the blind vendedores selling cupones on street corners became one of Spain\'s most recognisable sights. In 1988, flush with lottery revenue and recognising that visual impairment was just one of many disabilities, ONCE created the Fundación ONCE to extend the same model of self-determination to all people with disabilities. The foundation was built on the radical premise that charity and pity were the enemy: what disabled people needed was not handouts but jobs, skills, and an accessible society.',
      impact: JSON.stringify([
        'Created 142,000 jobs for people with disabilities through training and employer partnerships since founding',
        'Funded 18,400 university scholarships for students with disabilities across Spain in 2024',
        'Invested 93 million euros in accessibility improvements to buildings, transport, and digital platforms in 2023',
        'Supported 3,200 tech startups and innovation projects focused on disability inclusion since 2015'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Contributes to assistive technology for a student with a disability, such as screen readers or adapted input devices' },
        { amount: 20, description: 'Funds a week of vocational training for a person with a disability preparing for employment' },
        { amount: 50, description: 'Supports a university scholarship for a student with a disability for one month, covering tuition and materials' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 86, admin_pct: 6, fundraising_pct: 8 }),
      certifications: JSON.stringify([
        { name: 'Fundación Lealtad seal', year: 2009 },
        { name: 'European Disability Forum member', year: 1996 },
        { name: 'UN CRPD implementation partner', year: 2008 }
      ]),
      milestones: JSON.stringify([
        { year: 1988, title: 'Foundation created', description: 'ONCE extended its model of self-determination from blind people to all people with disabilities in Spain' },
        { year: 2003, title: 'Inserta Empleo', description: 'Launched Spain\'s largest disability employment service, placing thousands annually in quality jobs' },
        { year: 2007, title: 'Universal accessibility law', description: 'Foundation advocacy contributed to Spain\'s landmark law on equal opportunities and non-discrimination' },
        { year: 2015, title: 'Tech innovation fund', description: 'Created a dedicated fund for startups developing assistive and inclusive technology' },
        { year: 2024, title: 'Digital accessibility milestone', description: 'Certified 500 Spanish websites and apps as fully accessible to people with visual, hearing, and motor disabilities' }
      ]),
      jurisdictions_eligible: JSON.stringify(['ES']),
      cross_border_method: 'none',
      story: 'María José Rodríguez, born with cerebral palsy, was told by three employment agencies that she was "unemployable" before she walked into a Fundación ONCE Inserta Empleo office in Madrid. A job coach named Carlos spent four months working with her on interview skills, adapted her CV to highlight her computing qualifications, and negotiated workplace accommodations with potential employers. María José was hired as a data analyst at a logistics company, where she has since been promoted twice. She now mentors other young people with disabilities through the same Inserta programme, telling each one: "The only person who gets to decide what you can do is you."',
      website_url: 'https://www.fundaciononce.es',
      founded_year: 1988,
      currency: 'EUR',
      brand_color: '#004B87',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BELGIUM (3 national + 4 international shared)
    // ═══════════════════════════════════════════════════════════════════════

    {
      id: nanoid(),
      name: 'Kom op tegen Kanker',
      description: 'Flanders\' leading cancer charity, funding research and patient support while advocating for cancer prevention across Belgium.',
      category: 'Health',
      icon: '🎗️',
      country_code: 'BE',
      display_countries: JSON.stringify(['BE']),
      quality_label: 'Donorinfo verified',
      tax_rate: 30,
      loi_coluche_eligible: 0,
      mission: 'Kom op tegen Kanker (Stand Up to Cancer) is the largest cancer charity in Flanders and a leading voice in Belgian cancer policy. It funds cutting-edge research, provides financial and emotional support to patients and their families, and campaigns for structural changes in cancer prevention -- from stricter regulation of carcinogens to better screening programmes. Its annual television fundraiser, "De Warmste Week," has become one of the biggest cultural events in Flanders, turning cancer solidarity into a shared communal experience. The organisation operates on the principle that cancer is not just a medical problem but a social one, and that beating it requires society-wide mobilization.',
      founding_story: 'In 1983, the Vlaamse Liga tegen Kanker (Flemish League Against Cancer) was reorganized and rebranded with a new mandate: to be not just a fundraising body but an active force in cancer research, patient care, and prevention. The transformation was driven by oncologist Marc Peeters and a group of patient advocates who believed that Flanders needed its own cancer institution -- one that understood the specific needs of Dutch-speaking Belgium and could operate independently of the federal health bureaucracy. The annual "Levensloop" (Relay for Life) events, adapted from the American Cancer Society model, became the foundation\'s signature, turning cancer fundraising from envelope donations into community-wide celebrations of survivorship.',
      impact: JSON.stringify([
        'Invested 38 million euros in cancer research across Flemish universities and hospitals in 2024',
        'Provided free psychosocial support to 64,000 patients and family members in 2023',
        'De Warmste Week fundraiser generated 18.7 million euros in a single week in December 2024',
        'Successfully lobbied for Belgium\'s national HPV vaccination programme, expected to prevent 1,200 cancers annually'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds a session of the free cancer information phone line, where nurses answer patients\' treatment questions' },
        { amount: 20, description: 'Contributes to a day of laboratory research on personalised cancer treatment at a Flemish university' },
        { amount: 50, description: 'Provides a month of free psychological support for a family navigating a cancer diagnosis together' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 83, admin_pct: 7, fundraising_pct: 10 }),
      certifications: JSON.stringify([
        { name: 'Donorinfo verified', year: 2010 },
        { name: 'Erkende organisatie (recognised by Flemish government)', year: 1983 },
        { name: 'European Cancer Leagues member', year: 1990 }
      ]),
      milestones: JSON.stringify([
        { year: 1983, title: 'Reorganised and relaunched', description: 'Transformed from a traditional fundraising body into an active research, care, and advocacy organisation' },
        { year: 2000, title: 'First Levensloop event', description: 'Adapted the Relay for Life model, creating Belgium\'s largest community cancer fundraising events' },
        { year: 2012, title: 'De Warmste Week partnership', description: 'Began the annual partnership with VRT radio, making the winter fundraiser a Flemish cultural phenomenon' },
        { year: 2020, title: 'HPV vaccination campaign', description: 'Successfully advocated for a national HPV vaccination programme for all adolescents regardless of gender' },
        { year: 2024, title: 'Record research funding', description: 'Committed 38 million euros to cancer research, the highest annual investment in the organisation\'s history' }
      ]),
      jurisdictions_eligible: JSON.stringify(['BE']),
      cross_border_method: 'none',
      story: 'When Flemish schoolteacher Liesbeth Van den Berg was diagnosed with breast cancer at 36, she felt most alone not during treatment but in the weeks after, when everyone assumed she was "back to normal" but she was still exhausted and frightened. A Kom op tegen Kanker patient navigator connected her with a support group of young women who met monthly in a café in Leuven to share the things they couldn\'t tell their families. Liesbeth found the group transformative -- "They understood that \'cured\' and \'fine\' are not the same thing," she says -- and now facilitates the same group for newly diagnosed women, keeping the empty chair at the table for whoever needs it next.',
      website_url: 'https://www.komoptegenkankter.be',
      founded_year: 1983,
      currency: 'EUR',
      brand_color: '#E3007A',
    },

    {
      id: nanoid(),
      name: 'GAIA',
      description: 'Belgium\'s most active animal rights organization, campaigning against factory farming, fur, and animal testing through investigation and advocacy.',
      category: 'Animals',
      icon: '🐄',
      country_code: 'BE',
      display_countries: JSON.stringify(['BE']),
      quality_label: null,
      tax_rate: 30,
      loi_coluche_eligible: 0,
      mission: 'GAIA -- the Global Action in the Interest of Animals -- is Belgium\'s most vocal and effective animal rights organization. Where other groups negotiate quietly, GAIA investigates, films, publishes, and campaigns with a media-savvy ferocity that has made it impossible for Belgian politicians to ignore animal welfare. Its undercover investigations of factory farms and slaughterhouses have repeatedly shocked the Belgian public, and its lobbying has secured some of Europe\'s strongest regional animal welfare laws. GAIA operates on the belief that visibility creates accountability: when people see how animals are treated, they demand change.',
      founding_story: 'In 1992, Belgian animal rights activist Michel Vandenbosch founded GAIA after spending years frustrated by the slow pace of traditional animal welfare advocacy. Vandenbosch believed that polite lobbying alone would never end factory farming or animal testing; what was needed was a combination of rigorous investigation, dramatic public campaigns, and relentless media pressure. GAIA\'s early undercover investigations of Belgian livestock markets and fur farms generated national headlines and outrage, proving Vandenbosch\'s theory that the public would care if they could see. The organisation quickly became the most influential animal rights voice in Belgium, feared by industry and respected by lawmakers.',
      impact: JSON.stringify([
        'Undercover investigations led to the closure of 34 illegal or substandard animal operations in Belgium in 2022-2024',
        'Campaigning secured the Walloon ban on fur farming (2015), the Flanders ban (2023), and the Brussels ban (2025)',
        'Successfully lobbied for mandatory CCTV in all Belgian slaughterhouses, enacted in Flanders in 2017',
        'Generated 12,000 cruelty complaints to authorities and secured 480 prosecutions in 2023'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Funds the analysis of one undercover investigation clip, documenting animal welfare violations for legal proceedings' },
        { amount: 20, description: 'Supports a day of lobbying meetings with members of parliament on animal welfare legislation' },
        { amount: 50, description: 'Finances a full undercover investigation at a suspected facility, including equipment, travel, and legal review' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 79, admin_pct: 9, fundraising_pct: 12 }),
      certifications: JSON.stringify([
        { name: 'ASBL/VZW registered', year: 1992 },
        { name: 'Eurogroup for Animals member', year: 1995 },
        { name: 'Fur Free Alliance member', year: 2000 }
      ]),
      milestones: JSON.stringify([
        { year: 1992, title: 'Founded by Michel Vandenbosch', description: 'Created to bring investigative journalism tactics to animal rights advocacy in Belgium' },
        { year: 2015, title: 'Walloon fur farming ban', description: 'Successful campaign made Wallonia the first Belgian region to ban fur farming' },
        { year: 2017, title: 'Slaughterhouse CCTV', description: 'Flanders became one of the first regions in Europe to require cameras in all slaughterhouses after GAIA investigations' },
        { year: 2023, title: 'Flanders fur ban', description: 'Flanders followed Wallonia in banning fur farming, effectively ending the practice in most of Belgium' },
        { year: 2024, title: 'Cage-free campaign', description: 'Launched the campaign to ban all cage farming in Belgium by 2027, gaining cross-party parliamentary support' }
      ]),
      jurisdictions_eligible: JSON.stringify(['BE']),
      cross_border_method: 'none',
      story: 'A GAIA investigator spent three nights secretly filming inside a pig farm in West Flanders where hundreds of sows were confined in gestation crates so small they couldn\'t turn around. The footage, broadcast on VRT\'s Panorama programme, showed pigs with untreated wounds and pressure sores, some barely able to stand. The resulting public outrage led to an official inspection, the farm\'s licence being revoked, and all 600 pigs being transferred to farms with higher welfare standards. The investigation contributed directly to the Flemish parliament\'s vote to accelerate the phase-out of gestation crates across the region.',
      website_url: 'https://www.gaia.be',
      founded_year: 1992,
      currency: 'EUR',
      brand_color: '#00A651',
    },

    {
      id: nanoid(),
      name: 'King Baudouin Foundation',
      description: 'Belgium\'s largest independent philanthropic foundation, supporting social justice, health, education, and civic engagement since 1976.',
      category: 'Education',
      icon: '👑',
      country_code: 'BE',
      display_countries: JSON.stringify(['BE']),
      quality_label: 'Donorinfo verified',
      tax_rate: 30,
      loi_coluche_eligible: 0,
      mission: 'The King Baudouin Foundation is Belgium\'s largest and most respected philanthropic institution, working to improve the lives of citizens through grants, research, and partnerships across an extraordinarily wide range of causes: poverty reduction, health equity, education access, civic participation, cultural heritage, and international development. It operates as a kind of national social laboratory, identifying emerging problems before they become crises and testing innovative solutions that government can then scale. In a small, linguistically divided country, the Foundation is one of the few institutions trusted equally by Flemish, Francophone, and German-speaking communities.',
      founding_story: 'In 1976, to celebrate the 25th anniversary of King Baudouin\'s accession to the Belgian throne, a foundation was created in his name with a mission to serve the common good. King Baudouin, known for his personal modesty and deep concern for social justice, insisted that the foundation should not be a monument to him but a working institution that tackled real problems. He was particularly passionate about poverty, disability, and the integration of migrant communities -- issues that were deeply personal to a king who had renounced his powers for a day rather than sign Belgium\'s abortion law, demonstrating a conscience-driven approach that the Foundation inherited. After his death in 1993, the Foundation expanded significantly, becoming the backbone of Belgian philanthropy.',
      impact: JSON.stringify([
        'Distributed 42 million euros in grants across 2,800 social projects in Belgium and internationally in 2024',
        'Managed 1,800 named funds and foundations on behalf of individual donors, totalling 2.4 billion euros in assets',
        'Funded 340 health equity projects addressing disparities in access to care across Belgian communities in 2023',
        'Supported 12,000 scholarships for students from disadvantaged backgrounds in Belgium in 2024'
      ]),
      how_your_money_helps: JSON.stringify([
        { amount: 5, description: 'Contributes to a scholarship fund providing school materials for a student from a low-income Belgian family' },
        { amount: 20, description: 'Funds a community health project addressing healthcare access barriers for migrant families in Belgium' },
        { amount: 50, description: 'Supports a month of an innovative social inclusion pilot project being tested before scaling nationally' }
      ]),
      financial_transparency: JSON.stringify({ programs_pct: 84, admin_pct: 8, fundraising_pct: 8 }),
      certifications: JSON.stringify([
        { name: 'Donorinfo verified', year: 2005 },
        { name: 'Stichting van openbaar nut (Foundation of public utility)', year: 1976 },
        { name: 'European Foundation Centre member', year: 1989 }
      ]),
      milestones: JSON.stringify([
        { year: 1976, title: 'Created for King Baudouin\'s jubilee', description: 'Established to mark 25 years of the king\'s reign, with a mandate to serve the common good of all Belgians' },
        { year: 1993, title: 'Post-Baudouin expansion', description: 'After the king\'s death, the Foundation expanded significantly, becoming Belgium\'s central philanthropic institution' },
        { year: 2008, title: 'Financial crisis response', description: 'Rapidly deployed emergency grants to Belgian families affected by the economic crisis' },
        { year: 2015, title: 'Migration and integration fund', description: 'Launched Belgium\'s largest private initiative supporting the integration of newly arrived refugees' },
        { year: 2024, title: 'Climate and social justice', description: 'Created a new programme linking climate action with social equity, addressing energy poverty in Belgium' }
      ]),
      jurisdictions_eligible: JSON.stringify(['BE']),
      cross_border_method: 'none',
      story: 'Fatou Diop, a 19-year-old from Molenbeek whose parents immigrated from Senegal, dreamed of studying medicine but couldn\'t afford the registration fees or textbooks. A King Baudouin Foundation scholarship covered her costs for the first three years, and a Foundation-funded mentoring programme connected her with Dr. Sarah Janssen, a family doctor in the same neighbourhood. Fatou is now in her fourth year of medical studies at ULB and plans to return to Molenbeek as a GP, because, as she told the Foundation\'s annual report: "The neighbourhood that raised me deserves a doctor who looks like it."',
      website_url: 'https://www.kbs-frb.be',
      founded_year: 1976,
      currency: 'EUR',
      brand_color: '#003DA5',
    },
  ];
}

// ─── Auto-run ────────────────────────────────────────────────────────────────

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
