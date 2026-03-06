/**
 * LiteSOC Post-Change-Password Action
 * 
 * Sends password change events to LiteSOC for security monitoring.
 * 
 * @param {Event} event - Auth0 event object containing user data
 * @param {API} api - Auth0 API object
 * @see https://litesoc.io/docs/integrations/auth0
 */

const LITESOC_API_URL = 'https://api.litesoc.io/collect';

/**
 * Handler that runs after a user changes their password
 */
exports.onExecutePostChangePassword = async (event, api) => {
  const apiKey = event.secrets.LITESOC_API_KEY;
  const debugMode = event.configuration.LITESOC_DEBUG_MODE === 'true';

  // Validate API key is configured
  if (!apiKey) {
    console.log('LiteSOC: API key not configured. Skipping event.');
    return;
  }

  // Build the event payload
  const payload = {
    event_type: 'auth.password_reset',
    actor: {
      id: event.user.user_id,
      email: event.user.email,
      name: event.user.name || event.user.nickname || null,
    },
    context: {
      // Post-change-password flow doesn't have request context
      ip_address: null,
      user_agent: null,
    },
    metadata: {
      auth0_tenant: event.tenant.id,
      connection: event.connection.name,
      connection_strategy: event.connection.strategy,
      password_changed_at: new Date().toISOString(),
    },
  };

  if (debugMode) {
    console.log('LiteSOC: Sending password change event', JSON.stringify({
      ...payload,
      _debug: true,
      _api_key_prefix: apiKey.substring(0, 15) + '***',
    }));
  }

  try {
    const response = await fetch(LITESOC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'LiteSOC-Auth0-Action/1.0.0',
      },
      body: JSON.stringify(payload),
    });

    if (debugMode) {
      console.log(`LiteSOC: Response status ${response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`LiteSOC: API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.log(`LiteSOC: Network error - ${error.message}`);
  }
};
