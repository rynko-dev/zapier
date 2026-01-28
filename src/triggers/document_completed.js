/**
 * Document Completed Trigger
 *
 * Fires when a document is successfully generated through Rynko.
 */

const { WEBHOOK_EVENTS } = require('../lib/config');
const {
  subscribeHook,
  unsubscribeHook,
  performHook,
  performList,
  createSampleData,
} = require('../lib/webhook_helpers');

const EVENT_TYPE = WEBHOOK_EVENTS.DOCUMENT_COMPLETED;

module.exports = {
  key: 'document_completed',
  noun: 'Document',

  display: {
    label: 'Document Completed',
    description: 'Triggers when a document is successfully generated through Rynko.',
  },

  operation: {
    type: 'hook',

    // Subscribe to webhook when Zap is turned on
    performSubscribe: (z, bundle) => subscribeHook(z, bundle, EVENT_TYPE),

    // Unsubscribe when Zap is turned off
    performUnsubscribe: unsubscribeHook,

    // Process incoming webhook
    perform: performHook,

    // Fetch sample data for testing
    performList: (z, bundle) =>
      performList(z, bundle, EVENT_TYPE, createSampleData[EVENT_TYPE]),

    // Sample data structure
    sample: {
      id: 'evt_sample_123',
      type: 'document.completed',
      timestamp: '2025-01-15T10:30:00Z',
      data: {
        jobId: 'job_abc123',
        templateId: 'template_xyz789',
        templateName: 'Invoice Template',
        format: 'pdf',
        status: 'completed',
        downloadUrl: 'https://api.rynko.dev/v1/documents/job_abc123/download',
        fileSize: 125000,
        completedAt: '2025-01-15T10:30:00Z',
      },
    },

    // Output field definitions for mapping in Zapier
    outputFields: [
      { key: 'id', label: 'Event ID', type: 'string' },
      { key: 'type', label: 'Event Type', type: 'string' },
      { key: 'timestamp', label: 'Event Timestamp', type: 'datetime' },
      { key: 'data__jobId', label: 'Job ID', type: 'string' },
      { key: 'data__templateId', label: 'Template ID', type: 'string' },
      { key: 'data__templateName', label: 'Template Name', type: 'string' },
      { key: 'data__format', label: 'Format', type: 'string' },
      { key: 'data__status', label: 'Status', type: 'string' },
      { key: 'data__downloadUrl', label: 'Download URL', type: 'string' },
      { key: 'data__fileSize', label: 'File Size (bytes)', type: 'integer' },
      { key: 'data__completedAt', label: 'Completed At', type: 'datetime' },
    ],
  },
};
