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

const charityData = [
  {
    id: nanoid(),
    name: "Médecins Sans Frontières",
    description: "Independent, impartial medical humanitarian assistance wherever people are threatened by conflict, epidemics, disasters, or exclusion from healthcare.",
    category: "humanitarian",
    icon: "🏥",
    qualityLabel: "Don en Confiance",
    taxRate: 75,
    mission: "Founded in 1971 by French doctors who witnessed the Biafra crisis, MSF broke the silence on humanitarian emergencies and pioneered the principle of témoignage: bearing witness. Today MSF operates in over 70 countries, deploying more than 67,000 staff to deliver emergency surgery, vaccinations, mental health care, and nutrition programmes.\n\nMSF received the Nobel Peace Prize in 1999 for its pioneering humanitarian work. The organisation remains fiercely independent, refusing government funding that could compromise its neutrality. When disaster strikes, MSF teams are often the first to arrive and the last to leave.",
    impact: JSON.stringify([
      "In 2024, MSF treated 11.2 million outpatient cases across 74 countries",
      "Performed 118,400 surgical procedures including emergency and obstetric care",
      "Vaccinated 3.4 million people against measles, meningitis, and cholera",
      "Provided mental health support to 437,000 individuals in conflict zones",
      "Delivered 385,000 babies in MSF facilities worldwide"
    ]),
    crisisEligible: true,
    foundingStory: "In 1968, a group of French doctors volunteered with the Red Cross in Biafra during the Nigerian civil war. They witnessed starvation, massacres, and a blockade that prevented aid from reaching millions. Bound by Red Cross neutrality rules, they could not speak out. This experience haunted them. In 1971, they founded Médecins Sans Frontières with a radical idea: medical teams should go wherever they are needed, and they should never be silent about what they see.",
    howMoneyHelps: JSON.stringify([
      { amount: 1, description: "Provides 10 doses of oral rehydration salts, treating severe dehydration in children" },
      { amount: 7, description: "Funds one full day of treatment for a severely malnourished child" },
      { amount: 30, description: "Supplies a complete emergency surgery kit for field operations" }
    ]),
    milestones: JSON.stringify([
      { year: 1971, title: "MSF Founded", description: "French doctors create an organisation that refuses to stay silent" },
      { year: 1999, title: "Nobel Peace Prize", description: "Recognised for pioneering humanitarian medical work worldwide" },
      { year: 2014, title: "Ebola Response", description: "Largest ever MSF operation, treating over 10,000 Ebola patients in West Africa" },
      { year: 2020, title: "COVID Global Response", description: "Deployed to 40+ countries supporting overwhelmed health systems" },
      { year: 2024, title: "11.2M Patients", description: "Record year of outpatient consultations across 74 countries" }
    ]),
    financialBreakdown: JSON.stringify({ programs: 89, admin: 6, fundraising: 5 }),
    fundraisingEfficiency: "89 cents of every euro goes directly to saving lives in the field",
  },
  {
    id: nanoid(),
    name: "WWF France",
    description: "Protecting biodiversity, restoring ecosystems, and building a future where people and nature thrive across French territories and globally.",
    category: "environment",
    icon: "🐼",
    qualityLabel: "Don en Confiance",
    taxRate: 66,
    mission: "Founded in 1961, WWF is the world's largest conservation organisation, working in over 100 countries with more than 5 million supporters. WWF France focuses on protecting French biodiversity: restoring river ecosystems, creating marine reserves in the Mediterranean, building wildlife corridors in the Alps, and fighting deforestation in French overseas territories.\n\nThe panda logo, one of the most recognised symbols in the world, represents WWF's mission to halt and reverse the destruction of the natural environment. In France, WWF leads campaigns on sustainable food systems, ocean protection, and climate policy.",
    impact: JSON.stringify([
      "Protected 1.2 million hectares of marine habitat around French coastlines and overseas territories",
      "Restored 340 km of river ecosystems in the Loire and Rhône basins",
      "Planted 500,000 trees in degraded forests across French Guiana and mainland France",
      "Campaigned successfully for 30% of French marine waters to be fully protected by 2030",
      "Published the Living Planet Report, tracking 5,230 species populations globally"
    ]),
    crisisEligible: false,
    foundingStory: "In 1961, a group of concerned scientists and conservationists realised that wildlife and habitats were disappearing at an alarming rate. They created the World Wildlife Fund as a fundraising organisation to support conservation work worldwide. The famous panda logo was inspired by Chi Chi, a giant panda at London Zoo, chosen because it was beautiful, endangered, and loved by everyone regardless of language or culture.",
    howMoneyHelps: JSON.stringify([
      { amount: 5, description: "Protects 1 hectare of forest for a month through monitoring and anti-deforestation patrols" },
      { amount: 15, description: "Funds one full day of anti-poaching patrol in a protected marine reserve" },
      { amount: 50, description: "Supports the rescue and rehabilitation of one injured sea turtle" }
    ]),
    milestones: JSON.stringify([
      { year: 1961, title: "WWF Founded", description: "Created to raise funds for global wildlife conservation" },
      { year: 1986, title: "Panda Logo Goes Global", description: "The iconic panda becomes one of the world's most recognised symbols" },
      { year: 2010, title: "Earth Hour", description: "WWF's Earth Hour reaches 128 countries, becoming the largest grassroots environmental movement" },
      { year: 2020, title: "Living Planet Report", description: "Documents a 68% decline in wildlife populations since 1970, galvanising global action" },
      { year: 2024, title: "Marine Protection Milestone", description: "1.2 million hectares of marine habitat protected around French territories" }
    ]),
    financialBreakdown: JSON.stringify({ programs: 82, admin: 10, fundraising: 8 }),
    fundraisingEfficiency: "82 cents of every euro funds conservation programmes protecting nature",
  },
  {
    id: nanoid(),
    name: "Ligue contre le cancer",
    description: "France's leading independent cancer charity since 1918, funding research, supporting patients and families, and leading prevention campaigns nationwide.",
    category: "health",
    icon: "🎗️",
    qualityLabel: "Don en Confiance",
    taxRate: 66,
    mission: "The Ligue contre le cancer is a federation of 103 departmental committees, making it the largest independent cancer charity in France. Founded in 1918, it is entirely independent of pharmaceutical companies, ensuring that its research priorities are driven by patient need, not commercial interest.\n\nThe Ligue funds over 500 research projects annually, provides direct support to patients and their families through its network of volunteers, and leads national prevention campaigns. From screening programmes in rural communities to psychological support for families, the Ligue fights cancer on every front.",
    impact: JSON.stringify([
      "Funded 532 research projects in 2024, making it France's largest non-governmental cancer research funder",
      "Supported 680,000 patients and their families with counselling, financial aid, and information",
      "Trained 12,000 volunteers across France to provide local support and awareness",
      "Led the national campaign for plain tobacco packaging, contributing to a 15% drop in smoking rates",
      "Operates the Cancer Info helpline, answering 45,000 calls per year"
    ]),
    crisisEligible: false,
    foundingStory: "In 1918, as the First World War ended, Justin Godart saw that cancer was silently killing as many French people as the war itself. He founded the Ligue contre le cancer to fight a disease that no one talked about. Over a century later, the Ligue remains the only major French cancer charity that accepts zero pharmaceutical industry funding, ensuring complete independence in its research agenda.",
    howMoneyHelps: JSON.stringify([
      { amount: 10, description: "Funds one hour of laboratory research towards understanding cancer mechanisms" },
      { amount: 25, description: "Provides a psychological support session for a patient or family member" },
      { amount: 100, description: "Funds a cancer screening campaign reaching an underserved rural community" }
    ]),
    milestones: JSON.stringify([
      { year: 1918, title: "Ligue Founded", description: "Justin Godart creates France's first cancer charity as WWI ends" },
      { year: 1956, title: "First Screening Campaign", description: "Pioneers mass cancer screening in France, decades ahead of its time" },
      { year: 2000, title: "Tobacco Victory", description: "Advocacy leads to landmark tobacco control legislation in France" },
      { year: 2018, title: "100 Years", description: "Celebrates a century of independent cancer research and patient support" },
      { year: 2024, title: "532 Research Grants", description: "Largest ever annual research funding commitment" }
    ]),
    financialBreakdown: JSON.stringify({ programs: 78, admin: 12, fundraising: 10 }),
    fundraisingEfficiency: "78 cents of every euro funds cancer research, patient support, and prevention",
  },
  {
    id: nanoid(),
    name: "Restos du Cœur",
    description: "Founded by Coluche in 1985, providing meals, shelter, and social support to people in need. The charity behind the Loi Coluche tax law.",
    category: "humanitarian",
    icon: "❤️",
    qualityLabel: "Don en Confiance",
    taxRate: 75,
    mission: "Les Restos du Cœur were born from a comedian's outrage. In 1985, Coluche, one of France's most beloved entertainers, went on the radio and said: \"I have a little idea. If there are people who are ready to give food, clothing... if there are businesses that are willing to help, call this number.\" Within weeks, thousands responded.\n\nToday, Restos du Cœur distributes over 140 million meals per year through 2,100 centres staffed almost entirely by 73,000 volunteers. Beyond food, they provide housing support, employment assistance, French language classes, and access to culture and holidays. The Loi Coluche, the tax law that gives donors a 75% deduction, was literally named in honour of their founder.",
    impact: JSON.stringify([
      "Distributed 142 million meals in 2024, a 12% increase from the previous year",
      "Helped 1.2 million people through the winter campaign alone",
      "Operated 2,100 distribution centres across every department in France",
      "Provided 43,000 people with housing support and social accompaniment",
      "73,000 volunteers donated their time, making Restos one of France's largest volunteer organisations"
    ]),
    crisisEligible: true,
    foundingStory: "On 26 September 1985, comedian Coluche launched a radio appeal: \"I have a little idea. When there are surpluses of food that go to waste, let us give them to people who have nothing.\" The response was immediate and overwhelming. Coluche used his fame, his humour, and his anger at inequality to build an organisation that would outlive him. He died in a motorcycle accident in 1986, but his Restos du Cœur became a permanent part of French life. The Loi Coluche, passed in 1988, enshrined his belief that generosity should be rewarded by the state.",
    howMoneyHelps: JSON.stringify([
      { amount: 1, description: "Provides 4 balanced meals to people who have no other source of food" },
      { amount: 10, description: "Feeds a family for a full week through the winter distribution network" },
      { amount: 50, description: "Provides a complete winter clothing kit: coat, gloves, scarf, and boots" }
    ]),
    milestones: JSON.stringify([
      { year: 1985, title: "Coluche Founds Restos", description: "A comedian's radio appeal creates France's largest food charity" },
      { year: 1988, title: "Loi Coluche Passed", description: "75% tax deduction law named after Restos' founder, transforming charitable giving in France" },
      { year: 2005, title: "100 Million Meals", description: "Reaches the milestone of serving 100 million meals in a single year" },
      { year: 2020, title: "COVID Response", description: "Meal distribution doubles as pandemic pushes millions into food insecurity" },
      { year: 2024, title: "142M Meals", description: "Record year of food distribution, helping 1.2 million people through winter" }
    ]),
    financialBreakdown: JSON.stringify({ programs: 92, admin: 5, fundraising: 3 }),
    fundraisingEfficiency: "92 cents of every euro goes directly to meals, shelter, and support for people in need",
  },
  {
    id: nanoid(),
    name: "Amnesty International",
    description: "Defending human rights and fighting injustice worldwide through investigation, advocacy, and grassroots campaigns since 1961.",
    category: "rights",
    icon: "✊",
    qualityLabel: null,
    taxRate: 66,
    mission: "Amnesty International began in 1961 when British lawyer Peter Benenson read about two Portuguese students imprisoned for raising a toast to freedom. His newspaper article, \"The Forgotten Prisoners,\" sparked a global movement. Today, Amnesty has over 10 million supporters in 150+ countries.\n\nAmnesty France investigates and documents human rights abuses, campaigns for the release of prisoners of conscience, advocates for fair trials and against torture, and mobilises public pressure on governments that violate fundamental freedoms. The organisation is funded entirely by individual donations, refusing government money to maintain its independence.",
    impact: JSON.stringify([
      "Secured the release or improved conditions of 98 prisoners of conscience in 2024",
      "Published 340 investigative reports documenting abuses in 157 countries",
      "Mobilised 10.7 million supporters worldwide to take action on urgent cases",
      "Campaigned successfully for arms trade treaties protecting civilians in conflict zones",
      "Amnesty France engaged 350,000 French supporters in letter-writing campaigns"
    ]),
    crisisEligible: false,
    foundingStory: "On 28 May 1961, British lawyer Peter Benenson published an article in The Observer titled \"The Forgotten Prisoners.\" He had read about two Portuguese students sentenced to seven years in prison for raising their glasses in a toast to freedom. His outrage became a campaign. Within weeks, thousands of people in dozens of countries wrote letters demanding the students' release. Amnesty International was born from the belief that ordinary people, writing ordinary letters, can hold governments accountable.",
    howMoneyHelps: JSON.stringify([
      { amount: 5, description: "Translates an urgent appeal into 3 languages, reaching embassies worldwide" },
      { amount: 20, description: "Funds a legal observation mission to monitor a trial for fairness" },
      { amount: 100, description: "Supports a human rights investigation team in a conflict zone for one day" }
    ]),
    milestones: JSON.stringify([
      { year: 1961, title: "Amnesty Founded", description: "Peter Benenson's newspaper appeal launches a global human rights movement" },
      { year: 1977, title: "Nobel Peace Prize", description: "Recognised for securing the ground for freedom, justice, and peace" },
      { year: 2001, title: "Campaign Against Torture", description: "Landmark global campaign leads to reforms in dozens of countries" },
      { year: 2017, title: "Refugees Welcome", description: "Mobilises millions to support the rights of refugees and asylum seekers" },
      { year: 2024, title: "157 Countries Investigated", description: "Most comprehensive year of human rights documentation in history" }
    ]),
    financialBreakdown: JSON.stringify({ programs: 75, admin: 14, fundraising: 11 }),
    fundraisingEfficiency: "75 cents of every euro funds investigations, campaigns, and prisoner support",
  },
  {
    id: nanoid(),
    name: "Secours Populaire",
    description: "Fighting poverty and exclusion in France since 1945 through food aid, housing, healthcare access, and holidays for children who have never seen the sea.",
    category: "humanitarian",
    icon: "🤝",
    qualityLabel: "Don en Confiance",
    taxRate: 75,
    mission: "Secours Populaire Français was founded in 1945, in the immediate aftermath of France's liberation. Born from the solidarity of the Resistance, it has spent 80 years fighting poverty in France and internationally. With a network of 80,000 volunteers, Secours Populaire reaches 3.5 million people annually.\n\nWhat makes Secours Populaire unique is its belief that dignity matters as much as survival. Beyond food and housing, they provide access to culture, sport, and holidays. Their signature programme, \"Journées des Oubliés des Vacances,\" takes children from disadvantaged families on their first ever trip to the seaside. For a child who has never seen the ocean, that day can change everything.",
    impact: JSON.stringify([
      "Assisted 3.5 million people in France in 2024, a 15% increase from 2023",
      "Provided holidays to 65,000 children who had never left their neighbourhood",
      "Distributed emergency aid in 48 countries through international solidarity programmes",
      "Ran 1,300 permanent distribution centres and 650 solidarity boutiques across France",
      "80,000 volunteers gave 12 million hours of their time"
    ]),
    crisisEligible: true,
    foundingStory: "In 1945, as France emerged from occupation, communities across the country needed help rebuilding. Secours Populaire was created by the people of the Resistance, driven by the solidarity that had kept France alive during its darkest years. Their founding principle was simple: everyone, regardless of origin or circumstance, deserves not just survival but dignity. This is why, alongside food and shelter, they offer holidays, culture, and sport to those who can afford none of it.",
    howMoneyHelps: JSON.stringify([
      { amount: 2, description: "Provides school supplies for one child to start the year equipped and confident" },
      { amount: 15, description: "Funds a day at the seaside for a child who has never seen the sea" },
      { amount: 40, description: "Provides a complete back-to-school kit: backpack, notebooks, pens, and clothes" }
    ]),
    milestones: JSON.stringify([
      { year: 1945, title: "Founded Post-Liberation", description: "Born from the solidarity of the Resistance, serving communities rebuilding after the war" },
      { year: 1985, title: "First Journée des Oubliés", description: "Takes disadvantaged children on their first ever trip to the seaside" },
      { year: 2005, title: "Tsunami Response", description: "Mobilises volunteers and funds for Indian Ocean disaster relief" },
      { year: 2015, title: "Refugee Welcome", description: "Opens solidarity centres for refugees arriving in France" },
      { year: 2024, title: "3.5M People Helped", description: "Record year of assistance as cost of living crisis deepens" }
    ]),
    financialBreakdown: JSON.stringify({ programs: 88, admin: 7, fundraising: 5 }),
    fundraisingEfficiency: "88 cents of every euro funds food, housing, education, and holidays for people in need",
  },
];

db.insert(schema.charities).values(charityData).run();

// Seed jurisdiction tax rules for all 5 countries
const taxRules = [
  { countryCode: "FR", standardRate: 66, enhancedRate: 75, enhancedCeiling: 2000, incomeCapPct: 20, receiptFormat: "cerfa_11580" },
  { countryCode: "GB", standardRate: 25, enhancedRate: 40, enhancedCeiling: 0, incomeCapPct: 100, receiptFormat: "gift_aid_receipt" },
  { countryCode: "DE", standardRate: 42, enhancedRate: 42, enhancedCeiling: 0, incomeCapPct: 20, receiptFormat: "zuwendungsbestaetigung" },
  { countryCode: "BE", standardRate: 45, enhancedRate: 45, enhancedCeiling: 397850, incomeCapPct: 10, receiptFormat: "attestation_281_71" },
  { countryCode: "ES", standardRate: 40, enhancedRate: 80, enhancedCeiling: 250, incomeCapPct: 10, receiptFormat: "certificado_donacion" },
];
for (const rule of taxRules) {
  db.insert(schema.jurisdictionTaxRules).values({ id: nanoid(), ...rule }).run();
}

console.log("✅ Database seeded successfully");
console.log(`  ${charityData.length} charities with full content`);
console.log("  1 jurisdiction (France)");

sqlite.close();
