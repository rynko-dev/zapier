/**
 * Generate PDF Action
 *
 * Generates a PDF document from a template.
 * Simplified action specifically for PDF generation.
 */

const { DOCUMENTS_ENDPOINT } = require('../lib/config');
const {
  pdfFields,
  buildDocumentPayload,
  documentOutputFields,
  getTemplateVariableFields,
} = require('../lib/action_helpers');

const perform = async (z, bundle) => {
  const payload = buildDocumentPayload(bundle, 'pdf');

  const response = await z.request({
    url: `${DOCUMENTS_ENDPOINT}/generate`,
    method: 'POST',
    body: payload,
  });

  return response.data;
};

module.exports = {
  key: 'generate_pdf',
  noun: 'PDF',

  display: {
    label: 'Generate PDF',
    description:
      'Generate a PDF document from a template. Provide template variables to customize the output.',
  },

  operation: {
    perform,

    inputFields: [
      ...pdfFields,
      // Dynamic template variables
      getTemplateVariableFields,
    ],

    sample: {
      id: 'job_abc123',
      status: 'completed',
      templateId: 'tmpl_xyz789',
      templateName: 'Invoice Template',
      format: 'pdf',
      fileName: 'Invoice-12345.pdf',
      downloadUrl: 'https://api.rynko.dev/v1/documents/job_abc123/download',
      fileSize: 125000,
      createdAt: '2025-01-15T10:30:00Z',
      completedAt: '2025-01-15T10:30:05Z',
    },

    outputFields: documentOutputFields,
  },
};
