/**
 * Dynamic Fields Helper
 *
 * Utilities for fetching and processing dynamic input fields
 * based on template variables from the Rynko API.
 */

const { API_BASE_URL } = require('./config');

/**
 * Fetch Zapier-compatible fields for a template
 * @param {object} z - Zapier object
 * @param {string} templateId - Template identifier (UUID, shortId, or slug)
 * @returns {Promise<Array>} Array of Zapier field definitions
 */
const fetchTemplateFields = async (z, templateId) => {
  if (!templateId) {
    return [];
  }

  try {
    const response = await z.request({
      url: `${API_BASE_URL}/v1/templates/${templateId}/zapier-fields`,
      method: 'GET',
    });

    return response.data.fields || [];
  } catch (error) {
    z.console.log('Error fetching template fields:', error.message);
    return [];
  }
};

/**
 * Transform Zapier field definitions into inputFields format
 * Adds prefixes to keys to namespace them and avoid conflicts
 * @param {Array} fields - Field definitions from API
 * @param {string} prefix - Prefix to add to keys (e.g., 'var_' for variables)
 * @returns {Array} Transformed fields for Zapier inputFields
 */
const transformFieldsToInputFields = (fields, prefix = 'var_') => {
  return fields.map((field) => {
    const inputField = {
      key: `${prefix}${field.key}`,
      label: field.label,
      type: mapZapierType(field.type),
      required: field.required || false,
      helpText: field.helpText,
    };

    // Add default value if present
    if (field.default !== undefined) {
      inputField.default = field.default;
    }

    // Handle line items (arrays with children)
    if (field.list && field.children) {
      inputField.list = true;
      inputField.children = field.children.map((child) => ({
        key: child.key,
        label: child.label,
        type: mapZapierType(child.type),
        required: child.required || false,
        helpText: child.helpText,
      }));
    } else if (field.list) {
      inputField.list = true;
    }

    return inputField;
  });
};

/**
 * Map field types to Zapier's supported input types
 * @param {string} type - Field type from API
 * @returns {string} Zapier input type
 */
const mapZapierType = (type) => {
  const typeMap = {
    string: 'string',
    text: 'text',
    number: 'number',
    integer: 'integer',
    boolean: 'boolean',
    datetime: 'datetime',
    file: 'file',
    copy: 'copy',
  };
  return typeMap[type] || 'string';
};

/**
 * Extract variables from bundle inputData using a specific prefix
 * and reconstruct nested objects using double underscore notation
 * @param {object} inputData - Bundle inputData from Zapier
 * @param {string} prefix - Prefix to look for (default: 'var_')
 * @returns {object} Reconstructed variables object
 */
const extractVariablesFromInput = (inputData, prefix = 'var_') => {
  const variables = {};

  for (const [key, value] of Object.entries(inputData)) {
    // Only process keys that start with our prefix
    if (!key.startsWith(prefix)) {
      continue;
    }

    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Remove the prefix
    const varKey = key.slice(prefix.length);

    // Handle nested keys (double underscore notation)
    const parts = varKey.split('__');

    if (parts.length === 1) {
      // Simple field
      variables[varKey] = value;
    } else {
      // Nested field - reconstruct the object structure
      let current = variables;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      current[parts[parts.length - 1]] = value;
    }
  }

  return variables;
};

/**
 * Create dynamic field function for document template variables
 * @param {string} templateIdKey - The key name for template ID in inputData
 * @param {string} prefix - Prefix for variable keys (default: 'var_')
 * @returns {Function} Async function that returns dynamic input fields
 */
const createTemplateVariablesFieldFunction = (templateIdKey = 'templateId', prefix = 'var_') => {
  return async (z, bundle) => {
    const templateId = bundle.inputData[templateIdKey];
    if (!templateId) {
      return [];
    }

    const fields = await fetchTemplateFields(z, templateId);
    return transformFieldsToInputFields(fields, prefix);
  };
};

module.exports = {
  fetchTemplateFields,
  transformFieldsToInputFields,
  mapZapierType,
  extractVariablesFromInput,
  createTemplateVariablesFieldFunction,
};
