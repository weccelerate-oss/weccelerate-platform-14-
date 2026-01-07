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
      phone: '+972-50-123-4567',
      linkedinUrl: 'https://linkedin.com/in/dannycohen',
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
      title: '🎉 פתיחת הרשמה למחזור האצה 2025',
      titleEn: 'Registration Open for 2025 Acceleration Cohort',
      excerpt: 'מחזור ההאצה החדש שלנו נפתח להרשמה. הצטרפו לתוכנית המובילה בישראל לסטארטאפים בתחום הטכנולוגיה והבריאות.',
      urgencyLevel: 'IMPORTANT' as const,
      isActive: true,
      isPinned: true,
      link: '/programs/acceleration-2025',
      publishAt: new Date(),
    },
    {
      title: 'שיתוף פעולה חדש עם לאומית שירותי בריאות',
      titleEn: 'New Partnership with Leumit Health Services',
      excerpt: 'אנו שמחים להכריז על הרחבת שיתוף הפעולה עם לאומית, המאפשר גישה לדאטה רפואי אנונימי לסטארטאפים בתוכנית.',
      urgencyLevel: 'BREAKING' as const,
      isActive: true,
      isPinned: false,
      link: '/news/leumit-partnership',
      publishAt: subtractDays(new Date(), 2),
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
      imageUrl: '/images/events/demo-day-2025.jpg',
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