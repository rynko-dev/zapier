/**
 * Configuration Constants
 *
 * Central configuration for the Rynko Zapier integration.
 */

// API Base URL - Set via environment variable in Zapier
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.rynko.dev/api';

// Webapp URL - For OAuth authorization (user login & consent)
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://app.rynko.dev';

// API Version
const API_VERSION = 'v1';

// Webhook subscription endpoint
const WEBHOOKS_ENDPOINT = `${API_BASE_URL}/${API_VERSION}/webhook-subscriptions`;

// Documents endpoint
const DOCUMENTS_ENDPOINT = `${API_BASE_URL}/${API_VERSION}/documents`;

// Templates endpoint
const TEMPLATES_ENDPOINT = `${API_BASE_URL}/${API_VERSION}/templates`;

// Integration API endpoint (for teams, workspaces, templates with filtering)
const INTEGRATION_API_ENDPOINT = `${API_BASE_URL}/${API_VERSION}/integration-api`;

// OAuth scopes required for full functionality
const REQUIRED_SCOPES = [
  'documents:generate',
  'documents:read',
  'templates:read',
  'webhooks:read',
  'webhooks:write',
  'profile:read',
];

// Webhook event types
const WEBHOOK_EVENTS = {
  DOCUMENT_COMPLETED: 'document.completed',
  DOCUMENT_FAILED: 'document.failed',
  BATCH_COMPLETED: 'batch.completed',
};

module.exports = {
  API_BASE_URL,
  WEBAPP_URL,
  API_VERSION,
  WEBHOOKS_ENDPOINT,
  DOCUMENTS_ENDPOINT,
  TEMPLATES_ENDPOINT,
  INTEGRATION_API_ENDPOINT,
  REQUIRED_SCOPES,
  WEBHOOK_EVENTS,
};
