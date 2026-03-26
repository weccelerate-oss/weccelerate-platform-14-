/**
 * Pipedrive Service
 * 
 * Comprehensive service for interacting with Pipedrive CRM.
 * Handles lead generation, person/deal creation, and tracking.
 * 
 * @module lib/pipedrive
 */

import {
  PIPEDRIVE_CONFIG,
  PIPEDRIVE_CUSTOM_FIELDS,
  PIPEDRIVE_PIPELINES,
  PIPEDRIVE_DEFAULTS,
  LEAD_SOURCES,
  LeadSource,
  buildPipedriveUrl,
  validatePipedriveConfig,
} from '@/config/pipedrive';

// =============================================================================
// TYPES
// =============================================================================

export interface LeadData {
  // Required fields
  name: string;
  email: string;
  
  // Optional fields
  phone?: string;
  company?: string;
  message?: string;
  
  // Tracking
  sourceUrl?: string;      // Page URL where the form was submitted
  referrerUrl?: string;    // Previous page (HTTP referrer)
  utmSource?: string;      // UTM source parameter
  utmMedium?: string;      // UTM medium parameter
  utmCampaign?: string;    // UTM campaign parameter
  
  // Lead metadata
  leadSource?: LeadSource; // Source category
  formType?: string;       // Type of form (contact, application, newsletter)
  site?: string;           // Which subdomain (main, leumit, biz)
  
  // Additional custom fields
  industry?: string;
  companySize?: string;
  budget?: number;
}

export interface PipedriveResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  additional_data?: Record<string, unknown>;
}

export interface PipedrivePerson {
  id: number;
  name: string;
  email: { value: string; primary: boolean; label: string }[];
  phone: { value: string; primary: boolean; label: string }[];
  org_id: number | null;
  add_time: string;
  update_time: string;
  visible_to: string;
  [key: string]: unknown; // Custom fields
}

export interface PipedriveDeal {
  id: number;
  title: string;
  value: number;
  currency: string;
  status: 'open' | 'won' | 'lost' | 'deleted';
  stage_id: number;
  pipeline_id: number;
  person_id: number | null;
  org_id: number | null;
  add_time: string;
  update_time: string;
  [key: string]: unknown; // Custom fields
}

export interface PipedriveOrganization {
  id: number;
  name: string;
  address: string | null;
  add_time: string;
  [key: string]: unknown;
}

export interface PipedriveNote {
  id: number;
  content: string;
  deal_id: number | null;
  person_id: number | null;
  org_id: number | null;
  add_time: string;
}

export interface PipedriveActivity {
  id: number;
  type: string;
  subject: string;
  done: boolean;
  due_date: string | null;
  due_time: string | null;
  duration: string | null;
  add_time: string;
  marked_as_done_time: string | null;
  deal_id: number | null;
  person_id: number | null;
  org_id: number | null;
  note: string | null;
  public_description: string | null;
  location: string | null;
  busy_flag: boolean;
  [key: string]: unknown;
}

export interface PipedriveDealProduct {
  id: number;
  deal_id: number;
  product_id: number;
  name: string;
  item_price: number;
  quantity: number;
  sum: number;
  currency: string;
  active_flag: boolean;
  enabled_flag: boolean;
  add_time: string;
  last_edit: string | null;
  comments: string | null;
  tax: number;
  [key: string]: unknown;
}

export interface CreateLeadResult {
  success: boolean;
  personId?: number;
  dealId?: number;
  organizationId?: number;
  error?: string;
  errorCode?: string;
}

// =============================================================================
// API CLIENT
// =============================================================================

class PipedriveClient {
  private baseUrl: string;
  private apiToken: string;
  private isConfigured: boolean;

  constructor() {
    this.baseUrl = PIPEDRIVE_CONFIG.API_BASE_URL;
    this.apiToken = PIPEDRIVE_CONFIG.API_TOKEN;
    
    const { valid } = validatePipedriveConfig();
    this.isConfigured = valid;
  }

  /**
   * Check if the client is properly configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Make an API request to Pipedrive
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<PipedriveResponse<T>> {
    if (!this.isConfigured) {
      console.error('[Pipedrive] Client not configured');
      return {
        success: false,
        data: null,
        error: 'Pipedrive is not configured',
      };
    }

    const url = buildPipedriveUrl(endpoint);
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
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
          error: result.error || `API error: ${response.status}`,
        };
      }

      return result as PipedriveResponse<T>;
    } catch (error) {
      console.error('[Pipedrive] Request failed:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  // ===========================================================================
  // PERSONS
  // ===========================================================================

  /**
   * Search for existing person by email
   */
  async findPersonByEmail(email: string): Promise<PipedrivePerson | null> {
    const response = await this.request<PipedrivePerson[]>(
      'GET',
      `/persons/search?term=${encodeURIComponent(email)}&fields=email&limit=1`
    );

    if (response.success && response.data && response.data.length > 0) {
      // Search returns items with data property
      const items = response.data as unknown as { item: PipedrivePerson }[];
      return items[0]?.item || null;
    }
    
    return null;
  }

  /**
   * Create a new person
   */
  async createPerson(data: {
    name: string;
    email: string;
    phone?: string;
    org_id?: number;
    visible_to?: number;
    customFields?: Record<string, unknown>;
  }): Promise<PipedriveResponse<PipedrivePerson>> {
    const personData: Record<string, unknown> = {
      name: data.name,
      email: [{ value: data.email, primary: true, label: 'work' }],
      visible_to: data.visible_to || PIPEDRIVE_DEFAULTS.VISIBILITY,
    };

    if (data.phone) {
      personData.phone = [{ value: data.phone, primary: true, label: 'work' }];
    }

    if (data.org_id) {
      personData.org_id = data.org_id;
    }

    // Add custom fields
    if (data.customFields) {
      Object.entries(data.customFields).forEach(([key, value]) => {
        if (key && value !== undefined && value !== '') {
          personData[key] = value;
        }
      });
    }

    return this.request<PipedrivePerson>('POST', '/persons', personData);
  }

  /**
   * Update an existing person
   */
  async updatePerson(
    personId: number,
    data: Record<string, unknown>
  ): Promise<PipedriveResponse<PipedrivePerson>> {
    return this.request<PipedrivePerson>('PUT', `/persons/${personId}`, data);
  }

  // ===========================================================================
  // ORGANIZATIONS
  // ===========================================================================

  /**
   * Search for existing organization by name
   */
  async findOrganizationByName(name: string): Promise<PipedriveOrganization | null> {
    const response = await this.request<PipedriveOrganization[]>(
      'GET',
      `/organizations/search?term=${encodeURIComponent(name)}&limit=1`
    );

    if (response.success && response.data && response.data.length > 0) {
      const items = response.data as unknown as { item: PipedriveOrganization }[];
      return items[0]?.item || null;
    }
    
    return null;
  }

  /**
   * Create a new organization
   */
  async createOrganization(data: {
    name: string;
    visible_to?: number;
    customFields?: Record<string, unknown>;
  }): Promise<PipedriveResponse<PipedriveOrganization>> {
    const orgData: Record<string, unknown> = {
      name: data.name,
      visible_to: data.visible_to || PIPEDRIVE_DEFAULTS.VISIBILITY,
    };

    if (data.customFields) {
      Object.entries(data.customFields).forEach(([key, value]) => {
        if (key && value !== undefined && value !== '') {
          orgData[key] = value;
        }
      });
    }

    return this.request<PipedriveOrganization>('POST', '/organizations', orgData);
  }

  // ===========================================================================
  // DEALS
  // ===========================================================================

  /**
   * Create a new deal
   */
  async createDeal(data: {
    title: string;
    person_id?: number;
    org_id?: number;
    value?: number;
    currency?: string;
    stage_id?: number;
    pipeline_id?: number;
    visible_to?: number;
    customFields?: Record<string, unknown>;
  }): Promise<PipedriveResponse<PipedriveDeal>> {
    const dealData: Record<string, unknown> = {
      title: data.title,
      value: data.value ?? PIPEDRIVE_DEFAULTS.DEAL_VALUE,
      currency: data.currency || PIPEDRIVE_DEFAULTS.CURRENCY,
      stage_id: data.stage_id || PIPEDRIVE_PIPELINES.DEFAULT_STAGE_ID,
      pipeline_id: data.pipeline_id || PIPEDRIVE_PIPELINES.DEFAULT_PIPELINE_ID,
      visible_to: data.visible_to || PIPEDRIVE_DEFAULTS.VISIBILITY,
    };

    if (data.person_id) {
      dealData.person_id = data.person_id;
    }

    if (data.org_id) {
      dealData.org_id = data.org_id;
    }

    // Add custom fields
    if (data.customFields) {
      Object.entries(data.customFields).forEach(([key, value]) => {
        if (key && value !== undefined && value !== '') {
          dealData[key] = value;
        }
      });
    }

    return this.request<PipedriveDeal>('POST', '/deals', dealData);
  }

  // ===========================================================================
  // NOTES
  // ===========================================================================

  /**
   * Add a note to a deal or person
   */
  async addNote(data: {
    content: string;
    deal_id?: number;
    person_id?: number;
    org_id?: number;
  }): Promise<PipedriveResponse<PipedriveNote>> {
    return this.request<PipedriveNote>('POST', '/notes', data);
  }

  /**
   * Get products attached to a deal
   */
  async getDealProducts(dealId: number | string): Promise<PipedriveDealProduct[]> {
    const response = await this.request<PipedriveDealProduct[]>(
      'GET',
      `/deals/${dealId}/products`
    );

    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  /**
   * Get deals linked to a person
   */
  async getPersonDeals(personId: number): Promise<PipedriveDeal[]> {
    const response = await this.request<PipedriveDeal[]>(
      'GET',
      `/persons/${personId}/deals?status=all_not_deleted&sort=add_time DESC`
    );
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  /**
   * Get activities linked to a deal (meetings, calls, tasks, etc.)
   */
  async getDealActivities(dealId: number | string): Promise<PipedriveActivity[]> {
    const response = await this.request<PipedriveActivity[]>(
      'GET',
      `/deals/${dealId}/activities?done=0,1`
    );
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  /**
   * Get deal details by ID
   */
  async getDeal(dealId: number | string): Promise<PipedriveDeal | null> {
    const response = await this.request<PipedriveDeal>('GET', `/deals/${dealId}`);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const pipedriveClient = new PipedriveClient();

// =============================================================================
// LEAD GENERATION FUNCTIONS
// =============================================================================

/**
 * Create a complete lead in Pipedrive (Person + Organization + Deal + Note)
 * 
 * This is the main function for lead generation from website forms.
 * It handles deduplication, creates all necessary entities, and adds tracking.
 */
export async function createLead(leadData: LeadData): Promise<CreateLeadResult> {
  const startTime = Date.now();
  console.log('[Pipedrive] Creating lead:', { 
    name: leadData.name, 
    email: leadData.email,
    source: leadData.leadSource || LEAD_SOURCES.WEBSITE,
  });

  // Validate required fields
  if (!leadData.name?.trim()) {
    return { success: false, error: 'Name is required', errorCode: 'MISSING_NAME' };
  }
  if (!leadData.email?.trim()) {
    return { success: false, error: 'Email is required', errorCode: 'MISSING_EMAIL' };
  }
  if (!isValidEmail(leadData.email)) {
    return { success: false, error: 'Invalid email format', errorCode: 'INVALID_EMAIL' };
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
    let organizationId: number | undefined;
    let personId: number | undefined;
    let dealId: number | undefined;

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
            ...(PIPEDRIVE_CUSTOM_FIELDS.PERSON.INDUSTRY && leadData.industry && {
              [PIPEDRIVE_CUSTOM_FIELDS.PERSON.INDUSTRY]: leadData.industry,
            }),
          },
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
    const personCustomFields: Record<string, unknown> = {};
    
    // Lead source field
    if (PIPEDRIVE_CUSTOM_FIELDS.PERSON.LEAD_SOURCE) {
      personCustomFields[PIPEDRIVE_CUSTOM_FIELDS.PERSON.LEAD_SOURCE] = 
        leadData.leadSource || LEAD_SOURCES.WEBSITE;
    }
    
    // Source URL field
    if (PIPEDRIVE_CUSTOM_FIELDS.PERSON.SOURCE_URL && leadData.sourceUrl) {
      personCustomFields[PIPEDRIVE_CUSTOM_FIELDS.PERSON.SOURCE_URL] = leadData.sourceUrl;
    }
    
    // Company size
    if (PIPEDRIVE_CUSTOM_FIELDS.PERSON.COMPANY_SIZE && leadData.companySize) {
      personCustomFields[PIPEDRIVE_CUSTOM_FIELDS.PERSON.COMPANY_SIZE] = leadData.companySize;
    }

    if (existingPerson) {
      // Update existing person with new data
      personId = existingPerson.id;
      console.log('[Pipedrive] Found existing person:', personId);
      
      // Optionally update with new info
      await pipedriveClient.updatePerson(personId, {
        org_id: organizationId,
        ...personCustomFields,
      });
    } else {
      // Create new person
      const personResult = await pipedriveClient.createPerson({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        org_id: organizationId,
        customFields: personCustomFields,
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
    const dealCustomFields: Record<string, unknown> = {};
    
    // Lead source for deal
    if (PIPEDRIVE_CUSTOM_FIELDS.DEAL.LEAD_SOURCE) {
      dealCustomFields[PIPEDRIVE_CUSTOM_FIELDS.DEAL.LEAD_SOURCE] = 
        leadData.leadSource || LEAD_SOURCES.WEBSITE;
    }
    
    // Conversion URL
    if (PIPEDRIVE_CUSTOM_FIELDS.DEAL.CONVERSION_URL && leadData.sourceUrl) {
      dealCustomFields[PIPEDRIVE_CUSTOM_FIELDS.DEAL.CONVERSION_URL] = leadData.sourceUrl;
    }
    
    // UTM tracking
    if (PIPEDRIVE_CUSTOM_FIELDS.DEAL.UTM_CAMPAIGN && leadData.utmCampaign) {
      dealCustomFields[PIPEDRIVE_CUSTOM_FIELDS.DEAL.UTM_CAMPAIGN] = leadData.utmCampaign;
    }
    if (PIPEDRIVE_CUSTOM_FIELDS.DEAL.UTM_SOURCE && leadData.utmSource) {
      dealCustomFields[PIPEDRIVE_CUSTOM_FIELDS.DEAL.UTM_SOURCE] = leadData.utmSource;
    }

    const dealResult = await pipedriveClient.createDeal({
      title: dealTitle,
      person_id: personId,
      org_id: organizationId,
      value: leadData.budget,
      customFields: dealCustomFields,
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
      person_id: personId,
    });

    // =========================================================================
    // Success!
    // =========================================================================
    
    const duration = Date.now() - startTime;
    console.log(`[Pipedrive] Lead created successfully in ${duration}ms:`, {
      personId,
      dealId,
      organizationId,
    });

    return {
      success: true,
      personId,
      dealId,
      organizationId,
    };

  } catch (error) {
    console.error('[Pipedrive] Error creating lead:', error);
    
    // Log locally as backup
    await logLeadLocally(leadData);
    
    return {
      success: false,
      error: 'Failed to submit lead',
      errorCode: 'CRM_ERROR',
    };
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Build deal title from lead data
 */
function buildDealTitle(leadData: LeadData): string {
  const parts: string[] = [];
  
  // Add form type if available
  if (leadData.formType) {
    const formTypeMap: Record<string, string> = {
      contact: 'פנייה',
      application: 'מועמדות',
      newsletter: 'הרשמה',
      consultation: 'ייעוץ',
      event: 'אירוע',
    };
    parts.push(formTypeMap[leadData.formType] || leadData.formType);
  } else {
    parts.push('ליד מהאתר');
  }
  
  // Add site identifier
  if (leadData.site && leadData.site !== 'main') {
    const siteMap: Record<string, string> = {
      leumit: '(לאומית)',
      biz: '(עסקים)',
      landing: '(דף נחיתה)',
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
 */
function buildNoteContent(leadData: LeadData): string {
  const lines: string[] = [];
  
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
  lines.push(`• מקור: ${leadData.leadSource || LEAD_SOURCES.WEBSITE}`);
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
 */
async function logLeadLocally(leadData: LeadData): Promise<void> {
  try {
    // Import prisma dynamically to avoid circular dependencies
    const { prisma } = await import('@/lib/db');
    
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
            site: leadData.site,
          },
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    console.log('[Pipedrive] Lead logged locally as backup');
  } catch (error) {
    console.error('[Pipedrive] Failed to log lead locally:', error);
    // Last resort: log to console
    console.log('[Pipedrive] BACKUP LEAD DATA:', JSON.stringify(leadData, null, 2));
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { LEAD_SOURCES };
export type { LeadSource };
