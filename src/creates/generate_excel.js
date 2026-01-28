/**
 * Generate Excel Action
 *
 * Generates an Excel document from a template.
 * Simplified action specifically for Excel generation.
 */

const { DOCUMENTS_ENDPOINT } = require('../lib/config');
const {
  excelFields,
  buildDocumentPayload,
  documentOutputFields,
  getTemplateVariableFields,
} = require('../lib/action_helpers');

const perform = async (z, bundle) => {
  const payload = buildDocumentPayload(bundle, 'excel');

  const response = await z.request({
    url: `${DOCUMENTS_ENDPOINT}/generate`,
    method: 'POST',
    body: payload,
  });

  return response.data;
};

module.exports = {
  key: 'generate_excel',
  noun: 'Excel',

  display: {
    label: 'Generate Excel',
    description:
      'Generate an Excel spreadsheet from a template. Provide template variables to customize the output.',
  },

  operation: {
    perform,

    inputFields: [
      ...excelFields,
      // Dynamic template variables
      getTemplateVariableFields,
    ],

    sample: {
      id: 'job_abc123',
      status: 'completed',
      templateId: 'tmpl_xyz789',
      templateName: 'Sales Report Template',
      format: 'excel',
      fileName: 'Sales-Report-2025.xlsx',
      downloadUrl: 'https://api.rynko.dev/v1/documents/job_abc123/download',
      fileSize: 89000,
      createdAt: '2025-01-15T10:30:00Z',
      completedAt: '2025-01-15T10:30:05Z',
    },

    outputFields: documentOutputFields,
  },
};
