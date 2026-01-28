/**
 * Find Document Job Search
 *
 * Searches for a document generation job by ID or retrieves job details.
 */

const { DOCUMENTS_ENDPOINT } = require('../lib/config');

const perform = async (z, bundle) => {
  // If jobId is provided, fetch directly
  if (bundle.inputData.jobId) {
    const response = await z.request({
      url: `${DOCUMENTS_ENDPOINT}/${bundle.inputData.jobId}`,
      method: 'GET',
    });

    return [response.data];
  }

  // Otherwise, search with filters
  const params = {};

  if (bundle.inputData.status) {
    params.status = bundle.inputData.status;
  }
  if (bundle.inputData.templateId) {
    params.templateId = bundle.inputData.templateId;
  }
  if (bundle.inputData.format) {
    params.format = bundle.inputData.format;
  }
  if (bundle.inputData.dateFrom) {
    params.dateFrom = bundle.inputData.dateFrom;
  }
  if (bundle.inputData.dateTo) {
    params.dateTo = bundle.inputData.dateTo;
  }

  params.limit = 1; // Return only the most recent match

  const response = await z.request({
    url: DOCUMENTS_ENDPOINT,
    method: 'GET',
    params,
  });

  return response.data.data || [];
};

module.exports = {
  key: 'find_document_job',
  noun: 'Document Job',

  display: {
    label: 'Find Document Job',
    description: 'Find a document generation job by ID or search for jobs by status, template, or date range.',
  },

  operation: {
    perform,

    inputFields: [
      {
        key: 'jobId',
        label: 'Job ID',
        type: 'string',
        required: false,
        helpText: 'The unique ID of the document job to retrieve. If provided, other filters are ignored.',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        required: false,
        choices: {
          pending: 'Pending',
          processing: 'Processing',
          completed: 'Completed',
          failed: 'Failed',
        },
        helpText: 'Filter by job status.',
      },
      {
        key: 'templateId',
        label: 'Template',
        type: 'string',
        required: false,
        dynamic: 'template_list.id.name',
        helpText: 'Filter by the template used to generate the document.',
      },
      {
        key: 'format',
        label: 'Format',
        type: 'string',
        required: false,
        choices: {
          pdf: 'PDF',
          excel: 'Excel',
        },
        helpText: 'Filter by output format.',
      },
      {
        key: 'dateFrom',
        label: 'Date From',
        type: 'datetime',
        required: false,
        helpText: 'Search for jobs created on or after this date.',
      },
      {
        key: 'dateTo',
        label: 'Date To',
        type: 'datetime',
        required: false,
        helpText: 'Search for jobs created on or before this date.',
      },
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

    outputFields: [
      { key: 'id', label: 'Job ID', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'templateId', label: 'Template ID', type: 'string' },
      { key: 'templateName', label: 'Template Name', type: 'string' },
      { key: 'format', label: 'Format', type: 'string' },
      { key: 'fileName', label: 'File Name', type: 'string' },
      { key: 'downloadUrl', label: 'Download URL', type: 'string' },
      { key: 'fileSize', label: 'File Size (bytes)', type: 'integer' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
      { key: 'completedAt', label: 'Completed At', type: 'datetime' },
      { key: 'error', label: 'Error (if failed)', type: 'string' },
    ],
  },
};
