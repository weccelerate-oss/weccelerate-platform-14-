/**
 * Service Matcher
 *
 * Matches Pipedrive activity subjects to WeCcelerate service names.
 * Groups activities into services the entrepreneur purchased.
 */

export interface MatchedService {
  id: string;
  name: string;
  icon: string; // lucide icon name
  activities: {
    id: number;
    subject: string;
    done: boolean;
    dueDate: string | null;
    type: string;
  }[];
  allDone: boolean;
  hasFiles: boolean;           // true if files exist in Drive for this service
  completedDate: string | null; // date of last completed activity
  totalActivities: number;
  completedActivities: number;
}

// Keywords that map activity subjects to service names
const SERVICE_MATCHERS: { keywords: string[]; name: string; icon: string; id: string }[] = [
  {
    id: 'strategic-consulting',
    name: 'ייעוץ אסטרטגי',
    icon: 'Compass',
    keywords: ['ייעוץ', 'אסטרטגי', 'אסטרטגית', 'אסטרטגיה', 'סיעור מוחות'],
  },
  {
    id: 'market-research',
    name: 'סקירת שוק',
    icon: 'Search',
    keywords: ['מחקר שוק', 'סקירת שוק', 'סקירת משק', 'סקירה'],
  },
  {
    id: 'business-plan',
    name: 'תוכנית עסקית',
    icon: 'FileText',
    keywords: ['תוכנית עסקית', 'תכנית עסקית'],
  },
  {
    id: 'financial-plan',
    name: 'תכנון פיננסי',
    icon: 'TrendingUp',
    keywords: ['פיננסי', 'פיננסית', 'פיננסים', 'פיננסיים', 'תחזית'],
  },
  {
    id: 'pitch-deck',
    name: 'מצגת משקיעים',
    icon: 'Presentation',
    keywords: ['מצגת משקיעים', 'מצגת'],
  },
  {
    id: 'marketing-plan',
    name: 'תוכנית שיווקית',
    icon: 'Megaphone',
    keywords: ['שיווק', 'שיוווק', 'שיווקית', 'קמפיין', 'מיתוג'],
  },
  {
    id: 'canvas-model',
    name: 'מודל קנבס',
    icon: 'LayoutGrid',
    keywords: ['קנבס', 'canvas', 'מודל עסקי'],
  },
  {
    id: 'landing-page',
    name: 'דף נחיתה',
    icon: 'Globe',
    keywords: ['דף נחיתה', 'לנדינג', 'landing'],
  },
  {
    id: 'investor-prep',
    name: 'הכנה למשקיעים',
    icon: 'Users',
    keywords: ['משקיעים', 'יום משקיעים', 'הכנה למשקיעים'],
  },
  {
    id: 'brief',
    name: 'בריף',
    icon: 'ClipboardList',
    keywords: ['בריף'],
  },
  {
    id: 'one-pager',
    name: 'תקציר מנהלים',
    icon: 'FileCheck',
    keywords: ['one pager', 'תקציר מנהלים'],
  },
  {
    id: 'venture-advancement',
    name: 'קידום מיזם',
    icon: 'TrendingUp',
    keywords: ['קידום מיזם', 'קידום', 'מיזם'],
  },
  {
    id: 'engineering',
    name: 'פיתוח הנדסי',
    icon: 'LayoutGrid',
    keywords: ['הנדס', 'הנדסי', 'הנדסית', 'פיתוח מוצר', 'אפיון'],
  },
  {
    id: 'product-design',
    name: 'עיצוב מוצר',
    icon: 'Globe',
    keywords: ['עיצוב', 'דיזיין', 'design', 'ui', 'ux'],
  },
];

/**
 * Match Pipedrive activities to WeCcelerate services.
 * Filters out internal/operational activities (calls that didn't connect, internal updates, etc.)
 */
export function matchActivitiesToServices(
  activities: { id: number; type: string; subject: string; done: boolean; dueDate: string | null; addTime: string; markedDoneTime: string | null }[],
  driveFileNames: string[] = [],
): MatchedService[] {
  // Skip internal/operational activities
  const skipPatterns = [
    'שיחה שלא נענתה',
    'שיחה שלא נעונתה',
    'להתקשר',
    'להתעדכן',
    'לשוחח',
    'עודכן אצל',
    'נשלחה הודעת',
    'עודכן בגביי',
    'לקדם',
    'Call',       // Generic English call entries
    'call',
    'גבייה',
    'תשלום',
    'חשבונית',
  ];

  const serviceMap = new Map<string, MatchedService>();

  for (const activity of activities) {
    const subject = activity.subject.toLowerCase();

    // Skip internal activities
    if (skipPatterns.some((p) => activity.subject.includes(p))) continue;

    // Try to match to a service
    for (const matcher of SERVICE_MATCHERS) {
      if (matcher.keywords.some((kw) => subject.includes(kw.toLowerCase()))) {
        if (!serviceMap.has(matcher.id)) {
          serviceMap.set(matcher.id, {
            id: matcher.id,
            name: matcher.name,
            icon: matcher.icon,
            activities: [],
            allDone: true,
            hasFiles: false,
            completedDate: null,
            totalActivities: 0,
            completedActivities: 0,
          });
        }

        const service = serviceMap.get(matcher.id)!;
        service.activities.push({
          id: activity.id,
          subject: activity.subject,
          done: activity.done,
          dueDate: activity.dueDate,
          type: activity.type,
        });
        service.totalActivities++;
        if (activity.done) {
          service.completedActivities++;
          // Track latest completion date
          const doneDate = activity.markedDoneTime || activity.dueDate;
          if (doneDate && (!service.completedDate || doneDate > service.completedDate)) {
            service.completedDate = doneDate;
          }
        }
        if (!activity.done) service.allDone = false;

        break; // Match to first service only
      }
    }
  }

  // Check if each service has files in Drive
  const driveNamesLower = driveFileNames.map(n => n.toLowerCase());
  for (const service of serviceMap.values()) {
    const words = service.name.split(' ').filter(w => w.length > 2);
    service.hasFiles = driveNamesLower.some(fn =>
      words.some(w => fn.includes(w.toLowerCase()))
    );
    // A service is truly "done" only if activities are done AND it has files
    if (!service.hasFiles) {
      service.allDone = false;
    }
  }

  // Sort: incomplete first, then by date
  return Array.from(serviceMap.values()).sort((a, b) => {
    if (a.allDone !== b.allDone) return a.allDone ? 1 : -1;
    return (a.completedDate || '').localeCompare(b.completedDate || '');
  });
}
