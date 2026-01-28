/**
 * Webhook Helper Functions
 *
 * Common functions for creating webhook-based triggers.
 */

const { WEBHOOKS_ENDPOINT, API_BASE_URL } = require('./config');

/**
 * Subscribe to a webhook event
 * Creates a webhook subscription in Rynko
 */
const subscribeHook = async (z, bundle, eventType) => {
  const response = await z.request({
    url: WEBHOOKS_ENDPOINT,
    method: 'POST',
    body: {
      url: bundle.targetUrl,
      events: [eventType],
      description: `Zapier webhook for ${eventType}`,
    },
  });

  // Return subscription data including the ID for unsubscribing later
  return {
    id: response.data.id,
    secret: response.data.secret,
  };
};

/**
 * Unsubscribe from a webhook
 * Deletes the webhook subscription when Zap is turned off
 */
const unsubscribeHook = async (z, bundle) => {
  // bundle.subscribeData contains data returned from subscribeHook
  const subscriptionId = bundle.subscribeData.id;

  if (!subscriptionId) {
    return { success: true, message: 'No subscription to remove' };
  }

  await z.request({
    url: `${WEBHOOKS_ENDPOINT}/${subscriptionId}`,
    method: 'DELETE',
  });

  return { success: true };
};

/**
 * Parse incoming webhook payload
 * Called when Rynko sends a webhook to Zapier
 */
const performHook = (z, bundle) => {
  // The webhook payload is available in bundle.cleanedRequest
  const payload = bundle.cleanedRequest;

  // Return as an array (Zapier expects an array of results)
  return [payload];
};

/**
 * Get sample data for testing
 * Called when user tests the trigger in Zapier
 */
const performList = async (z, bundle, eventType, sampleGenerator) => {
  // Try to fetch recent data from the API
  // If not available, return sample data
  try {
    // For document events, we can fetch recent document jobs
    if (eventType.startsWith('document.') || eventType.startsWith('batch.')) {
      const response = await z.request({
        url: `${API_BASE_URL}/v1/documents`,
        method: 'GET',
        params: {
          limit: 3,
          sort: 'createdAt',
          order: 'desc',
        },
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data.map((job) => ({
          id: job.id,
          type: eventType,
          timestamp: job.createdAt,
          data: {
            jobId: job.id,
            templateId: job.templateId,
            status: job.status,
            format: job.format,
            downloadUrl: job.downloadUrl,
          },
        }));
      }
    }
  } catch (error) {
    // Fall back to sample data
  }

  // Return sample data
  return [sampleGenerator()];
};

/**
 * Create sample data for a specific event type
 */
const createSampleData = {
  'document.completed': () => ({
    id: `evt_${Date.now()}`,
    type: 'document.completed',
    timestamp: new Date().toISOString(),
    data: {
      jobId: 'job_sample_123',
      templateId: 'template_sample_456',
      templateName: 'Invoice Template',
      format: 'pdf',
      status: 'completed',
      downloadUrl: 'https://api.rynko.dev/v1/documents/job_sample_123/download',
      fileSize: 125000,
      completedAt: new Date().toISOString(),
    },
  }),

  'document.failed': () => ({
    id: `evt_${Date.now()}`,
    type: 'document.failed',
    timestamp: new Date().toISOString(),
    data: {
      jobId: 'job_sample_123',
      templateId: 'template_sample_456',
      templateName: 'Invoice Template',
      format: 'pdf',
      status: 'failed',
      error: 'Variable "customerName" is required but was not provided',
      failedAt: new Date().toISOString(),
    },
  }),

  'batch.completed': () => ({
    id: `evt_${Date.now()}`,
    type: 'batch.completed',
    timestamp: new Date().toISOString(),
    data: {
      batchId: 'batch_sample_123',
      templateId: 'template_sample_456',
      templateName: 'Invoice Template',
      totalDocuments: 10,
      successCount: 9,
      failureCount: 1,
      format: 'pdf',
      status: 'completed',
      downloadUrl: 'https://api.rynko.dev/v1/batches/batch_sample_123/download',
      completedAt: new Date().toISOString(),
    },
  }),
};

module.exports = {
  subscribeHook,
  unsubscribeHook,
  performHook,
  performList,
  createSampleData,
};
