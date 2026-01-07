module.exports = [
"[project]/config/pipedrive.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pipedrive Configuration
 * 
 * Centralized configuration for Pipedrive CRM integration.
 * Update these values based on your Pipedrive account setup.
 */ // =============================================================================
// API CONFIGURATION
// =============================================================================
__turbopack_context__.s([
    "LEAD_SOURCES",
    ()=>LEAD_SOURCES,
    "PIPEDRIVE_CONFIG",
    ()=>PIPEDRIVE_CONFIG,
    "PIPEDRIVE_CUSTOM_FIELDS",
    ()=>PIPEDRIVE_CUSTOM_FIELDS,
    "PIPEDRIVE_DEFAULTS",
    ()=>PIPEDRIVE_DEFAULTS,
    "PIPEDRIVE_PIPELINES",
    ()=>PIPEDRIVE_PIPELINES,
    "buildPipedriveUrl",
    ()=>buildPipedriveUrl,
    "validatePipedriveConfig",
    ()=>validatePipedriveConfig
]);
const PIPEDRIVE_CONFIG = {
    // Base API URL
    API_BASE_URL: 'https://api.pipedrive.com/v1',
    // API Token from environment
    API_TOKEN: process.env.PIPEDRIVE_API_TOKEN || '',
    // Company domain (e.g., "weccelerate" for weccelerate.pipedrive.com)
    COMPANY_DOMAIN: process.env.PIPEDRIVE_COMPANY_DOMAIN || '',
    // Webhook secret for verification
    WEBHOOK_SECRET: process.env.PIPEDRIVE_WEBHOOK_SECRET || ''
};
const PIPEDRIVE_CUSTOM_FIELDS = {
    // Person custom fields
    PERSON: {
        // Lead source field ID (create this in Pipedrive first)
        // Example: '12345678901234567890123456789012abcdef12'
        LEAD_SOURCE: process.env.PIPEDRIVE_FIELD_LEAD_SOURCE || '',
        // Website source URL field ID
        SOURCE_URL: process.env.PIPEDRIVE_FIELD_SOURCE_URL || '',
        // Company size field ID (optional)
        COMPANY_SIZE: process.env.PIPEDRIVE_FIELD_COMPANY_SIZE || '',
        // Industry field ID (optional)
        INDUSTRY: process.env.PIPEDRIVE_FIELD_INDUSTRY || ''
    },
    // Deal custom fields
    DEAL: {
        // Lead source for deals
        LEAD_SOURCE: process.env.PIPEDRIVE_FIELD_DEAL_LEAD_SOURCE || '',
        // Conversion page URL
        CONVERSION_URL: process.env.PIPEDRIVE_FIELD_CONVERSION_URL || '',
        // UTM Campaign (optional)
        UTM_CAMPAIGN: process.env.PIPEDRIVE_FIELD_UTM_CAMPAIGN || '',
        // UTM Source (optional)
        UTM_SOURCE: process.env.PIPEDRIVE_FIELD_UTM_SOURCE || ''
    }
};
const PIPEDRIVE_PIPELINES = {
    // Default pipeline for website leads
    // Find ID in Pipedrive: Settings → Pipelines
    DEFAULT_PIPELINE_ID: parseInt(process.env.PIPEDRIVE_DEFAULT_PIPELINE_ID || '1'),
    // Default stage ID (usually first stage - "New Lead" or "Characterization")
    DEFAULT_STAGE_ID: parseInt(process.env.PIPEDRIVE_DEFAULT_STAGE_ID || '1'),
    // Pipeline for different lead types (optional)
    ACCELERATION_PIPELINE_ID: parseInt(process.env.PIPEDRIVE_ACCELERATION_PIPELINE_ID || '1'),
    CONSULTING_PIPELINE_ID: parseInt(process.env.PIPEDRIVE_CONSULTING_PIPELINE_ID || '1')
};
const LEAD_SOURCES = {
    // Main website lead source
    WEBSITE: 'Website 2.0',
    // Organic search
    ORGANIC: 'Organic Website',
    // Specific landing pages
    LANDING_PAGE: 'Landing Page',
    // Partner sites (e.g., Leumit)
    LEUMIT: 'Leumit Partnership',
    // Events
    EVENT_REGISTRATION: 'Event Registration',
    // Blog/Content
    BLOG: 'Blog / Content',
    // Referral
    REFERRAL: 'Referral'
};
const PIPEDRIVE_DEFAULTS = {
    // Default currency for deals
    CURRENCY: 'ILS',
    // Default deal value (0 for leads without known value)
    DEAL_VALUE: 0,
    // Default visibility (1 = owner only, 3 = entire company)
    VISIBILITY: 3,
    // Default label IDs (create these in Pipedrive)
    LABELS: {
        HOT_LEAD: parseInt(process.env.PIPEDRIVE_LABEL_HOT || '0'),
        WEBSITE_LEAD: parseInt(process.env.PIPEDRIVE_LABEL_WEBSITE || '0')
    }
};
function validatePipedriveConfig() {
    const errors = [];
    if (!PIPEDRIVE_CONFIG.API_TOKEN) {
        errors.push('PIPEDRIVE_API_TOKEN is not configured');
    }
    if (!PIPEDRIVE_CONFIG.COMPANY_DOMAIN) {
        errors.push('PIPEDRIVE_COMPANY_DOMAIN is not configured');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function buildPipedriveUrl(endpoint, params) {
    const url = new URL(`${PIPEDRIVE_CONFIG.API_BASE_URL}${endpoint}`);
    url.searchParams.set('api_token', PIPEDRIVE_CONFIG.API_TOKEN);
    if (params) {
        Object.entries(params).forEach(([key, value])=>{
            url.searchParams.set(key, value);
        });
    }
    return url.toString();
}
}),
"[project]/lib/pipedrive.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createLead",
    ()=>createLead,
    "pipedriveClient",
    ()=>pipedriveClient
]);
/**
 * Pipedrive Service
 * 
 * Comprehensive service for interacting with Pipedrive CRM.
 * Handles lead generation, person/deal creation, and tracking.
 * 
 * @module lib/pipedrive
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/pipedrive.ts [app-rsc] (ecmascript)");
;
// =============================================================================
// API CLIENT
// =============================================================================
class PipedriveClient {
    baseUrl;
    apiToken;
    isConfigured;
    constructor(){
        this.baseUrl = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CONFIG"].API_BASE_URL;
        this.apiToken = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CONFIG"].API_TOKEN;
        const { valid } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validatePipedriveConfig"])();
        this.isConfigured = valid;
    }
    /**
   * Check if the client is properly configured
   */ isReady() {
        return this.isConfigured;
    }
    /**
   * Make an API request to Pipedrive
   */ async request(method, endpoint, data) {
        if (!this.isConfigured) {
            console.error('[Pipedrive] Client not configured');
            return {
                success: false,
                data: null,
                error: 'Pipedrive is not configured'
            };
        }
        const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildPipedriveUrl"])(endpoint);
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }
            const response = await fetch(url, options);
            const result = await response.json();
            if (!response.ok) {
                console.error('[Pipedrive] API error:', result);
                return {
                    success: false,
                    data: null,
                    error: result.error || `API error: ${response.status}`
                };
            }
            return result;
        } catch (error) {
            console.error('[Pipedrive] Request failed:', error);
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Request failed'
            };
        }
    }
    // ===========================================================================
    // PERSONS
    // ===========================================================================
    /**
   * Search for existing person by email
   */ async findPersonByEmail(email) {
        const response = await this.request('GET', `/persons/search?term=${encodeURIComponent(email)}&fields=email&limit=1`);
        if (response.success && response.data && response.data.length > 0) {
            // Search returns items with data property
            const items = response.data;
            return items[0]?.item || null;
        }
        return null;
    }
    /**
   * Create a new person
   */ async createPerson(data) {
        const personData = {
            name: data.name,
            email: [
                {
                    value: data.email,
                    primary: true,
                    label: 'work'
                }
            ],
            visible_to: data.visible_to || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_DEFAULTS"].VISIBILITY
        };
        if (data.phone) {
            personData.phone = [
                {
                    value: data.phone,
                    primary: true,
                    label: 'work'
                }
            ];
        }
        if (data.org_id) {
            personData.org_id = data.org_id;
        }
        // Add custom fields
        if (data.customFields) {
            Object.entries(data.customFields).forEach(([key, value])=>{
                if (key && value !== undefined && value !== '') {
                    personData[key] = value;
                }
            });
        }
        return this.request('POST', '/persons', personData);
    }
    /**
   * Update an existing person
   */ async updatePerson(personId, data) {
        return this.request('PUT', `/persons/${personId}`, data);
    }
    // ===========================================================================
    // ORGANIZATIONS
    // ===========================================================================
    /**
   * Search for existing organization by name
   */ async findOrganizationByName(name) {
        const response = await this.request('GET', `/organizations/search?term=${encodeURIComponent(name)}&limit=1`);
        if (response.success && response.data && response.data.length > 0) {
            const items = response.data;
            return items[0]?.item || null;
        }
        return null;
    }
    /**
   * Create a new organization
   */ async createOrganization(data) {
        const orgData = {
            name: data.name,
            visible_to: data.visible_to || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_DEFAULTS"].VISIBILITY
        };
        if (data.customFields) {
            Object.entries(data.customFields).forEach(([key, value])=>{
                if (key && value !== undefined && value !== '') {
                    orgData[key] = value;
                }
            });
        }
        return this.request('POST', '/organizations', orgData);
    }
    // ===========================================================================
    // DEALS
    // ===========================================================================
    /**
   * Create a new deal
   */ async createDeal(data) {
        const dealData = {
            title: data.title,
            value: data.value ?? __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_DEFAULTS"].DEAL_VALUE,
            currency: data.currency || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_DEFAULTS"].CURRENCY,
            stage_id: data.stage_id || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_PIPELINES"].DEFAULT_STAGE_ID,
            pipeline_id: data.pipeline_id || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_PIPELINES"].DEFAULT_PIPELINE_ID,
            visible_to: data.visible_to || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_DEFAULTS"].VISIBILITY
        };
        if (data.person_id) {
            dealData.person_id = data.person_id;
        }
        if (data.org_id) {
            dealData.org_id = data.org_id;
        }
        // Add custom fields
        if (data.customFields) {
            Object.entries(data.customFields).forEach(([key, value])=>{
                if (key && value !== undefined && value !== '') {
                    dealData[key] = value;
                }
            });
        }
        return this.request('POST', '/deals', dealData);
    }
    // ===========================================================================
    // NOTES
    // ===========================================================================
    /**
   * Add a note to a deal or person
   */ async addNote(data) {
        return this.request('POST', '/notes', data);
    }
}
const pipedriveClient = new PipedriveClient();
async function createLead(leadData) {
    const startTime = Date.now();
    console.log('[Pipedrive] Creating lead:', {
        name: leadData.name,
        email: leadData.email,
        source: leadData.leadSource || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEAD_SOURCES"].WEBSITE
    });
    // Validate required fields
    if (!leadData.name?.trim()) {
        return {
            success: false,
            error: 'Name is required',
            errorCode: 'MISSING_NAME'
        };
    }
    if (!leadData.email?.trim()) {
        return {
            success: false,
            error: 'Email is required',
            errorCode: 'MISSING_EMAIL'
        };
    }
    if (!isValidEmail(leadData.email)) {
        return {
            success: false,
            error: 'Invalid email format',
            errorCode: 'INVALID_EMAIL'
        };
    }
    // Check if client is configured
    if (!pipedriveClient.isReady()) {
        console.error('[Pipedrive] Client not configured, logging lead locally');
        await logLeadLocally(leadData);
        return {
            success: false,
            error: 'CRM not available',
            errorCode: 'CRM_UNAVAILABLE'
        };
    }
    try {
        let organizationId;
        let personId;
        let dealId;
        // =========================================================================
        // Step 1: Create or find Organization (if company provided)
        // =========================================================================
        if (leadData.company?.trim()) {
            // Check for existing organization
            const existingOrg = await pipedriveClient.findOrganizationByName(leadData.company);
            if (existingOrg) {
                organizationId = existingOrg.id;
                console.log('[Pipedrive] Found existing organization:', organizationId);
            } else {
                // Create new organization
                const orgResult = await pipedriveClient.createOrganization({
                    name: leadData.company,
                    customFields: {
                        // Add industry if field is configured
                        ...__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].PERSON.INDUSTRY && leadData.industry && {
                            [__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].PERSON.INDUSTRY]: leadData.industry
                        }
                    }
                });
                if (orgResult.success && orgResult.data) {
                    organizationId = orgResult.data.id;
                    console.log('[Pipedrive] Created organization:', organizationId);
                }
            }
        }
        // =========================================================================
        // Step 2: Create or update Person
        // =========================================================================
        // Check for existing person by email
        const existingPerson = await pipedriveClient.findPersonByEmail(leadData.email);
        // Build custom fields for person
        const personCustomFields = {};
        // Lead source field
        if (__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].PERSON.LEAD_SOURCE) {
            personCustomFields[__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].PERSON.LEAD_SOURCE] = leadData.leadSource || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEAD_SOURCES"].WEBSITE;
        }
        // Source URL field
        if (__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].PERSON.SOURCE_URL && leadData.sourceUrl) {
            personCustomFields[__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].PERSON.SOURCE_URL] = leadData.sourceUrl;
        }
        // Company size
        if (__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].PERSON.COMPANY_SIZE && leadData.companySize) {
            personCustomFields[__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].PERSON.COMPANY_SIZE] = leadData.companySize;
        }
        if (existingPerson) {
            // Update existing person with new data
            personId = existingPerson.id;
            console.log('[Pipedrive] Found existing person:', personId);
            // Optionally update with new info
            await pipedriveClient.updatePerson(personId, {
                org_id: organizationId,
                ...personCustomFields
            });
        } else {
            // Create new person
            const personResult = await pipedriveClient.createPerson({
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                org_id: organizationId,
                customFields: personCustomFields
            });
            if (personResult.success && personResult.data) {
                personId = personResult.data.id;
                console.log('[Pipedrive] Created person:', personId);
            } else {
                throw new Error(personResult.error || 'Failed to create person');
            }
        }
        // =========================================================================
        // Step 3: Create Deal
        // =========================================================================
        // Build deal title
        const dealTitle = buildDealTitle(leadData);
        // Build custom fields for deal
        const dealCustomFields = {};
        // Lead source for deal
        if (__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].DEAL.LEAD_SOURCE) {
            dealCustomFields[__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].DEAL.LEAD_SOURCE] = leadData.leadSource || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEAD_SOURCES"].WEBSITE;
        }
        // Conversion URL
        if (__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].DEAL.CONVERSION_URL && leadData.sourceUrl) {
            dealCustomFields[__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].DEAL.CONVERSION_URL] = leadData.sourceUrl;
        }
        // UTM tracking
        if (__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].DEAL.UTM_CAMPAIGN && leadData.utmCampaign) {
            dealCustomFields[__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].DEAL.UTM_CAMPAIGN] = leadData.utmCampaign;
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].DEAL.UTM_SOURCE && leadData.utmSource) {
            dealCustomFields[__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PIPEDRIVE_CUSTOM_FIELDS"].DEAL.UTM_SOURCE] = leadData.utmSource;
        }
        const dealResult = await pipedriveClient.createDeal({
            title: dealTitle,
            person_id: personId,
            org_id: organizationId,
            value: leadData.budget,
            customFields: dealCustomFields
        });
        if (dealResult.success && dealResult.data) {
            dealId = dealResult.data.id;
            console.log('[Pipedrive] Created deal:', dealId);
        } else {
            throw new Error(dealResult.error || 'Failed to create deal');
        }
        // =========================================================================
        // Step 4: Add Note with tracking info and message
        // =========================================================================
        const noteContent = buildNoteContent(leadData);
        await pipedriveClient.addNote({
            content: noteContent,
            deal_id: dealId,
            person_id: personId
        });
        // =========================================================================
        // Success!
        // =========================================================================
        const duration = Date.now() - startTime;
        console.log(`[Pipedrive] Lead created successfully in ${duration}ms:`, {
            personId,
            dealId,
            organizationId
        });
        return {
            success: true,
            personId,
            dealId,
            organizationId
        };
    } catch (error) {
        console.error('[Pipedrive] Error creating lead:', error);
        // Log locally as backup
        await logLeadLocally(leadData);
        return {
            success: false,
            error: 'Failed to submit lead',
            errorCode: 'CRM_ERROR'
        };
    }
}
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
/**
 * Validate email format
 */ function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Build deal title from lead data
 */ function buildDealTitle(leadData) {
    const parts = [];
    // Add form type if available
    if (leadData.formType) {
        const formTypeMap = {
            contact: 'פנייה',
            application: 'מועמדות',
            newsletter: 'הרשמה',
            consultation: 'ייעוץ',
            event: 'אירוע'
        };
        parts.push(formTypeMap[leadData.formType] || leadData.formType);
    } else {
        parts.push('ליד מהאתר');
    }
    // Add site identifier
    if (leadData.site && leadData.site !== 'main') {
        const siteMap = {
            leumit: '(לאומית)',
            biz: '(עסקים)',
            landing: '(דף נחיתה)'
        };
        parts.push(siteMap[leadData.site] || `(${leadData.site})`);
    }
    parts.push('-');
    parts.push(leadData.name);
    if (leadData.company) {
        parts.push(`(${leadData.company})`);
    }
    return parts.join(' ');
}
/**
 * Build note content with all tracking info
 */ function buildNoteContent(leadData) {
    const lines = [];
    // Header
    lines.push('📥 **ליד חדש מהאתר**');
    lines.push('');
    // Basic info
    lines.push('**פרטי הליד:**');
    lines.push(`• שם: ${leadData.name}`);
    lines.push(`• אימייל: ${leadData.email}`);
    if (leadData.phone) lines.push(`• טלפון: ${leadData.phone}`);
    if (leadData.company) lines.push(`• חברה: ${leadData.company}`);
    lines.push('');
    // Message
    if (leadData.message) {
        lines.push('**הודעה:**');
        lines.push(leadData.message);
        lines.push('');
    }
    // Source tracking
    lines.push('**מקור הליד:**');
    lines.push(`• מקור: ${leadData.leadSource || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEAD_SOURCES"].WEBSITE}`);
    if (leadData.sourceUrl) {
        lines.push(`• דף המרה: ${leadData.sourceUrl}`);
    }
    if (leadData.referrerUrl) {
        lines.push(`• דף מפנה: ${leadData.referrerUrl}`);
    }
    if (leadData.site) {
        lines.push(`• אתר: ${leadData.site}`);
    }
    if (leadData.formType) {
        lines.push(`• סוג טופס: ${leadData.formType}`);
    }
    lines.push('');
    // UTM tracking
    if (leadData.utmSource || leadData.utmMedium || leadData.utmCampaign) {
        lines.push('**UTM Tracking:**');
        if (leadData.utmSource) lines.push(`• Source: ${leadData.utmSource}`);
        if (leadData.utmMedium) lines.push(`• Medium: ${leadData.utmMedium}`);
        if (leadData.utmCampaign) lines.push(`• Campaign: ${leadData.utmCampaign}`);
        lines.push('');
    }
    // Additional info
    if (leadData.industry || leadData.companySize || leadData.budget) {
        lines.push('**מידע נוסף:**');
        if (leadData.industry) lines.push(`• תעשייה: ${leadData.industry}`);
        if (leadData.companySize) lines.push(`• גודל חברה: ${leadData.companySize}`);
        if (leadData.budget) lines.push(`• תקציב: ₪${leadData.budget.toLocaleString()}`);
        lines.push('');
    }
    // Timestamp
    lines.push(`---`);
    lines.push(`נוצר אוטומטית ב-${new Date().toLocaleString('he-IL')}`);
    return lines.join('\n');
}
/**
 * Log lead locally as backup when Pipedrive is unavailable
 */ async function logLeadLocally(leadData) {
    try {
        // Import prisma dynamically to avoid circular dependencies
        const { prisma } = await __turbopack_context__.A("[project]/lib/db.ts [app-rsc] (ecmascript, async loader)");
        await prisma.activityLog.create({
            data: {
                action: 'lead.backup',
                description: `Lead backup (Pipedrive unavailable): ${leadData.email}`,
                metadata: {
                    leadData: {
                        name: leadData.name,
                        email: leadData.email,
                        phone: leadData.phone,
                        company: leadData.company,
                        message: leadData.message,
                        sourceUrl: leadData.sourceUrl,
                        referrerUrl: leadData.referrerUrl,
                        leadSource: leadData.leadSource,
                        formType: leadData.formType,
                        site: leadData.site
                    },
                    timestamp: new Date().toISOString()
                }
            }
        });
        console.log('[Pipedrive] Lead logged locally as backup');
    } catch (error) {
        console.error('[Pipedrive] Failed to log lead locally:', error);
        // Last resort: log to console
        console.log('[Pipedrive] BACKUP LEAD DATA:', JSON.stringify(leadData, null, 2));
    }
}
;
}),
"[project]/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Prisma Client Singleton
 * 
 * This file creates a singleton instance of PrismaClient.
 * For Prisma 7, you may need to use the adapter approach.
 * 
 * Usage:
 * import { prisma } from '@/lib/db';
 * const users = await prisma.user.findMany();
 * 
 * Note: Run `npx prisma generate` after setting up your database
 * to generate the Prisma client.
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "prisma",
    ()=>prisma
]);
// Mock client for when Prisma isn't available
function createMockPrismaClient() {
    const createMockMethod = ()=>async ()=>null;
    const mockModel = {
        findMany: async ()=>[],
        findUnique: async ()=>null,
        findFirst: async ()=>null,
        create: async (args)=>({
                id: 'mock-id',
                ...args.data
            }),
        update: async (args)=>({
                id: 'mock-id',
                ...args.data
            }),
        delete: async ()=>({
                id: 'mock-id'
            }),
        count: async ()=>0,
        upsert: async (args)=>({
                id: 'mock-id',
                ...args.create
            }),
        deleteMany: async ()=>({
                count: 0
            }),
        updateMany: async ()=>({
                count: 0
            }),
        createMany: async ()=>({
                count: 0
            }),
        aggregate: async ()=>({}),
        groupBy: async ()=>[]
    };
    const handler = {
        get: (_target, prop)=>{
            if (prop === '$connect' || prop === '$disconnect') {
                return async ()=>{};
            }
            if (prop === '$transaction') {
                return async (fn)=>fn(createMockPrismaClient());
            }
            if (prop === '$queryRaw' || prop === '$executeRaw') {
                return async ()=>[];
            }
            // Return mock model for any model access
            return mockModel;
        }
    };
    return new Proxy({}, handler);
}
// Lazy load PrismaClient
function getPrismaClient() {
    try {
        // Check if DATABASE_URL is set
        if (!process.env.DATABASE_URL) {
            console.warn('⚠️ DATABASE_URL not set. Using mock Prisma client.');
            return createMockPrismaClient();
        }
        // Dynamic import to avoid build errors when Prisma hasn't been generated
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaClient } = __turbopack_context__.r("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
        // For Prisma 7, we might need to use the adapter
        // But first try without it for compatibility
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { PrismaPg } = __turbopack_context__.r("[project]/node_modules/@prisma/adapter-pg/dist/index.js [app-rsc] (ecmascript)");
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { Pool } = __turbopack_context__.r("[externals]/pg [external] (pg, cjs, [project]/node_modules/pg)");
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL
            });
            const adapter = new PrismaPg(pool);
            return new PrismaClient({
                adapter,
                log: ("TURBOPACK compile-time truthy", 1) ? [
                    'error',
                    'warn'
                ] : "TURBOPACK unreachable"
            });
        } catch  {
            // Fallback to standard Prisma client (for Prisma < 7)
            return new PrismaClient({
                log: ("TURBOPACK compile-time truthy", 1) ? [
                    'error',
                    'warn'
                ] : "TURBOPACK unreachable"
            });
        }
    } catch (error) {
        // Return a mock client for development without database
        console.warn('⚠️ Prisma client not available. Using mock client.', error);
        return createMockPrismaClient();
    }
}
// Create a singleton instance
const prisma = global.prisma || getPrismaClient();
// In development, attach to global to prevent multiple instances
if ("TURBOPACK compile-time truthy", 1) {
    global.prisma = prisma;
}
;
const __TURBOPACK__default__export__ = prisma;
}),
"[project]/app/actions/leads.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Lead Generation Server Actions
 * 
 * Server actions for handling form submissions and creating leads in Pipedrive.
 * These actions are called from client components and handle all server-side logic.
 * 
 * @module actions/leads
 */ /* __next_internal_action_entry_do_not_use__ [{"40fe730342908d48c76630d681d88b5ded7bd55eec":"createLeadAction","6026cc6d9a3d04668f0f2865c2abc5b874b8a58b2b":"submitEventRegistration","605b87182665476177959f0982509a25f7985a1fe6":"submitContactForm","6083475df1fa69b3cd4e26cd0411c3fa824c6a8dd1":"submitApplicationForm","60ce6fbc22464285df3105b9fbd48dae69a0acbff5":"submitNewsletterSignup"},"",""] */ __turbopack_context__.s([
    "createLeadAction",
    ()=>createLeadAction,
    "submitApplicationForm",
    ()=>submitApplicationForm,
    "submitContactForm",
    ()=>submitContactForm,
    "submitEventRegistration",
    ()=>submitEventRegistration,
    "submitNewsletterSignup",
    ()=>submitNewsletterSignup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/pipedrive.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/pipedrive.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================
const ContactFormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2, 'השם חייב להכיל לפחות 2 תווים').max(100, 'השם ארוך מדי'),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email('כתובת אימייל לא תקינה'),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().refine((val)=>!val || /^[\d\s\-+()]{7,20}$/.test(val), {
        message: 'מספר טלפון לא תקין'
    }),
    company: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100, 'שם החברה ארוך מדי').optional(),
    message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(2000, 'ההודעה ארוכה מדי').optional()
});
const ApplicationFormSchema = ContactFormSchema.extend({
    industry: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    companySize: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        '1-10',
        '11-50',
        '51-200',
        '201-500',
        '500+'
    ]).optional(),
    stage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'idea',
        'mvp',
        'early',
        'growth',
        'scale'
    ]).optional(),
    fundingNeeded: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(100000000).optional()
});
const NewsletterSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email('כתובת אימייל לא תקינה'),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
async function submitContactForm(prevState, formData) {
    // Extract form data
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        message: formData.get('message')
    };
    // Extract tracking data
    const sourceUrl = formData.get('sourceUrl');
    const referrerUrl = formData.get('referrerUrl');
    const utmSource = formData.get('utm_source');
    const utmMedium = formData.get('utm_medium');
    const utmCampaign = formData.get('utm_campaign');
    const site = formData.get('site');
    // Validate
    const validationResult = ContactFormSchema.safeParse(rawData);
    if (!validationResult.success) {
        return {
            success: false,
            message: 'נא לתקן את השגיאות בטופס',
            errors: validationResult.error.flatten().fieldErrors
        };
    }
    const validData = validationResult.data;
    // Create lead in Pipedrive
    const leadData = {
        name: validData.name,
        email: validData.email,
        phone: validData.phone,
        company: validData.company,
        message: validData.message,
        sourceUrl: sourceUrl || undefined,
        referrerUrl: referrerUrl || undefined,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        leadSource: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEAD_SOURCES"].WEBSITE,
        formType: 'contact',
        site: site || 'main'
    };
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createLead"])(leadData);
    // Log submission to database
    await logFormSubmission({
        formType: 'contact',
        email: validData.email,
        success: result.success,
        pipedriveId: result.dealId,
        errorCode: result.errorCode,
        site: site || 'main',
        sourceUrl: sourceUrl || undefined
    });
    if (result.success) {
        return {
            success: true,
            message: 'תודה על פנייתך! ניצור איתך קשר בהקדם.',
            leadId: result.dealId
        };
    }
    // Friendly error message for user
    return {
        success: false,
        message: 'אירעה שגיאה בשליחת הטופס. נא לנסות שוב.'
    };
}
async function submitApplicationForm(prevState, formData) {
    // Extract form data
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        message: formData.get('message'),
        industry: formData.get('industry'),
        companySize: formData.get('companySize'),
        stage: formData.get('stage'),
        fundingNeeded: formData.get('fundingNeeded') ? parseInt(formData.get('fundingNeeded')) : undefined
    };
    // Extract tracking data
    const sourceUrl = formData.get('sourceUrl');
    const referrerUrl = formData.get('referrerUrl');
    const utmSource = formData.get('utm_source');
    const utmMedium = formData.get('utm_medium');
    const utmCampaign = formData.get('utm_campaign');
    const site = formData.get('site');
    // Validate
    const validationResult = ApplicationFormSchema.safeParse(rawData);
    if (!validationResult.success) {
        return {
            success: false,
            message: 'נא לתקן את השגיאות בטופס',
            errors: validationResult.error.flatten().fieldErrors
        };
    }
    const validData = validationResult.data;
    // Build message with additional info
    const additionalInfo = [];
    if (validData.industry) additionalInfo.push(`תעשייה: ${validData.industry}`);
    if (validData.companySize) additionalInfo.push(`גודל חברה: ${validData.companySize}`);
    if (validData.stage) additionalInfo.push(`שלב: ${validData.stage}`);
    if (validData.fundingNeeded) additionalInfo.push(`גיוס נדרש: $${validData.fundingNeeded.toLocaleString()}`);
    const fullMessage = [
        validData.message || '',
        additionalInfo.length > 0 ? '\n\n--- פרטים נוספים ---\n' + additionalInfo.join('\n') : ''
    ].filter(Boolean).join('');
    // Create lead in Pipedrive
    const leadData = {
        name: validData.name,
        email: validData.email,
        phone: validData.phone,
        company: validData.company,
        message: fullMessage,
        sourceUrl: sourceUrl || undefined,
        referrerUrl: referrerUrl || undefined,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        leadSource: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEAD_SOURCES"].WEBSITE,
        formType: 'application',
        site: site || 'main',
        industry: validData.industry,
        companySize: validData.companySize,
        budget: validData.fundingNeeded
    };
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createLead"])(leadData);
    // Log submission
    await logFormSubmission({
        formType: 'application',
        email: validData.email,
        success: result.success,
        pipedriveId: result.dealId,
        errorCode: result.errorCode,
        site: site || 'main',
        sourceUrl: sourceUrl || undefined
    });
    if (result.success) {
        return {
            success: true,
            message: 'תודה על הגשת המועמדות! נבדוק את הפרטים ונחזור אליך בהקדם.',
            leadId: result.dealId
        };
    }
    return {
        success: false,
        message: 'אירעה שגיאה בשליחת הטופס. נא לנסות שוב.'
    };
}
async function submitNewsletterSignup(prevState, formData) {
    const rawData = {
        email: formData.get('email'),
        name: formData.get('name') || undefined
    };
    const sourceUrl = formData.get('sourceUrl');
    const site = formData.get('site');
    // Validate
    const validationResult = NewsletterSchema.safeParse(rawData);
    if (!validationResult.success) {
        return {
            success: false,
            message: 'כתובת אימייל לא תקינה',
            errors: validationResult.error.flatten().fieldErrors
        };
    }
    const validData = validationResult.data;
    // Create minimal lead in Pipedrive
    const leadData = {
        name: validData.name || validData.email.split('@')[0],
        email: validData.email,
        sourceUrl: sourceUrl || undefined,
        leadSource: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEAD_SOURCES"].BLOG,
        formType: 'newsletter',
        site: site || 'main'
    };
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createLead"])(leadData);
    // Log submission
    await logFormSubmission({
        formType: 'newsletter',
        email: validData.email,
        success: result.success,
        pipedriveId: result.dealId,
        errorCode: result.errorCode,
        site: site || 'main'
    });
    if (result.success) {
        return {
            success: true,
            message: 'תודה! נרשמת בהצלחה לניוזלטר.'
        };
    }
    return {
        success: false,
        message: 'אירעה שגיאה בהרשמה. נא לנסות שוב.'
    };
}
async function submitEventRegistration(prevState, formData) {
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company')
    };
    const eventId = formData.get('eventId');
    const eventName = formData.get('eventName');
    const sourceUrl = formData.get('sourceUrl');
    const site = formData.get('site');
    // Validate
    const validationResult = ContactFormSchema.safeParse(rawData);
    if (!validationResult.success) {
        return {
            success: false,
            message: 'נא לתקן את השגיאות בטופס',
            errors: validationResult.error.flatten().fieldErrors
        };
    }
    const validData = validationResult.data;
    // Create lead with event context
    const leadData = {
        name: validData.name,
        email: validData.email,
        phone: validData.phone,
        company: validData.company,
        message: eventName ? `הרשמה לאירוע: ${eventName}` : 'הרשמה לאירוע',
        sourceUrl: sourceUrl || undefined,
        leadSource: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEAD_SOURCES"].EVENT_REGISTRATION,
        formType: 'event',
        site: site || 'main'
    };
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createLead"])(leadData);
    // Update event registration count if we have the event ID
    if (result.success && eventId) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].event.update({
                where: {
                    id: eventId
                },
                data: {
                    registeredCount: {
                        increment: 1
                    }
                }
            });
        } catch (error) {
            console.error('[Events] Failed to update registration count:', error);
        }
    }
    // Log submission
    await logFormSubmission({
        formType: 'event',
        email: validData.email,
        success: result.success,
        pipedriveId: result.dealId,
        errorCode: result.errorCode,
        site: site || 'main',
        metadata: {
            eventId,
            eventName
        }
    });
    if (result.success) {
        return {
            success: true,
            message: 'נרשמת בהצלחה לאירוע! נשלח אליך אישור במייל.',
            leadId: result.dealId
        };
    }
    return {
        success: false,
        message: 'אירעה שגיאה בהרשמה. נא לנסות שוב.'
    };
}
async function createLeadAction(data) {
    // Basic validation
    if (!data.name?.trim() || !data.email?.trim()) {
        return {
            success: false,
            message: 'שם ואימייל הם שדות חובה'
        };
    }
    const leadData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message,
        sourceUrl: data.sourceUrl,
        referrerUrl: data.referrerUrl,
        utmSource: data.utmParams?.source,
        utmMedium: data.utmParams?.medium,
        utmCampaign: data.utmParams?.campaign,
        leadSource: data.leadSource || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEAD_SOURCES"].WEBSITE,
        formType: data.formType || 'api',
        site: data.site || 'main'
    };
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pipedrive$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createLead"])(leadData);
    // Log submission
    await logFormSubmission({
        formType: data.formType || 'api',
        email: data.email,
        success: result.success,
        pipedriveId: result.dealId,
        errorCode: result.errorCode,
        site: data.site || 'main',
        sourceUrl: data.sourceUrl
    });
    if (result.success) {
        return {
            success: true,
            message: 'הפנייה נשלחה בהצלחה',
            leadId: result.dealId
        };
    }
    return {
        success: false,
        message: 'אירעה שגיאה. נא לנסות שוב.'
    };
}
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
/**
 * Log form submission to database for analytics
 */ async function logFormSubmission(data) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].activityLog.create({
            data: {
                action: `form.${data.formType}`,
                description: `Form submission: ${data.formType} (${data.success ? 'success' : 'failed'})`,
                metadata: {
                    email: data.email,
                    success: data.success,
                    pipedriveId: data.pipedriveId,
                    errorCode: data.errorCode,
                    site: data.site,
                    sourceUrl: data.sourceUrl,
                    timestamp: new Date().toISOString(),
                    ...data.metadata
                }
            }
        });
    } catch (error) {
        console.error('[Forms] Failed to log submission:', error);
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    submitContactForm,
    submitApplicationForm,
    submitNewsletterSignup,
    submitEventRegistration,
    createLeadAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(submitContactForm, "605b87182665476177959f0982509a25f7985a1fe6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(submitApplicationForm, "6083475df1fa69b3cd4e26cd0411c3fa824c6a8dd1", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(submitNewsletterSignup, "60ce6fbc22464285df3105b9fbd48dae69a0acbff5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(submitEventRegistration, "6026cc6d9a3d04668f0f2865c2abc5b874b8a58b2b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createLeadAction, "40fe730342908d48c76630d681d88b5ded7bd55eec", null);
}),
"[project]/.next-internal/server/app/sites/main/contact/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/leads.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$leads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/leads.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/sites/main/contact/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/leads.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "605b87182665476177959f0982509a25f7985a1fe6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$leads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["submitContactForm"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$sites$2f$main$2f$contact$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$leads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/sites/main/contact/page/actions.js { ACTIONS_MODULE0 => "[project]/app/actions/leads.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$leads$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/leads.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_5474295a._.js.map