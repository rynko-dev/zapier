/**
 * PDF Template List Search (Hidden)
 *
 * Hidden search specifically for PDF templates.
 * Used to power the PDF template dropdown in Generate PDF action.
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

  // Filter to only show templates that support PDF output
  const pdfTemplates = templates.filter(
    (t) => t.outputFormats && t.outputFormats.includes('pdf')
  );

  return pdfTemplates.map((template) => ({
    id: template.shortId,
    name: `${template.name} (${template.workspaceName})`,
    workspaceId: template.workspaceId,
    workspaceName: template.workspaceName,
    teamId: template.teamId,
    description: template.description || '',
  }));
};

module.exports = {
  key: 'template_list_pdf',
  noun: 'PDF Template',

  display: {
    label: 'PDF Template List',
    description: 'Get a list of PDF templates (used for dynamic dropdowns).',
    hidden: true,
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
      id: 'atpl_pdf123',
      name: 'Invoice Template (Marketing)',
      workspaceId: 'ws_xyz789',
      workspaceName: 'Marketing',
      teamId: 'team_abc123',
      description: 'Standard invoice PDF template',
    },

    outputFields: [
      { key: 'id', label: 'Template ID', type: 'string' },
      { key: 'name', label: 'Template Name', type: 'string' },
      { key: 'workspaceId', label: 'Environment ID', type: 'string' },
      { key: 'workspaceName', label: 'Environment Name', type: 'string' },
      { key: 'teamId', label: 'Project ID', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
    ],
  },
};
