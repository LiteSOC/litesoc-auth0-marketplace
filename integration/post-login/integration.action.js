/**
 * LiteSOC Post-Login Action
 * 
 * Sends authentication events to LiteSOC for security monitoring and behavioral AI detection.
 * 
 * Features enabled by LiteSOC (based on your plan):
 * - Free: GeoIP enrichment, Network Intelligence, Brute Force Detection
 * - Pro+: Impossible Travel, Geo-Anomaly, Email/Slack/Discord Alerts
 * - Enterprise: Custom Threat Models, IP Whitelisting, SSO
 * 
 * Response headers provide plan and quota information:
 * - X-LiteSOC-Plan: Your current plan (free, pro, enterprise)
 * - X-LiteSOC-Retention: Event retention days
 * - X-LiteSOC-Quota-Remaining: Events remaining this month
 * 
 * @param {Event} event - Auth0 event object containing user and request data
 * @param {API} api - Auth0 API object for modifying the login flow
 * @see https://litesoc.io/docs/integrations/auth0
 */

const LITESOC_API_URL = 'https://api.litesoc.io/collect';

/**
 * Handler that runs on every successful login
 */
exports.onExecutePostLogin = async (event, api) => {
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
    user_ip: event.request.ip,
    metadata: {
      // Source identification
      source: 'auth0-marketplace-action',
      // User info
      auth0_tenant: event.tenant.id,
      connection: event.connection.name,
      connection_strategy: event.connection.strategy,
      client_id: event.client.client_id,
      client_name: event.client.name,
      mfa_used: event.authentication?.methods?.some(m => m.name === 'mfa') || false,
      login_count: event.stats?.logins_count || 0,
      risk_score: event.riskAssessment?.risk?.value || null,
      // Auth0's geo data (LiteSOC Worker will also enrich with our own)
    },
  };

  if (debugMode) {
    console.log('LiteSOC: Sending event ' + JSON.stringify({
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

    if (debugMode) {
      console.log(`LiteSOC: Response status: ${response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`LiteSOC: API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    // Fail silently to not block the login flow
    console.log(`LiteSOC: Network error - ${error.message}`);
  }

  // Never block the login flow
  return;
};
