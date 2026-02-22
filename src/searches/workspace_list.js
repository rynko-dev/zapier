/**
 * Environment List Search (Hidden)
 *
 * This is a hidden search used to power dynamic dropdowns in actions.
 * Users don't interact with this directly - it provides environment options
 * filtered by the selected project.
 */

const { INTEGRATION_API_ENDPOINT } = require('../lib/config');

const perform = async (z, bundle) => {
  const params = {};

  // Filter by team if specified
  if (bundle.inputData.teamId) {
    params.teamId = bundle.inputData.teamId;
  }

  const response = await z.request({
    url: `${INTEGRATION_API_ENDPOINT}/workspaces`,
    method: 'GET',
    params,
  });

  const workspaces = response.data || [];

  return workspaces.map((workspace) => ({
    id: workspace.id,
    name: `${workspace.name} (${workspace.teamName})`,
    teamId: workspace.teamId,
    teamName: workspace.teamName,
    description: workspace.description || '',
  }));
};

module.exports = {
  key: 'workspace_list',
  noun: 'Environment',

  display: {
    label: 'Environment List',
    description: 'Get a list of environments (used for dynamic dropdowns).',
    hidden: true, // Hidden from users - only for dropdown population
  },

  operation: {
    perform,

    inputFields: [
      {
        key: 'teamId',
        label: 'Project',
        type: 'string',
        required: false,
        helpText: 'Filter environments by project.',
      },
    ],

    sample: {
      id: 'ws_xyz789',
      name: 'Marketing (My Company)',
      teamId: 'team_abc123',
      teamName: 'My Company',
      description: 'Marketing environment',
    },

    outputFields: [
      { key: 'id', label: 'Environment ID', type: 'string' },
      { key: 'name', label: 'Environment Name', type: 'string' },
      { key: 'teamId', label: 'Project ID', type: 'string' },
      { key: 'teamName', label: 'Project Name', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
    ],
  },
};
