/**
 * Renderbase Zapier Integration
 *
 * This integration enables Renderbase users to:
 * - Generate PDF and Excel documents from templates
 * - Receive webhook notifications for document events
 */

const authentication = require('./src/authentication');

// Triggers
const documentCompleted = require('./src/triggers/document_completed');
const documentFailed = require('./src/triggers/document_failed');

// Actions (Creates)
const generateDocument = require('./src/creates/generate_document');
const generatePdf = require('./src/creates/generate_pdf');
const generateExcel = require('./src/creates/generate_excel');

// Searches
const findDocumentJob = require('./src/searches/find_document_job');
const teamList = require('./src/searches/team_list');
const workspaceList = require('./src/searches/workspace_list');
const templateList = require('./src/searches/template_list');
const templateListPdf = require('./src/searches/template_list_pdf');
const templateListExcel = require('./src/searches/template_list_excel');
const templateVariables = require('./src/searches/template_variables');

module.exports = {
  // App metadata
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  // Authentication configuration
  authentication: authentication,

  // Before/After middleware
  beforeRequest: [
    (request, z, bundle) => {
      // Add Authorization header with OAuth access token
      if (bundle.authData.access_token) {
        request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
      }
      // Add standard headers
      request.headers['Content-Type'] = 'application/json';
      request.headers['User-Agent'] = 'Renderbase-Zapier/1.0';
      return request;
    },
  ],

  afterResponse: [
    (response, z, bundle) => {
      // Handle API errors
      if (response.status >= 400) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const body = response.json;
          if (body.message) {
            errorMessage = body.message;
          } else if (body.error_description) {
            errorMessage = body.error_description;
          }
        } catch (e) {
          // Use default error message
        }

        if (response.status === 401) {
          throw new z.errors.RefreshAuthError(errorMessage);
        }
        throw new z.errors.Error(errorMessage, 'ApiError', response.status);
      }
      return response;
    },
  ],

  // Triggers - Events that start a Zap
  triggers: {
    [documentCompleted.key]: documentCompleted,
    [documentFailed.key]: documentFailed,
    // Hidden triggers for dynamic dropdowns (cascading: team -> workspace -> template)
    [teamList.key]: teamList,
    [workspaceList.key]: workspaceList,
    [templateList.key]: templateList,
    [templateListPdf.key]: templateListPdf,
    [templateListExcel.key]: templateListExcel,
  },

  // Creates - Actions that create something
  creates: {
    [generateDocument.key]: generateDocument,
    [generatePdf.key]: generatePdf,
    [generateExcel.key]: generateExcel,
  },

  // Searches - Find existing records
  searches: {
    [findDocumentJob.key]: findDocumentJob,
    [templateVariables.key]: templateVariables,
  },

  // Resources (optional, for advanced use cases)
  resources: {},
};
