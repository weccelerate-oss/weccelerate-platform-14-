/**
 * Prisma Seed Script - WeCcelerate Platform (Prisma 7)
 * 
 * Creates initial database content:
 * - Admin user for CMS access
 * - Sample entrepreneur user
 * - News updates (ticker)
 * - Events (upcoming + past)
 * - Sample project
 * 
 * Usage:
 *   npx tsx prisma/seed.ts
 */

import { config } from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
// =============================================================================
// PRISMA CLIENT SETUP FOR PRISMA 7
// =============================================================================
config({ path: path.join(process.cwd(), '.env') });
config({ path: path.join(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('Please set it in your .env file');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

// =============================================================================
// SEED DATA
// =============================================================================

async function seedUsers() {
  console.log('👤 Seeding users...');

  // ----- ADMIN USER -----
  const adminEmail = 'admin@weccelerate.co.il';
  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
      company: 'WeCcelerate',
      position: 'מנהל מערכת',
      bio: 'מנהל מערכת וויסלרייט',
      language: 'he',
    },
  });

  console.log(`   ✅ Admin: ${admin.email}`);

  // ----- ENTREPRENEUR USER -----
  const entrepreneurEmail = 'entrepreneur@example.com';
  const entrepreneurPassword = await bcrypt.hash('startup123', 12);

  const entrepreneur = await prisma.user.upsert({
    where: { email: entrepreneurEmail },
    update: {
      password: entrepreneurPassword,
      role: 'ENTREPRENEUR',
      isActive: true,
    },
    create: {
      email: entrepreneurEmail,
      password: entrepreneurPassword,
      name: 'דני כהן',
      role: 'ENTREPRENEUR',
      isActive: true,
      emailVerified: new Date(),
      company: 'HealthAI Startup',
      position: 'מייסד ומנכ"ל',
      bio: 'יזם סדרתי בתחום הבריאות הדיגיטלית עם רקע בפיתוח תוכנה ורפואה.',
      // Demo user — phone & linkedinUrl intentionally null. Fake-looking
      // demo data (e.g. a real-format phone number or LinkedIn slug) is a
      // risk: if the seed ever runs in a non-dev environment it creates
      // the illusion of a real person. Null values keep the demo obvious.
      phone: null,
      linkedinUrl: null,
      language: 'he',
    },
  });

  console.log(`   ✅ Entrepreneur: ${entrepreneur.email}`);

  // ----- MENTOR USER -----
  const mentorEmail = 'mentor@weccelerate.co.il';
  const mentorPassword = await bcrypt.hash('mentor123', 12);

  const mentor = await prisma.user.upsert({
    where: { email: mentorEmail },
    update: {
      password: mentorPassword,
      role: 'MENTOR',
      isActive: true,
    },
    create: {
      email: mentorEmail,
      password: mentorPassword,
      name: 'ד"ר שרה לוי',
      role: 'MENTOR',
      isActive: true,
      emailVerified: new Date(),
      company: 'WeCcelerate',
      position: 'מנטורית בכירה',
      bio: 'מנטורית עם 15+ שנות ניסיון בהאצת סטארטאפים. לשעבר שותפה בקרן הון סיכון.',
      language: 'he',
    },
  });

  console.log(`   ✅ Mentor: ${mentor.email}`);

  return { admin, entrepreneur, mentor };
}

async function seedNewsUpdates() {
  console.log('📰 Seeding news updates...');

  const newsItems = [
    {
      title: 'לאומית שירותי בריאות ו-WeCcelerate משיקות מאיץ בריאות דיגיטלית משותף',
      titleEn: 'Leumit Health Services and WeCcelerate launch joint digital health accelerator',
      excerpt: 'לאומית חתמה על הסכם שיתוף פעולה עם WeCcelerate להקמת מאיץ בתחום הבריאות הדיגיטלית — Leumit WeCcelerate — המלווה יזמים מתחילים משלב הרעיון ועד למוצר עובד. לאומית מספקת מומחיות קלינית וגישה למאגרי מידע, ו-WeCcelerate מספקת ליווי עסקי וגיוס משקיעים.',
      urgencyLevel: 'BREAKING' as const,
      isActive: true,
      isPinned: true,
      link: 'https://www.calcalistech.com/ctechnews/article/hkfdmbuic',
      publishAt: new Date('2022-05-09'),
    },
    {
      title: 'WeCcelerate: הבית שאליו מתכנסים משקיעים וחברות סטארט אפ',
      titleEn: 'WeCcelerate: Where investors and startups converge',
      excerpt: 'כתבה ברשת 13 על מאיץ הסטארטאפים שמגשר בין יזמים למשקיעים. החברה פועלת עם שלושה שותפים, כל אחד מביא מומחיות ייחודית. התוכנית חוסכת למשקיעים כ-80% ממאמץ הסינון.',
      urgencyLevel: 'IMPORTANT' as const,
      isActive: true,
      isPinned: true,
      link: 'https://13tv.co.il/item/special/recommended/business/hc5vm-902788257/',
      publishAt: new Date('2021-12-30'),
    },
    {
      title: 'שניים מבכירי השב"כ לשעבר הצטרפו לשותפי WeCcelerate והקימו את Firefly',
      titleEn: 'Two former Shin Bet senior officials join WeCcelerate and establish Firefly',
      excerpt: 'סגן ראש השב"כ לשעבר יאיר סגי (רולי) וראש אגף טכנולוגיית מידע לשעבר סשי אליה הצטרפו לשותפי מאיץ הסטארטאפים WeCcelerate והקימו את Firefly — מיזם טכנולוגי חדש בתחום הסייבר.',
      urgencyLevel: 'BREAKING' as const,
      isActive: true,
      isPinned: true,
      link: 'https://finance.walla.co.il/item/3565341',
      publishAt: new Date('2023-03-14'),
    },
    // ============================================================
    // REMOVED 2026-04-24 — B7Net "חברי הילדות מבאר שבע" record.
    // The excerpt quoted the B7Net article verbatim, which states the
    // founding year as 2017. The canonical incorporation year of
    // WeCcelerate Ltd. is 2018 (confirmed by the owner on 2026-05-14).
    // The WeCcelerate × Leumit MedTech partnership was launched in 2022.
    // Same record also removed from scripts/seed-news.ts.
    // ============================================================
    {
      title: 'WeCcelerate פותחת סניף בקנדה — חיזוק קשרים עם קרנות קנדיות',
      titleEn: 'WeCcelerate opens Canada branch to strengthen ties with Canadian funds',
      excerpt: 'WeCcelerate הרחיבה את פעילותה לקנדה במטרה לחזק קשרים ולתמוך במיזמים ישראליים דרך קרנות השקעה ושיתופי פעולה קנדיים.',
      urgencyLevel: 'URGENT' as const,
      isActive: true,
      isPinned: false,
      publishAt: new Date('2023-09-15'),
    },
    {
      title: '🎉 פתיחת הרשמה למחזור האצה 2025 — מקומות מוגבלים',
      titleEn: 'Registration open for 2025 acceleration cohort — limited spots',
      excerpt: 'מחזור ההאצה החדש של WeCcelerate נפתח להרשמה. התוכנית כוללת ליווי אישי, מחקר שוק, פיתוח מוצר, אסטרטגיה שיווקית, הכנה למשקיעים וגיוס הון.',
      urgencyLevel: 'URGENT' as const,
      isActive: true,
      isPinned: true,
      publishAt: new Date(),
    },
    {
      title: 'WeCcelerate נכללת במפת הפתרונות של Deloitte Israel לסטארטאפים',
      titleEn: 'WeCcelerate included in Deloitte Israel Catalyst solutions map',
      excerpt: 'מאיץ הסטארטאפים WeCcelerate נבחר להיכלל ב-Catalyst — מפת הפתרונות של Deloitte ישראל עבור סטארטאפים, כאחד השחקנים המובילים באקוסיסטם הישראלי.',
      urgencyLevel: 'NORMAL' as const,
      isActive: true,
      isPinned: false,
      link: 'https://solutionsmap.deloitte.co.il/catalyst/',
      publishAt: new Date('2024-01-20'),
    },
    {
      title: 'המודל הייחודי של WeCcelerate: שותפות ולא ספק שירות',
      titleEn: 'WeCcelerate unique model: partnership, not a service provider',
      excerpt: 'WeCcelerate מגדירה את היחסים עם הסטארטאפים כשותפות ולא כלקוח. תפקיד החברה לתת מענה כולל ולהוביל את הרעיונות עם הפוטנציאל הגבוה ביותר להצלחה.',
      urgencyLevel: 'NORMAL' as const,
      isActive: true,
      isPinned: false,
      publishAt: new Date('2024-06-10'),
    },
  ];

  for (const item of newsItems) {
    const news = await prisma.newsUpdate.create({
      data: item,
    });
    console.log(`   ✅ News: "${news.title.substring(0, 40)}..."`);
  }
}

async function seedEvents() {
  console.log('📅 Seeding events...');

  const events = [
    // Upcoming event
    {
      name: 'Demo Day 2025 - מחזור אביב',
      nameEn: 'Demo Day 2025 - Spring Cohort',
      slug: 'demo-day-spring-2025',
      description: 'יום ההדגמה הגדול של מחזור האביב 2025! הצטרפו אלינו לאירוע המרכזי של תוכנית ההאצה.',
      descriptionEn: 'The main demo day event for our Spring 2025 cohort.',
      date: addDays(new Date(), 30),
      time: '18:00',
      endTime: '21:00',
      locationType: 'HYBRID' as const,
      address: 'שדרות רוטשילד 1, תל אביב',
      city: 'תל אביב',
      virtualLink: 'https://zoom.us/j/demo-day-2025',
      registrationLink: 'https://forms.gle/demo-day-registration',
      registrationRequired: true,
      capacity: 200,
      registeredCount: 45,
      isFree: true,
      imageUrl: null,
      category: 'Demo Day',
      tags: ['demo-day', 'investors', 'pitching', 'networking'],
      host: 'וויסלרייט',
      status: 'UPCOMING' as const,
      isActive: true,
      isFeatured: true,
    },
    // Past event
    {
      name: 'Pitch Night - מחזור חורף 2024',
      nameEn: 'Pitch Night - Winter 2024 Cohort',
      slug: 'pitch-night-winter-2024',
      description: 'ערב פיצ\'ים של מחזור החורף 2024. 10 סטארטאפים הציגו את החזון שלהם.',
      date: subtractDays(new Date(), 45),
      time: '18:30',
      endTime: '21:00',
      locationType: 'PHYSICAL' as const,
      address: 'WeWork שרונה, תל אביב',
      city: 'תל אביב',
      registrationRequired: false,
      capacity: 100,
      registeredCount: 87,
      isFree: true,
      category: 'Pitch Night',
      tags: ['pitch', 'networking', 'startups'],
      host: 'וויסלרייט',
      status: 'PAST' as const,
      isActive: true,
      isFeatured: false,
    },
  ];

  for (const event of events) {
    const created = await prisma.event.create({
      data: event,
    });
    console.log(`   ✅ Event: "${created.name}" (${created.status})`);
  }
}

async function seedProjects(entrepreneurId: string) {
  console.log('🚀 Seeding projects...');

  const project = await prisma.project.create({
    data: {
      name: 'HealthAI - אבחון מוקדם באמצעות AI',
      description: 'סטארטאפ בתחום הבריאות הדיגיטלית המפתח פלטפורמת AI לאבחון מוקדם של מחלות כרוניות.',
      industry: 'HealthTech / MedTech',
      website: 'https://healthai-demo.example.com',
      status: 'DEVELOPMENT' as const,
      stage: 4,
      targetFunding: 2000000,
      fundingRaised: 500000,
      fundingCurrency: 'USD',
      teamSize: 5,
      foundingDate: subtractDays(new Date(), 365),
      userId: entrepreneurId,
      timeline: {
        stages: [
          { name: 'אפיון', startDate: '2024-01-01', endDate: '2024-03-01', status: 'completed' },
          { name: 'מחקר שוק', startDate: '2024-03-01', endDate: '2024-05-01', status: 'completed' },
          { name: 'MVP', startDate: '2024-05-01', endDate: '2024-09-01', status: 'completed' },
          { name: 'פיילוט', startDate: '2024-09-01', endDate: '2025-03-01', status: 'in_progress' },
        ],
      },
      milestones: {
        items: [
          { title: 'השלמת MVP', dueDate: '2024-09-01', completed: true },
          { title: 'פיילוט ראשון עם לאומית', dueDate: '2025-01-15', completed: false },
          { title: 'סבב גיוס Seed', dueDate: '2025-06-01', completed: false },
        ],
      },
    },
  });

  console.log(`   ✅ Project: "${project.name}"`);

  // Add a project note
  await prisma.projectNote.create({
    data: {
      projectId: project.id,
      content: 'הפרויקט מתקדם יפה. הפיילוט עם לאומית מתחיל בחודש הבא.',
      isPrivate: true,
      authorName: 'System Admin',
    },
  });

  console.log(`   ✅ Project note added`);

  return project;
}

async function seedSiteSettings() {
  console.log('⚙️ Seeding site settings...');

  const settings = [
    {
      key: 'site.maintenance_mode',
      value: { enabled: false, message: 'האתר בתחזוקה, נחזור בקרוב.' },
      description: 'Site maintenance mode toggle',
    },
    {
      key: 'site.registration_open',
      value: { enabled: true, cohort: '2025-spring', deadline: '2025-03-01' },
      description: 'Program registration status',
    },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
    console.log(`   ✅ Setting: ${setting.key}`);
  }
}

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          🌱 WeCcelerate Database Seed Script 🌱          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Seed in order (respecting relations)
    const { entrepreneur } = await seedUsers();
    await seedNewsUpdates();
    await seedEvents();
    await seedProjects(entrepreneur.id);
    await seedSiteSettings();

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ SEED COMPLETED!                      ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║                                                          ║');
    console.log('║  🔐 ADMIN LOGIN:                                         ║');
    console.log('║     Email:    admin@weccelerate.co.il                    ║');
    console.log('║     Password: admin123                                   ║');
    console.log('║                                                          ║');
    console.log('║  🚀 ENTREPRENEUR LOGIN:                                  ║');
    console.log('║     Email:    entrepreneur@example.com                   ║');
    console.log('║     Password: startup123                                 ║');
    console.log('║                                                          ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║                                                          ║');
    console.log('║  🌐 URLs:                                                ║');
    console.log('║     Login:       http://localhost:3000/login             ║');
    console.log('║     Admin Panel: http://localhost:3000/admin             ║');
    console.log('║                                                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// =============================================================================
// EXECUTE
// =============================================================================

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });