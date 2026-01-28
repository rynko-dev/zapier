/**
 * OAuth 2.0 Authentication Configuration
 *
 * Rynko uses OAuth 2.0 with PKCE for secure third-party access.
 * This configuration enables users to connect their Rynko account to Zapier.
 */

const { API_BASE_URL, WEBAPP_URL } = require('./lib/config');

const getAccessToken = async (z, bundle) => {
  const response = await z.request({
    url: `${API_BASE_URL}/oauth/token`,
    method: 'POST',
    body: {
      grant_type: 'authorization_code',
      code: bundle.inputData.code,
      redirect_uri: bundle.inputData.redirect_uri,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code_verifier: bundle.inputData.code_verifier,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new z.errors.Error(
      'Unable to fetch access token: ' + response.content,
      'AuthenticationError',
      response.status
    );
  }

  // Check for OAuth error response (backend returns 200 with error body per OAuth 2.0 spec)
  if (response.data.error) {
    throw new z.errors.Error(
      response.data.error_description || response.data.error,
      'AuthenticationError',
      400
    );
  }

  // Ensure access_token exists in response
  if (!response.data.access_token) {
    throw new z.errors.Error(
      'Invalid token response: access_token not found. Response: ' + JSON.stringify(response.data),
      'AuthenticationError',
      500
    );
  }

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
    expires_in: response.data.expires_in,
  };
};

const refreshAccessToken = async (z, bundle) => {
  const response = await z.request({
    url: `${API_BASE_URL}/oauth/token`,
    method: 'POST',
    body: {
      grant_type: 'refresh_token',
      refresh_token: bundle.authData.refresh_token,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new z.errors.RefreshAuthError('Session expired. Please reconnect your Rynko account.');
  }

  // Check for OAuth error response
  if (response.data.error) {
    throw new z.errors.RefreshAuthError(
      response.data.error_description || 'Session expired. Please reconnect your Rynko account.'
    );
  }

  // Ensure access_token exists
  if (!response.data.access_token) {
    throw new z.errors.RefreshAuthError('Invalid token response. Please reconnect your Rynko account.');
  }

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token || bundle.authData.refresh_token,
    expires_in: response.data.expires_in,
  };
};

const testAuth = async (z, bundle) => {
  // Test the authentication by fetching the current user
  // Use /auth/verify endpoint which supports JWT, API Key, and OAuth tokens
  const response = await z.request({
    url: `${API_BASE_URL}/auth/verify`,
    method: 'GET',
  });

  if (response.status !== 200) {
    throw new z.errors.Error('Authentication failed', 'AuthenticationError', response.status);
  }

  return response.data;
};

module.exports = {
  type: 'oauth2',

  oauth2Config: {
    // Authorization URL - where users are redirected to grant access (webapp handles login + consent)
    authorizeUrl: {
      url: `{{process.env.WEBAPP_URL}}/oauth/authorize`,
      params: {
        client_id: '{{process.env.CLIENT_ID}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        response_type: 'code',
        scope: 'documents:generate documents:read templates:read webhooks:read webhooks:write profile:read',
        state: '{{bundle.inputData.state}}',
      },
    },

    // Access token request
    getAccessToken: getAccessToken,

    // Refresh token request
    refreshAccessToken: refreshAccessToken,

    // Auto-refresh on 401
    autoRefresh: true,

    // PKCE support
    enablePkce: true,
  },

  // Connection label shown in Zapier (uses email from test response)
  connectionLabel: '{{email}}',

  // Test the authentication
  test: testAuth,

  // Fields needed for connection (shown after OAuth)
  fields: [],
};
