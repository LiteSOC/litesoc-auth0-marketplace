/**
 * LiteSOC Post-User-Registration Action
 * 
 * Sends signup events to LiteSOC for security monitoring and behavioral AI detection.
 * 
 * Features enabled by LiteSOC (based on your plan):
 * - Free: GeoIP enrichment, Network Intelligence, Brute Force Detection
 * - Pro+: Impossible Travel, Geo-Anomaly, Email/Slack/Discord Alerts
 * - Enterprise: Custom Threat Models, IP Whitelisting, SSO
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

  // Build the event payload (matches /collect schema)
  const payload = {
    event: 'auth.login_success',
    actor: {
      id: event.user.user_id,
      email: event.user.email,
    },
    user_ip: event.request?.ip || null,
    metadata: {
      // Source identification
      source: 'auth0-marketplace-action',
      // User info
      name: event.user.name || event.user.nickname || null,
      user_agent: event.request?.user_agent || null,
      // Auth0 context
      auth0_tenant: event.tenant.id,
      connection: event.connection.name,
      connection_strategy: event.connection.strategy,
      created_at: event.user.created_at,
      // Auth0's geo data (LiteSOC Worker will also enrich with our own)
    },
  };

  if (debugMode) {
    console.log('LiteSOC: Sending signup event ' + JSON.stringify({
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
        'X-API-KEY': `${apiKey}`,
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
      // Rate limit or quota exceeded
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
    // Fail silently - this is an async flow
    console.log(`LiteSOC: Network error - ${error.message}`);
  }
};
