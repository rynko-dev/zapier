# Renderbase Zapier Integration - Deployment Guide

This guide covers the complete process for deploying the Renderbase Zapier integration, from initial setup through production deployment.

**Last Updated:** January 2026

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Integration Overview](#integration-overview)
3. [Local Development Setup](#local-development-setup)
4. [Zapier Developer Platform Setup](#zapier-developer-platform-setup)
5. [OAuth 2.0 Configuration](#oauth-20-configuration)
6. [Testing the Integration](#testing-the-integration)
7. [Deployment to Zapier](#deployment-to-zapier)
8. [Submitting for Public Listing](#submitting-for-public-listing)
9. [Maintenance and Updates](#maintenance-and-updates)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- Node.js 18.x or higher
- npm 8.x or higher
- Zapier CLI (`npm install -g zapier-platform-cli`)
- A Zapier account (free tier works for development)
- Access to Renderbase backend with OAuth module deployed

### Backend Requirements

The Renderbase backend must have the following ready:

- OAuth 2.0 module deployed (`/api/oauth/*` endpoints)
- **Integration API module deployed** (`/api/v1/integration-api/*` endpoints) - Required for team/workspace/template cascading selection
- Webhook subscriptions module deployed (`/api/v1/webhook-subscriptions/*`)
- Template Zapier fields endpoint (`/api/templates/:identifier/zapier-fields`)
- API rate limiting configured for OAuth clients
- SSL certificate (HTTPS required for production)

---

## Integration Overview

### Triggers (3)

| Key | Label | Description | Type |
|-----|-------|-------------|------|
| `document_completed` | Document Completed | Triggers when a document is successfully generated | Webhook |
| `document_failed` | Document Failed | Triggers when document generation fails | Webhook |
| `batch_completed` | Batch Completed | Triggers when a batch generation completes | Webhook |

### Actions (3)

| Key | Label | Description | Features |
|-----|-------|-------------|----------|
| `generate_pdf` | Generate PDF | Generate a PDF document from a template | Dynamic variable fields |
| `generate_excel` | Generate Excel | Generate an Excel document from a template | Dynamic variable fields |
| `generate_batch` | Generate Batch | Generate multiple documents from a template | Batch processing |

### Searches (1)

| Key | Label | Description | Visibility |
|-----|-------|-------------|------------|
| `find_document_job` | Find Document Job | Search for a document job by ID or status | Public |

### Hidden Triggers (for Dynamic Dropdowns)

| Key | Purpose | Depends On |
|-----|---------|------------|
| `team_list` | Populate team dropdown | - |
| `workspace_list` | Populate workspace dropdown | `teamId` |
| `template_list` | Populate template dropdown | `teamId`, `workspaceId` |
| `template_list_pdf` | Populate PDF template dropdown | `teamId`, `workspaceId` |
| `template_list_excel` | Populate Excel template dropdown | `teamId`, `workspaceId` |
| `template_variables` | Get template variables for dynamic fields | `templateId` |

**Cascading Selection:** Users select Team → Workspace → Template in order. Each dropdown filters based on the previous selection using the Integration API.

---

## Action Field Reference

### Generate PDF (`generate_pdf`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `teamId` | dropdown | Yes | Team selection (cascading) |
| `workspaceId` | dropdown | Yes | Workspace within selected team (cascading) |
| `templateId` | dropdown | Yes | PDF template within selected workspace (cascading) |
| `filename` | string | No | Custom filename (without .pdf extension) |
| `variables` | text | No | JSON template variables (legacy) |
| `var_*` | dynamic | No | Template-specific variable fields |

**Cascading Selection:** The Team → Workspace → Template dropdowns use cascading selection. Each dropdown filters based on the previous selection:
1. Select a **Team** - lists all teams the user has access to
2. Select a **Workspace** - lists workspaces within the selected team
3. Select a **Template** - lists PDF templates within the selected workspace

**Dynamic Fields:** When a template is selected, the integration fetches the template's variable schema and generates individual input fields for each variable. Object variables are flattened using `__` notation (e.g., `customer__name`), and array variables become line items.

### Generate Excel (`generate_excel`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `teamId` | dropdown | Yes | Team selection (cascading) |
| `workspaceId` | dropdown | Yes | Workspace within selected team (cascading) |
| `templateId` | dropdown | Yes | Excel template within selected workspace (cascading) |
| `filename` | string | No | Custom filename (without .xlsx extension) |
| `variables` | text | No | JSON template variables (legacy) |
| `var_*` | dynamic | No | Template-specific variable fields |

### Generate Batch (`generate_batch`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `teamId` | dropdown | Yes | Team selection (cascading) |
| `workspaceId` | dropdown | Yes | Workspace within selected team (cascading) |
| `templateId` | dropdown | Yes | Template within selected workspace (cascading) |
| `format` | dropdown | Yes | Output format (pdf or excel) |
| `items` | text | Yes | JSON array of variable sets |
| `batchName` | string | No | Name for the batch job |

---

## Trigger Output Fields

### Document Completed (`document_completed`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document job ID |
| `status` | string | Job status (completed) |
| `format` | string | Document format (pdf/excel) |
| `downloadUrl` | string | Signed URL to download the document |
| `expiresAt` | datetime | URL expiration timestamp |
| `templateId` | string | Template ID used |
| `templateName` | string | Template name |
| `createdAt` | datetime | Job creation timestamp |
| `completedAt` | datetime | Job completion timestamp |

### Document Failed (`document_failed`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document job ID |
| `status` | string | Job status (failed) |
| `format` | string | Document format (pdf/excel) |
| `error` | string | Error message |
| `errorCode` | string | Error code |
| `templateId` | string | Template ID used |
| `templateName` | string | Template name |
| `createdAt` | datetime | Job creation timestamp |
| `failedAt` | datetime | Job failure timestamp |

### Batch Completed (`batch_completed`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Batch job ID |
| `status` | string | Batch status |
| `totalDocuments` | number | Total documents in batch |
| `successCount` | number | Successfully generated count |
| `failureCount` | number | Failed document count |
| `templateId` | string | Template ID used |
| `createdAt` | datetime | Batch creation timestamp |
| `completedAt` | datetime | Batch completion timestamp |

---

## Local Development Setup

### 1. Install Dependencies

```bash
cd integrations/zapier-renderbase
npm install
```

### 2. Login to Zapier CLI

```bash
zapier login
```

This will open a browser window for authentication.

### 3. Create or Link the App

For a new app:
```bash
zapier register "Renderbase"
```

To link to an existing app:
```bash
zapier link
```

### 4. Configure Environment

Create a `.env` file for local development:

```bash
# Local development settings
RENDERBASE_API_URL=https://api.renderbase.dev
RENDERBASE_OAUTH_CLIENT_ID=your_zapier_client_id
RENDERBASE_OAUTH_CLIENT_SECRET=your_zapier_client_secret
```

Update `src/lib/config.js` if needed for local testing.

### 5. Validate the Integration

```bash
zapier validate
```

Expected output:
```
No structural errors found during validation routine.
This project is structurally sound!
```

---

## Zapier Developer Platform Setup

### 1. Access the Developer Platform

1. Go to [zapier.com/developer-platform](https://zapier.com/developer-platform)
2. Sign in with your Zapier account
3. Click "Start a Zapier Integration" or select your existing integration

### 2. Configure App Information

In the Zapier Developer Platform:

**Basic Info:**
- **Name:** Renderbase
- **Description:** Generate PDF and Excel documents from templates with a simple API. Design once, generate in multiple formats.
- **Logo:** Upload Renderbase logo (256x256px PNG, RGBA mode, transparent background)
- **Category:** Documents
- **Role:** Built by Renderbase team

**Intended Audience:**
- For initial development, select "Private"
- For public listing, select "Public"

### 3. Configure Branding

- **Primary Color:** #8B5CF6 (Renderbase violet)
- **Homepage URL:** https://renderbase.dev
- **Support URL:** https://renderbase.dev/support
- **Documentation URL:** https://docs.renderbase.dev/integrations/zapier

---

## OAuth 2.0 Configuration

### 1. Register OAuth Client in Renderbase

In the Renderbase admin panel or via API, create an OAuth client:

```bash
curl -X POST https://api.renderbase.dev/api/oauth/clients \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Zapier Integration",
    "redirectUris": [
      "https://zapier.com/dashboard/auth/oauth/return/App{YOUR_APP_ID}CLIAPI/"
    ],
    "scopes": [
      "documents:write",
      "documents:read",
      "templates:read",
      "webhooks:read",
      "webhooks:write",
      "profile:read"
    ],
    "grantTypes": ["authorization_code", "refresh_token"],
    "tokenEndpointAuthMethod": "client_secret_post"
  }'
```

**Important:** Save the `client_id` and `client_secret` returned.

### 2. Configure OAuth in Zapier Developer Platform

1. Go to your app in the Developer Platform
2. Navigate to **Authentication**
3. Select **OAuth 2.0**
4. Configure the following:

**Client ID:** `your_client_id_from_renderbase`

**Client Secret:** `your_client_secret_from_renderbase`

**Authorization URL:**
```
https://app.renderbase.dev/oauth/authorize
```

**Access Token Request URL:**
```
https://api.renderbase.dev/api/oauth/token
```

**Refresh Token Request URL:**
```
https://api.renderbase.dev/api/oauth/token
```

**Scope:** `documents:write documents:read templates:read webhooks:read webhooks:write profile:read`

**Test Trigger or API Call:**
```
GET https://api.renderbase.dev/api/v1/me
```

---

## Testing the Integration

### 1. Local Testing with zapier test

```bash
# Run all tests
zapier test

# Run specific test files
zapier test --grep "generate_pdf"
```

### 2. Test Authentication Flow

```bash
# Test OAuth flow
zapier invoke auth:start

# After authorizing, test that it worked
zapier invoke auth:test
```

### 3. Test Individual Actions

```bash
# Test generating a PDF (interactive mode)
zapier invoke create generate_pdf

# Test generating Excel
zapier invoke create generate_excel

# Test batch generation
zapier invoke create generate_batch

# Test finding a document job
zapier invoke search find_document_job

# Test a trigger
zapier invoke trigger document_completed

# Test with input data
zapier invoke create generate_pdf --inputData '{"templateId": "your-template-id"}'
```

### 4. Test Dynamic Fields

The integration uses dynamic fields that fetch template variables. To test:

1. Create a test Zap in Zapier
2. Select the "Generate PDF" action
3. Connect your Renderbase account
4. Select a template
5. Verify that variable fields appear based on the template schema

---

## Deployment to Zapier

### 1. Final Validation

```bash
# Validate before pushing
zapier validate

# Build the integration
zapier build
```

### 2. Push the Integration

```bash
# Deploy to Zapier
zapier push

# View deployed versions
zapier versions
```

### 3. Promote a Version

```bash
# Promote version to production
zapier promote 1.0.0

# Or promote with specific percentage
zapier promote 1.0.0 --percent 50
```

### 4. Invite Testers

```bash
# Invite testers by email
zapier users:add user@example.com 1.0.0

# List invited users
zapier users:list
```

---

## Submitting for Public Listing

### 1. Pre-Submission Checklist

- [ ] All 3 triggers have accurate sample data
- [ ] All 3 actions have helpful field descriptions
- [ ] Dynamic fields work correctly for all actions
- [ ] Error messages are user-friendly
- [ ] OAuth flow works reliably
- [ ] Integration has been tested by 5+ beta users
- [ ] Documentation is complete

### 2. Required Assets for Public Listing

**App Logo:**
- 256x256 PNG with transparent background
- Square format, RGBA mode (not indexed/P mode)
- Renderbase brand logo

**Category:** Documents

**Description (short):**
> Renderbase is a document generation platform that creates PDF and Excel files from templates using a simple API.

**Description (long):**
> Renderbase is a powerful document generation platform for developers. Design templates once and generate pixel-perfect PDFs and Excel files from JSON data.
>
> **Key Features:**
> - Generate PDF documents from customizable templates
> - Generate Excel spreadsheets with formatting preserved
> - Batch generate multiple documents in parallel
> - Trigger Zaps when documents are generated or fail
> - Dynamic template variables with type validation

### 3. Submit for Review

1. In the Developer Platform, click **Visibility**
2. Select **Public**
3. Complete all required fields
4. Submit for Zapier team review

**Review Timeline:** 2-4 weeks typically

---

## Maintenance and Updates

### Version Management

```bash
# View current versions
zapier versions

# Check migration status
zapier migrate 1.0.0 1.1.0

# Deprecate old version
zapier deprecate 1.0.0 2026-06-01
```

### Monitoring

1. **Zapier Dashboard:** Monitor usage and errors
2. **Renderbase Analytics:** Track API usage from Zapier
3. **Error Alerts:** Set up notifications for high error rates

---

## Troubleshooting

### Common Issues

**OAuth Token Refresh Failing:**
- Check refresh token hasn't expired
- Verify client secret is correct
- Ensure refresh_token grant is enabled

**Webhook Subscriptions Not Working:**
- Verify webhook URL is accessible
- Check Renderbase webhook module is deployed
- Confirm user has webhooks:write scope

**Dynamic Fields Not Loading:**
- Check `/api/templates/:id/zapier-fields` endpoint is deployed
- Verify user has templates:read scope
- Check template has published version with variables

**Dynamic Dropdowns Empty:**
- Check template_list searches are working
- Verify user has templates:read scope
- Check API pagination handling

**Cascading Dropdowns Not Working:**
- Verify Integration API module is deployed on backend
- Check `/api/v1/integration-api/teams` returns data
- Ensure OAuth token has correct scopes
- Verify `altersDynamicFields: true` is set on team/workspace fields
- Check browser console for API errors during dropdown load

**Workspace Dropdown Shows All Workspaces:**
- Verify `teamId` is being passed to workspace_list search
- Check that `inputFields` ordering has teamId before workspaceId

**Template Dropdown Shows Wrong Templates:**
- Verify `workspaceId` is being passed to template_list search
- Check template type filter (pdf/excel) is being applied correctly

### Getting Help

- **Zapier Documentation:** https://docs.zapier.com/platform
- **Zapier CLI Reference:** https://docs.zapier.com/platform/reference/cli
- **Zapier GitHub:** https://github.com/zapier/zapier-platform
- **Renderbase Support:** support@renderbase.dev
- **Renderbase Docs:** https://docs.renderbase.dev/integrations/zapier

---

## Quick Reference

### Zapier CLI Commands

```bash
zapier login           # Authenticate with Zapier
zapier register        # Create new integration
zapier link            # Link to existing integration
zapier validate        # Validate integration structure
zapier build           # Build deployable zip file
zapier test            # Run test suite
zapier push            # Deploy to Zapier
zapier promote         # Promote version to production
zapier deprecate       # Mark version as deprecated
zapier migrate         # Migrate users between versions
zapier versions        # List all versions
zapier logs            # View execution logs
zapier invoke          # Test triggers/actions locally
zapier users:add       # Invite beta testers
zapier users:get       # List users with access
zapier team:add        # Add team members
zapier env:set         # Set environment variables
zapier env:get         # Get environment variables
zapier describe        # Show triggers, searches, creates
```

### Important URLs

- Developer Platform: https://zapier.com/developer-platform
- CLI Documentation: https://docs.zapier.com/platform/reference/cli
- CLI GitHub Repository: https://github.com/zapier/zapier-platform
- Renderbase API Docs: https://docs.renderbase.dev/api-reference
- Renderbase OAuth Docs: https://docs.renderbase.dev/developer-guide/oauth

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/oauth/authorize` | GET | OAuth authorization |
| `/api/oauth/token` | POST | Token exchange/refresh |
| `/api/v1/me` | GET | Auth test/user info |
| `/api/v1/integration-api/teams` | GET | List teams for cascading selection |
| `/api/v1/integration-api/workspaces` | GET | List workspaces (filtered by teamId) |
| `/api/v1/integration-api/templates` | GET | List templates (filtered by workspaceId, type) |
| `/api/v1/documents/generate` | POST | Generate single document |
| `/api/v1/documents/generate/batch` | POST | Generate batch documents |
| `/api/v1/documents/jobs` | GET | List/search document jobs |
| `/api/v1/documents/jobs/:id` | GET | Get document job details |
| `/api/v1/templates` | GET | List templates (legacy) |
| `/api/v1/templates/:id/zapier-fields` | GET | Get template Zapier fields |
| `/api/v1/webhook-subscriptions` | POST | Create webhook |
| `/api/v1/webhook-subscriptions/:id` | DELETE | Delete webhook |

### File Structure

```
zapier-renderbase/
├── index.js                    # Main entry point
├── package.json                # Dependencies and version
├── DEPLOYMENT.md               # This file
├── README.md                   # General documentation
└── src/
    ├── authentication.js       # OAuth configuration
    ├── triggers/               # Trigger definitions
    │   ├── document_completed.js
    │   ├── document_failed.js
    │   └── batch_completed.js
    ├── creates/                # Action definitions
    │   ├── generate_pdf.js
    │   ├── generate_excel.js
    │   └── generate_batch.js
    ├── searches/               # Search definitions
    │   ├── find_document_job.js
    │   ├── team_list.js        # Team dropdown (cascading)
    │   ├── workspace_list.js   # Workspace dropdown (cascading, depends on teamId)
    │   ├── template_list.js    # Template dropdown (cascading, depends on workspaceId)
    │   ├── template_list_pdf.js
    │   ├── template_list_excel.js
    │   └── template_variables.js
    └── lib/                    # Shared utilities
        ├── config.js           # API configuration
        ├── action_helpers.js   # Action utilities
        ├── dynamic_fields.js   # Dynamic field handling
        └── webhook_helpers.js  # Webhook utilities
```
