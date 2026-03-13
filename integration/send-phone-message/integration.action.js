/**
 * LiteSOC Send-Phone-Message Action
 * 
 * Sends MFA challenge events to LiteSOC for security monitoring.
 * This runs when an SMS or Voice MFA code is sent to a user.
 * 
 * Features enabled by LiteSOC (based on your plan):
 * - Free: MFA event logging, GeoIP enrichment
 * - Pro+: Impossible Travel detection on MFA requests
 * - Enterprise: Custom Threat Models
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

  // Build the event payload (matches /collect schema)
  const payload = {
    event: 'auth.mfa_enabled',
    actor: {
      id: event.user.user_id,
      email: event.user.email,
    },
    // IP address at root level - required for behavioral AI detection
    user_ip: event.request?.ip || null,
    metadata: {
      // Source identification
      source: 'auth0-marketplace-action',
      // User info
      name: event.user.name || event.user.nickname || null,
      user_agent: event.request?.user_agent || null,
      // Auth0 context
      auth0_tenant: event.tenant.id,
      mfa_type: event.message_options?.action || 'unknown', // 'enrollment' or 'authentication'
      channel: event.message_options?.channel || 'sms', // 'sms' or 'voice'
      phone_masked: maskedPhone,
      // Auth0's geo data (LiteSOC Worker will also enrich with our own)
      auth0_geo: event.request?.geoip ? {
        city: event.request.geoip.cityName,
        country: event.request.geoip.countryCode,
        latitude: event.request.geoip.latitude,
        longitude: event.request.geoip.longitude,
      } : null,
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
        'X-API-Key': apiKey,
        'User-Agent': 'LiteSOC-Auth0-Marketplace/2.0.0',
      },
      body: JSON.stringify(payload),
    });

    // Parse response headers for plan info
    const planType = response.headers.get('X-LiteSOC-Plan') || 'unknown';
    const retentionDays = response.headers.get('X-LiteSOC-Retention') || 'unknown';
    const quotaRemaining = response.headers.get('X-LiteSOC-Quota-Remaining');
    const quotaLimit = response.headers.get('X-LiteSOC-Quota-Limit');

    if (debugMode) {
      console.log(`LiteSOC: Response ${response.status} | Plan: ${planType} | Retention: ${retentionDays}d | Quota: ${quotaRemaining || 'N/A'}/${quotaLimit || 'N/A'} remaining`);
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const body = await response.json().catch(() => ({}));
      
      if (body.error?.includes('quota')) {
        console.log(`LiteSOC: Monthly quota exceeded. Upgrade at https://litesoc.io/dashboard/billing`);
      } else {
        console.log(`LiteSOC: Rate limited. Retry after ${retryAfter || 60}s`);
      }
    } else if (response.status === 403) {
      const quotaUsed = response.headers.get('X-LiteSOC-Quota-Used');
      console.log(`LiteSOC: Monthly event quota exceeded (${quotaUsed}/${quotaLimit}). Upgrade at https://litesoc.io/dashboard/billing`);
    } else if (!response.ok) {
      const errorText = await response.text();
      console.log(`LiteSOC: API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.log(`LiteSOC: Network error - ${error.message}`);
  }
};
