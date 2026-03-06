/**
 * LiteSOC Post-User-Registration Action
 * 
 * Sends signup events to LiteSOC for security monitoring.
 * 
 * @param {Event} event - Auth0 event object containing user and request data
 * @param {API} api - Auth0 API object
 * @see https://litesoc.io/docs/integrations/auth0
 */

const LITESOC_API_URL = 'https://api.litesoc.io/collect';

/**
 * Handler that runs after a new user registers
 */
exports.onExecutePostUserRegistration = async (event, api) => {
  const apiKey = event.secrets.LITESOC_API_KEY;
  const debugMode = event.configuration.LITESOC_DEBUG_MODE === 'true';

  // Validate API key is configured
  if (!apiKey) {
    console.log('LiteSOC: API key not configured. Skipping event.');
    return;
  }

  // Build the event payload
  const payload = {
    event_type: 'auth.signup_success',
    actor: {
      id: event.user.user_id,
      email: event.user.email,
      name: event.user.name || event.user.nickname || null,
    },
    context: {
      ip_address: event.request?.ip || null,
      user_agent: event.request?.user_agent || null,
      geo: event.request?.geoip ? {
        city: event.request.geoip.cityName,
        country: event.request.geoip.countryCode,
        latitude: event.request.geoip.latitude,
        longitude: event.request.geoip.longitude,
      } : null,
    },
    metadata: {
      auth0_tenant: event.tenant.id,
      connection: event.connection.name,
      connection_strategy: event.connection.strategy,
      created_at: event.user.created_at,
    },
  };

  if (debugMode) {
    console.log('LiteSOC: Sending signup event', JSON.stringify({
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
    // Fail silently - this is an async flow
    console.log(`LiteSOC: Network error - ${error.message}`);
  }
};
