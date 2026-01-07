/**
 * Pipedrive Configuration
 * 
 * Centralized configuration for Pipedrive CRM integration.
 * Update these values based on your Pipedrive account setup.
 */

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const PIPEDRIVE_CONFIG = {
  // Base API URL
  API_BASE_URL: 'https://api.pipedrive.com/v1',
  
  // API Token from environment
  API_TOKEN: process.env.PIPEDRIVE_API_TOKEN || '',
  
  // Company domain (e.g., "weccelerate" for weccelerate.pipedrive.com)
  COMPANY_DOMAIN: process.env.PIPEDRIVE_COMPANY_DOMAIN || '',
  
  // Webhook secret for verification
  WEBHOOK_SECRET: process.env.PIPEDRIVE_WEBHOOK_SECRET || '',
} as const;

// =============================================================================
// CUSTOM FIELD IDs
// =============================================================================
// These IDs must match your Pipedrive account's custom field setup.
// Find them in Pipedrive: Settings → Data Fields → [Entity] Fields

export const PIPEDRIVE_CUSTOM_FIELDS = {
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
    INDUSTRY: process.env.PIPEDRIVE_FIELD_INDUSTRY || '',
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
    UTM_SOURCE: process.env.PIPEDRIVE_FIELD_UTM_SOURCE || '',
  },
} as const;

// =============================================================================
// PIPELINE CONFIGURATION
// =============================================================================

export const PIPEDRIVE_PIPELINES = {
  // Default pipeline for website leads
  // Find ID in Pipedrive: Settings → Pipelines
  DEFAULT_PIPELINE_ID: parseInt(process.env.PIPEDRIVE_DEFAULT_PIPELINE_ID || '1'),
  
  // Default stage ID (usually first stage - "New Lead" or "Characterization")
  DEFAULT_STAGE_ID: parseInt(process.env.PIPEDRIVE_DEFAULT_STAGE_ID || '1'),
  
  // Pipeline for different lead types (optional)
  ACCELERATION_PIPELINE_ID: parseInt(process.env.PIPEDRIVE_ACCELERATION_PIPELINE_ID || '1'),
  CONSULTING_PIPELINE_ID: parseInt(process.env.PIPEDRIVE_CONSULTING_PIPELINE_ID || '1'),
} as const;

// =============================================================================
// LEAD SOURCE VALUES
// =============================================================================

export const LEAD_SOURCES = {
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
  REFERRAL: 'Referral',
} as const;

export type LeadSource = typeof LEAD_SOURCES[keyof typeof LEAD_SOURCES];

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const PIPEDRIVE_DEFAULTS = {
  // Default currency for deals
  CURRENCY: 'ILS',
  
  // Default deal value (0 for leads without known value)
  DEAL_VALUE: 0,
  
  // Default visibility (1 = owner only, 3 = entire company)
  VISIBILITY: 3,
  
  // Default label IDs (create these in Pipedrive)
  LABELS: {
    HOT_LEAD: parseInt(process.env.PIPEDRIVE_LABEL_HOT || '0'),
    WEBSITE_LEAD: parseInt(process.env.PIPEDRIVE_LABEL_WEBSITE || '0'),
  },
} as const;

// =============================================================================
// VALIDATION
// =============================================================================

export function validatePipedriveConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!PIPEDRIVE_CONFIG.API_TOKEN) {
    errors.push('PIPEDRIVE_API_TOKEN is not configured');
  }
  
  if (!PIPEDRIVE_CONFIG.COMPANY_DOMAIN) {
    errors.push('PIPEDRIVE_COMPANY_DOMAIN is not configured');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// HELPER: Build Pipedrive URL
// =============================================================================

export function buildPipedriveUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${PIPEDRIVE_CONFIG.API_BASE_URL}${endpoint}`);
  url.searchParams.set('api_token', PIPEDRIVE_CONFIG.API_TOKEN);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}
