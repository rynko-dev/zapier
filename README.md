# Rynko Zapier Integration

Official Zapier integration for Rynko - the document generation platform with unified template design for PDF and Excel documents.

## Features

### Triggers
- **Document Completed** - Triggers when a document is successfully generated
- **Document Failed** - Triggers when document generation fails
- **Batch Completed** - Triggers when a batch generation completes

### Actions
- **Generate PDF** - Generate a PDF document from a template
- **Generate Excel** - Generate an Excel document from a template
- **Generate Batch** - Generate multiple documents from a single template

### Searches
- **Find Document Job** - Search for a document job by ID or status
- **List Templates** - List available templates

## Project Structure

```
zapier-rynko/
├── index.js                    # Main app definition
├── package.json                # Dependencies
├── DEPLOYMENT.md               # Deployment guide
├── README.md                   # This file
└── src/
    ├── authentication.js       # OAuth 2.0 configuration
    ├── lib/
    │   ├── config.js           # Configuration constants
    │   ├── webhook_helpers.js  # Webhook trigger utilities
    │   └── action_helpers.js   # Action utilities
    ├── triggers/
    │   ├── document_completed.js
    │   ├── document_failed.js
    │   └── batch_completed.js
    ├── creates/
    │   ├── generate_pdf.js
    │   ├── generate_excel.js
    │   └── generate_batch.js
    └── searches/
        ├── find_document_job.js
        ├── template_list.js        # Hidden - for dynamic dropdowns
        ├── template_list_pdf.js    # Hidden - PDF templates dropdown
        └── template_list_excel.js  # Hidden - Excel templates dropdown
```

## Development

### Prerequisites

- Node.js 18+
- npm 8+
- Zapier CLI (`npm install -g zapier-platform-cli`)

### Setup

```bash
# Install dependencies
npm install

# Login to Zapier
zapier login

# Link to existing app (or use `zapier register` for new)
zapier link
```

### Testing

```bash
# Validate the integration
zapier validate

# Run tests
zapier test

# Test specific action
zapier invoke creates:generate_pdf
```

### Deployment

```bash
# Push to Zapier
zapier push

# View deployed versions
zapier versions

# Promote to production
zapier promote 1.0.0
```

## Authentication

This integration uses OAuth 2.0 with the following scopes:
- `documents:write` - Generate documents
- `documents:read` - Read document job status
- `templates:read` - Access templates
- `webhooks:read` - View webhook subscriptions
- `webhooks:write` - Create/delete webhook subscriptions
- `profile:read` - Read user profile

## API Endpoints Used

- `POST /api/v1/documents/generate` - Generate single document
- `POST /api/v1/documents/generate/batch` - Generate batch documents
- `GET /api/v1/documents/jobs` - List/search document jobs
- `GET /api/v1/documents/jobs/:id` - Get document job details
- `GET /api/v1/templates` - List templates
- `POST /api/v1/webhook-subscriptions` - Subscribe to webhooks
- `DELETE /api/v1/webhook-subscriptions/:id` - Unsubscribe from webhooks

## Webhook Events

| Event Type | Description |
|------------|-------------|
| `document.completed` | Document successfully generated with download URL |
| `document.failed` | Document generation failed with error details |
| `batch.completed` | Batch generation completed |

## Workspace Support

When generating documents, you can optionally specify a `workspaceId` to generate documents in a specific workspace. If not provided, documents are generated in the user's current workspace.

## Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Rynko API Documentation](https://docs.rynko.dev/api)
- [Zapier CLI Reference](https://platform.zapier.com/cli)

## Support

- Email: support@rynko.dev
- Documentation: https://docs.rynko.dev
