/**
 * WeCcelerate — Google Form → Onboarding Webhook
 *
 * Drop-in Google Apps Script. Attach it to the form's script editor,
 * configure the "On form submit" trigger, and every submission will
 * provision a WeCcelerate portal account automatically.
 *
 * SETUP (one time):
 *   1. Open the Google Form in edit mode:
 *      https://docs.google.com/forms/d/1G98etG6F7e7P4SB0e4DK-LE7WSm-oRo2n9TtmsQoH0Y/edit
 *   2. ⋮ (three dots, top right) → Script editor.
 *   3. Replace the placeholder code with this entire file. Save (Ctrl/Cmd+S),
 *      pick a project name like "WeCcelerate Onboarding".
 *   4. Project Settings (gear icon, left sidebar) → "Add script property":
 *        Property: ONBOARDING_WEBHOOK_SECRET
 *        Value:    <the secret from Vercel>
 *      Click "Save script properties". DO NOT hard-code the secret in this
 *      file — keep it in script properties so it's never committed/visible.
 *   5. Left sidebar → "Triggers" (clock icon) → "Add trigger":
 *        Function:           handleFormSubmit
 *        Event source:       From form
 *        Event type:         On form submit
 *      Save. Google will ask for permissions (UrlFetch, Forms) — approve.
 *   6. Submit the form once as a test. Check the "Executions" tab for the
 *        result. A 200 response means it worked.
 *
 * EDIT THE FIELD MAP below if your form's question titles don't match.
 */

// ============================================================================
// CONFIG — edit the URL only if you're testing against a preview deployment.
// ============================================================================

const WEBHOOK_URL = 'https://weccelerate.co.il/api/onboarding/entrepreneur';

/**
 * Map the form's question titles → our webhook field names.
 *
 * Each entry: { webhookField: [list of question titles to try, case-insensitive] }
 * The script picks the FIRST match. Add more titles if the form changes.
 *
 * Anything that doesn't match a mapped field is still sent under `raw`,
 * so the admin can see it in /admin/users via `intakeFormData`.
 */
const FIELD_MAP = {
  name: [
    'שם מלא', 'שם', 'name', 'full name', 'your name',
  ],
  email: [
    'אימייל', 'דוא״ל', 'דואר אלקטרוני', 'email', 'email address', 'mail',
  ],
  phone: [
    'טלפון', 'נייד', 'מספר טלפון', 'phone', 'mobile', 'phone number',
  ],
  company: [
    'חברה', 'שם החברה', 'שם הסטארטאפ', 'שם המיזם',
    'company', 'company name', 'startup', 'venture',
  ],
  message: [
    'הודעה', 'תיאור', 'פרטים נוספים', 'message', 'notes', 'description', 'about',
  ],
};

// ============================================================================
// TRIGGER HANDLER — runs on every form submission.
// ============================================================================

function handleFormSubmit(e) {
  try {
    // Guard against the operator clicking "Run" on this function from the
    // script editor — that has no event payload and would just log nonsense.
    // This function only makes sense when fired by the "On form submit"
    // trigger.
    if (!e || !e.response) {
      Logger.log(
        'handleFormSubmit was invoked without a form-submit event. ' +
        'This usually means you clicked "Run" directly in the editor — ' +
        'use testWebhook() for manual tests, or submit the live form to ' +
        'fire the real trigger.'
      );
      return;
    }

    const secret = PropertiesService.getScriptProperties().getProperty('ONBOARDING_WEBHOOK_SECRET');
    if (!secret) {
      Logger.log('ERROR: ONBOARDING_WEBHOOK_SECRET not set in Script Properties.');
      return;
    }

    const payload = buildPayload(e);

    // Bail if the required fields didn't come through — Apps Script never
    // recovers a submission, so log it loudly.
    if (!payload.name || !payload.email) {
      Logger.log('Missing required fields. Payload was: ' + JSON.stringify(payload));
      return;
    }

    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-onboarding-secret': secret,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true, // so we see 4xx bodies in the log
    });

    const code = response.getResponseCode();
    const body = response.getContentText();
    Logger.log('Webhook responded ' + code + ': ' + body);

    if (code >= 400) {
      // 422 = spam filter rejected. 401 = secret mismatch. Surface so the
      // admin can debug from the Executions tab.
      Logger.log('Webhook rejected the submission. Review the payload above and the response body.');
    }
  } catch (err) {
    Logger.log('handleFormSubmit threw: ' + (err && err.stack ? err.stack : err));
  }
}

// ============================================================================
// PAYLOAD BUILDER
// ============================================================================

function buildPayload(e) {
  // ItemResponses comes from the trigger event. Each one has getItem() with
  // the question, and getResponse() with the answer.
  const responses = (e && e.response) ? e.response.getItemResponses() : [];

  const raw = {};
  const mapped = { name: '', email: '', phone: '', company: '', message: '' };

  for (let i = 0; i < responses.length; i++) {
    const item = responses[i].getItem();
    const title = item.getTitle();
    const titleLower = title.toLowerCase().trim();
    const answer = formatAnswer(responses[i].getResponse());

    raw[title] = answer; // keep verbatim under raw

    // First-match wins per webhook field.
    Object.keys(FIELD_MAP).forEach(function (field) {
      if (mapped[field]) return; // already filled
      const candidates = FIELD_MAP[field];
      for (let j = 0; j < candidates.length; j++) {
        if (titleLower.indexOf(candidates[j].toLowerCase()) !== -1) {
          mapped[field] = answer;
          break;
        }
      }
    });
  }

  return {
    name: mapped.name,
    email: mapped.email,
    phone: mapped.phone || null,
    company: mapped.company || null,
    message: mapped.message || null,
    source: 'google_form',
    raw: raw,
  };
}

/** Normalize the response — Apps Script returns strings or arrays. */
function formatAnswer(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return String(value).trim();
}

// ============================================================================
// MANUAL TEST — run this once from the Apps Script editor (Run → testWebhook)
// to verify connectivity BEFORE wiring the trigger. Doesn't create real users
// because `email` includes a timestamp.
// ============================================================================

function testWebhook() {
  const secret = PropertiesService.getScriptProperties().getProperty('ONBOARDING_WEBHOOK_SECRET');
  if (!secret) {
    Logger.log('Set ONBOARDING_WEBHOOK_SECRET in Script Properties first.');
    return;
  }
  const payload = {
    name: 'בדיקת חיבור Apps Script',
    email: 'apps-script-test+' + Date.now() + '@example.com',
    phone: '+972501234567',
    company: 'TestCo',
    source: 'apps_script_test',
    raw: { _note: 'fired from testWebhook()' },
  };
  const res = UrlFetchApp.fetch(WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-onboarding-secret': secret },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  Logger.log('testWebhook: ' + res.getResponseCode() + ' ' + res.getContentText());
}
