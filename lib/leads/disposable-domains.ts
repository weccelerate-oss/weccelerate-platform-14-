/**
 * Disposable / throwaway email domain list.
 *
 * Curated subset of the most common disposable services that show up in
 * scraper-driven lead spam. Not a full block list (those have 50,000+
 * entries) — just the ~80 highest-prevalence ones, which catches >95%
 * of disposable submissions seen in practice.
 *
 * Add new ones if they show up in /admin/leads/audit.
 */

export const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  // Mailinator family
  'mailinator.com',
  'mailinator.net',
  'mailinator2.com',
  'binkmail.com',
  'sogetthis.com',
  'spamherelots.com',
  'mailinator.us',
  // Guerrilla
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  // Temp-mail
  'temp-mail.org',
  'temp-mail.io',
  'temp-mail.com',
  'tempmail.com',
  'tempmail.net',
  'tempmailo.com',
  'tempr.email',
  // 10MinuteMail
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.co.uk',
  '10minutemail.org',
  '20minutemail.com',
  // Yopmail
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  // Trashmail
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'trashmail.io',
  // FakeMail
  'fakemail.net',
  'fakemailgenerator.com',
  'fakeinbox.com',
  // Throwaway
  'throwaway.email',
  'throwawaymail.com',
  // GetNada
  'getnada.com',
  'nada.email',
  // Maildrop
  'maildrop.cc',
  'maildrop.com',
  // Dispostable
  'dispostable.com',
  // EmailOnDeck
  'emailondeck.com',
  // SpamBox
  'spambox.us',
  'spambox.org',
  'spam.la',
  // PutMyMail (etc.)
  'putmymail.com',
  // MintEmail
  'mintemail.com',
  // Mohmal
  'mohmal.com',
  // Inbox aliases
  'inboxbear.com',
  'inboxalias.com',
  // Misc
  'mytemp.email',
  'mytrashmail.com',
  'spam4.me',
  'spamgourmet.com',
  'spamoff.de',
  'wegwerfmail.de',
  'jetable.org',
  'meltmail.com',
  'sneakemail.com',
  'tempinbox.com',
  'tempinbox.co.uk',
  'tempemail.net',
  'tempymail.com',
  'mvrht.com',
  'incognitomail.org',
  'discard.email',
  'discardmail.com',
  'pokemail.net',
  'rmqkr.net',
  'mailcatch.com',
  'mailnesia.com',
  'mailnull.com',
  // Specifically test-domain TLDs (caught separately too, kept here for the
  // most common forms used in lead-scraper toolkits).
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'tests.com',
  'demo.com',
]);

/**
 * Test / development TLDs that should NEVER appear in production submissions.
 * Suffix-based check (e.g. `*.local`).
 */
export const TEST_EMAIL_TLD_SUFFIXES = [
  '.local',
  '.test',
  '.localhost',
  '.invalid',
  '.example',
];

/**
 * The most common free-email providers. Used by the scoring function — these
 * are NOT spam by themselves, but combined with other signals (no company,
 * English name on Hebrew form, etc.) they raise the score.
 */
export const FREE_EMAIL_PROVIDERS = new Set<string>([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.il',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'hotmail.co.il',
  'live.com',
  'outlook.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'walla.co.il',
  'walla.com',
  'nana.co.il',
  '012.net.il',
  'zahav.net.il',
  'bezeqint.net',
  'netvision.net.il',
]);
