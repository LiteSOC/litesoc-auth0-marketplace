/**
 * LiteSOC Send-Phone-Message Action
 * 
 * Sends MFA challenge events to LiteSOC for security monitoring.
 * This runs when an SMS or Voice MFA code is sent to a user.
 * 
 * @param {Event} event - Auth0 event object containing user and request data
 * @param {API} api - Auth0 API object
 * @see https://litesoc.io/docs/integrations/auth0
 */

const LITESOC_API_URL = 'https://api.litesoc.io/collect';

/**
 * Handler that runs when a phone message (SMS/Voice) is sent for MFA
 */
exports.onExecuteSendPhoneMessage = async (event, api) => {
  const apiKey = event.secrets.LITESOC_API_KEY;
  const debugMode = event.configuration.LITESOC_DEBUG_MODE === 'true';

  // Validate API key is configured
  if (!apiKey) {
    console.log('LiteSOC: API key not configured. Skipping event.');
    return;
  }

  // Mask phone number for privacy (show last 4 digits only)
  const maskedPhone = event.message_options?.recipient
    ? `***${event.message_options.recipient.slice(-4)}`
    : null;

  // Build the event payload
  const payload = {
    event_type: 'auth.mfa_challenge',
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
      mfa_type: event.message_options?.action || 'unknown', // 'enrollment' or 'authentication'
      channel: event.message_options?.channel || 'sms', // 'sms' or 'voice'
      phone_masked: maskedPhone,
    },
  };

  if (debugMode) {
    console.log('LiteSOC: Sending MFA challenge event', JSON.stringify({
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
