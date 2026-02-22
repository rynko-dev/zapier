/**
 * Template List Search (Hidden)
 *
 * This is a hidden search used to power dynamic dropdowns in actions.
 * Users don't interact with this directly - it provides template options
 * for the template selection fields in Generate Document actions.
 */

const { INTEGRATION_API_ENDPOINT } = require('../lib/config');

const perform = async (z, bundle) => {
  const params = {};

  // Filter by workspace if specified
  if (bundle.inputData.workspaceId) {
    params.workspaceId = bundle.inputData.workspaceId;
  }

  // Filter by team if specified (fallback if no workspace)
  if (bundle.inputData.teamId) {
    params.teamId = bundle.inputData.teamId;
  }

  const response = await z.request({
    url: `${INTEGRATION_API_ENDPOINT}/templates`,
    method: 'GET',
    params,
  });

  const templates = response.data || [];

  return templates.map((template) => ({
    id: template.shortId,
    name: `${template.name} (${template.workspaceName})`,
    workspaceId: template.workspaceId,
    workspaceName: template.workspaceName,
    teamId: template.teamId,
    description: template.description || '',
    outputFormats: template.outputFormats || ['pdf'],
  }));
};

module.exports = {
  key: 'template_list',
  noun: 'Template',

  display: {
    label: 'Template List',
    description: 'Get a list of templates (used for dynamic dropdowns).',
    hidden: true, // Hidden from users - only for dropdown population
  },

  operation: {
    perform,

    inputFields: [
      {
        key: 'workspaceId',
        label: 'Environment',
        type: 'string',
        required: false,
        helpText: 'Filter templates by environment.',
      },
      {
        key: 'teamId',
        label: 'Project',
        type: 'string',
        required: false,
        helpText: 'Filter templates by project (used if environment is not specified).',
      },
    ],

    sample: {
      id: 'atpl_abc123',
      name: 'Invoice Template (Marketing)',
      workspaceId: 'ws_xyz789',
      workspaceName: 'Marketing',
      teamId: 'team_abc123',
      description: 'Standard invoice template',
      outputFormats: ['pdf', 'excel'],
    },

    outputFields: [
      { key: 'id', label: 'Template ID', type: 'string' },
      { key: 'name', label: 'Template Name', type: 'string' },
      { key: 'workspaceId', label: 'Environment ID', type: 'string' },
      { key: 'workspaceName', label: 'Environment Name', type: 'string' },
      { key: 'teamId', label: 'Project ID', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'outputFormats', label: 'Output Formats', type: 'string' },
    ],
  },
};
