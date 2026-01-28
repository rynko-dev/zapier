/**
 * Generate Document Action
 *
 * Generates a document (PDF or Excel) from a template.
 * Allows format selection via input field.
 */

const { DOCUMENTS_ENDPOINT } = require('../lib/config');
const {
  commonDocumentFields,
  buildDocumentPayload,
  documentOutputFields,
  getTemplateVariableFields,
} = require('../lib/action_helpers');

const perform = async (z, bundle) => {
  const payload = buildDocumentPayload(bundle);

  // Add format from input
  if (bundle.inputData.format) {
    payload.format = bundle.inputData.format;
  }

  const response = await z.request({
    url: `${DOCUMENTS_ENDPOINT}/generate`,
    method: 'POST',
    body: payload,
  });

  return response.data;
};

module.exports = {
  key: 'generate_document',
  noun: 'Document',

  display: {
    label: 'Generate Document',
    description:
      'Generate a PDF or Excel document from a template. Choose your output format and provide template variables.',
  },

  operation: {
    perform,

    inputFields: [
      {
        key: 'format',
        label: 'Output Format',
        type: 'string',
        required: true,
        choices: {
          pdf: 'PDF',
          excel: 'Excel',
        },
        helpText: 'Choose the output format for the generated document.',
      },
      ...commonDocumentFields,
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
