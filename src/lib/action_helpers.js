/**
 * Action Helpers
 *
 * Common utilities for Zapier actions including template fetching
 * and input field definitions for document generation.
 */

const { API_BASE_URL } = require('./config');
const { extractVariablesFromInput, createTemplateVariablesFieldFunction } = require('./dynamic_fields');

/**
 * Fetch templates for dynamic dropdown
 * @param {object} z - Zapier object
 * @param {string} format - Filter by format: 'pdf', 'excel', or undefined for all
 */
const fetchTemplates = async (z, format) => {
  const params = { limit: 100 };
  if (format) {
    params.format = format;
  }

  const response = await z.request({
    url: `${API_BASE_URL}/v1/templates`,
    method: 'GET',
    params,
  });

  const templates = response.data.data || [];

  return templates.map((template) => ({
    id: template.id,
    label: template.name,
  }));
};

/**
 * Team selection field - first in the cascade
 */
const teamField = {
  key: 'teamId',
  label: 'Team',
  type: 'string',
  required: true,
  dynamic: 'team_list.id.name',
  altersDynamicFields: true,
  helpText: 'Select a team from your Rynko account.',
};

/**
 * Workspace selection field - second in the cascade, filtered by team
 */
const workspaceField = {
  key: 'workspaceId',
  label: 'Workspace',
  type: 'string',
  required: true,
  dynamic: 'workspace_list.id.name',
  altersDynamicFields: true,
  helpText: 'Select a workspace within the selected team.',
};

/**
 * Common input fields for document generation
 */
const commonDocumentFields = [
  teamField,
  workspaceField,
  {
    key: 'templateId',
    label: 'Template',
    type: 'string',
    required: true,
    dynamic: 'template_list.id.name',
    altersDynamicFields: true,
    helpText: 'Select a template from the selected workspace.',
  },
  {
    key: 'variables',
    label: 'Template Variables (JSON - Legacy)',
    type: 'string',
    required: false,
    helpText:
      'JSON object with template variables. Use this for complex variables or if you prefer JSON format. Example: {"customerName": "John", "invoiceNumber": "12345"}. Note: Dynamic variable fields will appear above when you select a template.',
  },
  {
    key: 'fileName',
    label: 'File Name',
    type: 'string',
    required: false,
    helpText: 'Custom file name for the generated document (without extension). Default: template name.',
  },
  {
    key: 'waitForCompletion',
    label: 'Wait for Completion',
    type: 'boolean',
    required: false,
    default: 'true',
    helpText: 'Wait for the document to be generated before continuing. If false, returns a job ID immediately.',
  },
];

/**
 * PDF-specific input fields
 */
const pdfFields = [
  teamField,
  workspaceField,
  {
    key: 'templateId',
    label: 'PDF Template',
    type: 'string',
    required: true,
    dynamic: 'template_list_pdf.id.name',
    altersDynamicFields: true,
    helpText: 'Select a PDF template from the selected workspace.',
  },
  {
    key: 'variables',
    label: 'Template Variables (JSON - Legacy)',
    type: 'string',
    required: false,
    helpText:
      'JSON object with template variables. Use this for complex variables or if you prefer JSON format. Example: {"customerName": "John", "invoiceNumber": "12345"}.',
  },
  {
    key: 'fileName',
    label: 'File Name',
    type: 'string',
    required: false,
    helpText: 'Custom file name for the generated PDF (without extension). Default: template name.',
  },
  {
    key: 'waitForCompletion',
    label: 'Wait for Completion',
    type: 'boolean',
    required: false,
    default: 'true',
    helpText: 'Wait for the PDF to be generated before continuing.',
  },
];

/**
 * Excel-specific input fields
 */
const excelFields = [
  teamField,
  workspaceField,
  {
    key: 'templateId',
    label: 'Excel Template',
    type: 'string',
    required: true,
    dynamic: 'template_list_excel.id.name',
    altersDynamicFields: true,
    helpText: 'Select an Excel template from the selected workspace.',
  },
  {
    key: 'variables',
    label: 'Template Variables (JSON - Legacy)',
    type: 'string',
    required: false,
    helpText:
      'JSON object with template variables. Use this for complex variables or if you prefer JSON format. Example: {"customerName": "John", "items": [...]}.',
  },
  {
    key: 'fileName',
    label: 'File Name',
    type: 'string',
    required: false,
    helpText: 'Custom file name for the generated Excel file (without extension). Default: template name.',
  },
  {
    key: 'waitForCompletion',
    label: 'Wait for Completion',
    type: 'boolean',
    required: false,
    default: 'true',
    helpText: 'Wait for the Excel file to be generated before continuing.',
  },
];

/**
 * Batch generation input fields
 */
const batchFields = [
  teamField,
  workspaceField,
  {
    key: 'templateId',
    label: 'Template',
    type: 'string',
    required: true,
    dynamic: 'template_list.id.name',
    altersDynamicFields: true,
    helpText: 'Select a template from the selected workspace.',
  },
  {
    key: 'format',
    label: 'Output Format',
    type: 'string',
    required: true,
    choices: {
      pdf: 'PDF',
      excel: 'Excel',
    },
    helpText: 'Choose the output format for all documents in this batch.',
  },
  {
    key: 'documents',
    label: 'Documents',
    type: 'string',
    required: true,
    helpText:
      'JSON array of document configurations. Each item should have "variables" and optionally "fileName". Example: [{"variables": {"name": "John"}, "fileName": "doc-1"}, {"variables": {"name": "Jane"}, "fileName": "doc-2"}]',
  },
  {
    key: 'waitForCompletion',
    label: 'Wait for Completion',
    type: 'boolean',
    required: false,
    default: 'false',
    helpText: 'Wait for all documents to be generated. For large batches, set to false and use the Document Completed trigger instead.',
  },
];

/**
 * Parse JSON variables safely
 */
const parseVariables = (variablesString) => {
  if (!variablesString) return {};

  try {
    return JSON.parse(variablesString);
  } catch {
    // If not valid JSON, try to parse as key=value pairs
    const vars = {};
    variablesString.split(',').forEach((pair) => {
      const [key, value] = pair.split('=').map((s) => s.trim());
      if (key && value) {
        vars[key] = value;
      }
    });
    return vars;
  }
};

/**
 * Build document generation request payload from bundle input
 * Supports both JSON variables and dynamic variable fields
 */
const buildDocumentPayload = (bundle, format = null) => {
  const payload = {
    templateId: bundle.inputData.templateId,
    teamId: bundle.inputData.teamId,
    workspaceId: bundle.inputData.workspaceId,
  };

  // Set format if provided
  if (format) {
    payload.format = format;
  }

  // Build variables from both JSON field and dynamic fields
  const jsonVariables = bundle.inputData.variables
    ? parseVariables(bundle.inputData.variables)
    : {};
  const dynamicVariables = extractVariablesFromInput(bundle.inputData);

  // Merge variables (dynamic fields override JSON)
  payload.variables = { ...jsonVariables, ...dynamicVariables };

  // Optional fields
  if (bundle.inputData.fileName) {
    payload.filename = bundle.inputData.fileName;
  }

  if (bundle.inputData.waitForCompletion !== undefined) {
    payload.waitForCompletion = bundle.inputData.waitForCompletion;
  }

  return payload;
};

/**
 * Build batch generation request payload
 */
const buildBatchPayload = (bundle) => {
  let documents = [];

  try {
    documents = JSON.parse(bundle.inputData.documents);
  } catch {
    throw new Error('Invalid JSON in documents field. Please provide a valid JSON array.');
  }

  const payload = {
    templateId: bundle.inputData.templateId,
    format: bundle.inputData.format,
    documents,
    teamId: bundle.inputData.teamId,
    workspaceId: bundle.inputData.workspaceId,
  };

  if (bundle.inputData.waitForCompletion !== undefined) {
    payload.waitForCompletion = bundle.inputData.waitForCompletion;
  }

  return payload;
};

/**
 * Common output fields for document generation response
 */
const documentOutputFields = [
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
];

/**
 * Batch output fields
 */
const batchOutputFields = [
  { key: 'id', label: 'Batch ID', type: 'string' },
  { key: 'status', label: 'Status', type: 'string' },
  { key: 'templateId', label: 'Template ID', type: 'string' },
  { key: 'format', label: 'Format', type: 'string' },
  { key: 'totalDocuments', label: 'Total Documents', type: 'integer' },
  { key: 'successCount', label: 'Success Count', type: 'integer' },
  { key: 'failureCount', label: 'Failure Count', type: 'integer' },
  { key: 'downloadUrl', label: 'Download URL (ZIP)', type: 'string' },
  { key: 'createdAt', label: 'Created At', type: 'datetime' },
  { key: 'completedAt', label: 'Completed At', type: 'datetime' },
];

/**
 * Dynamic field function for template variables
 */
const getTemplateVariableFields = createTemplateVariablesFieldFunction('templateId');

module.exports = {
  fetchTemplates,
  commonDocumentFields,
  pdfFields,
  excelFields,
  batchFields,
  parseVariables,
  buildDocumentPayload,
  buildBatchPayload,
  documentOutputFields,
  batchOutputFields,
  getTemplateVariableFields,
};
