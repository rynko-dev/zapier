/**
 * Project List Search (Hidden)
 *
 * This is a hidden search used to power dynamic dropdowns in actions.
 * Users don't interact with this directly - it provides project options
 * for the project selection fields in Generate Document actions.
 */

const { INTEGRATION_API_ENDPOINT } = require('../lib/config');

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${INTEGRATION_API_ENDPOINT}/teams`,
    method: 'GET',
  });

  const teams = response.data || [];

  return teams.map((team) => ({
    id: team.id,
    name: team.isPersonal ? `${team.name} (Personal)` : team.name,
    slug: team.slug,
    isPersonal: team.isPersonal,
    role: team.role,
  }));
};

module.exports = {
  key: 'team_list',
  noun: 'Project',

  display: {
    label: 'Project List',
    description: 'Get a list of projects (used for dynamic dropdowns).',
    hidden: true, // Hidden from users - only for dropdown population
  },

  operation: {
    perform,

    inputFields: [],

    sample: {
      id: 'team_abc123',
      name: 'My Company',
      slug: 'my-company',
      isPersonal: false,
      role: 'owner',
    },

    outputFields: [
      { key: 'id', label: 'Project ID', type: 'string' },
      { key: 'name', label: 'Project Name', type: 'string' },
      { key: 'slug', label: 'Slug', type: 'string' },
      { key: 'isPersonal', label: 'Is Personal Project', type: 'boolean' },
      { key: 'role', label: 'Role', type: 'string' },
    ],
  },
};
