# LiteSOC Post-Login Action

Monitor authentication events in real-time with LiteSOC's behavioral AI security platform.

## Prerequisites

1. A LiteSOC account ([Sign up free](https://litesoc.io))
2. A Live API key from your LiteSOC dashboard

## Getting Your API Key

1. Log in to [LiteSOC Dashboard](https://litesoc.io/dashboard)
2. Navigate to **Settings → API Keys**
3. Click **Create API Key** or copy your existing Live key
4. The key starts with `lsoc_live_`

## Installation Steps

### Add the LiteSOC Integration to Your Tenant

1. Navigate to the [Auth0 Marketplace](https://marketplace.auth0.com)
2. Search for "LiteSOC"
3. Click **Add Integration**
4. Select your tenant

### Configure the Integration

1. Enter your **LiteSOC API Key** in the secrets field
2. (Optional) Enable **Debug Mode** for troubleshooting
3. Click **Create**

### Add to Login Flow

1. Go to **Auth0 Dashboard → Actions → Flows → Login**
2. Drag the **LiteSOC** action into the flow
3. Click **Apply**

## What Gets Tracked

Every successful login sends the following to LiteSOC:

| Field | Description |
|-------|-------------|
| `event_type` | `auth.login_success` |
| `actor.id` | Auth0 user ID |
| `actor.email` | User's email address |
| `user_ip` | User IP address |
| `metadata.connection` | Auth0 connection name |
| `metadata.mfa_used` | Whether MFA was used |

## Behavioral AI Features

With IP address data, LiteSOC automatically enables:

- **Impossible Travel Detection**: Alerts when a user logs in from two distant locations in an impossible timeframe
- **Geo Anomaly Detection**: Flags logins from unusual countries
- **VPN/Tor Detection**: Identifies anonymizing services
- **Brute Force Detection**: Detects credential stuffing (requires failed login tracking)

## Troubleshooting

### Events not appearing in LiteSOC

1. Enable **Debug Mode** in the integration settings
2. Check Auth0 Logs for any action errors
3. Verify your API key is correct (starts with `lsoc_live_`)
4. Ensure your LiteSOC plan hasn't exceeded its quota

### Debug Mode Logs

When Debug Mode is enabled, the action logs:
- Request payload (with redacted API key)
- Response status from LiteSOC API
- Any error messages

## Support

- **LiteSOC Documentation**: [litesoc.io/docs](https://litesoc.io/docs)
- **Email Support**: support@litesoc.io
- **Auth0 Community**: [community.auth0.com](https://community.auth0.com)
