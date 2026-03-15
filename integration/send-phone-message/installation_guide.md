# LiteSOC Send-Phone-Message Action

Track MFA challenges with LiteSOC's security monitoring platform.

## Prerequisites

1. A LiteSOC account ([Sign up free](https://litesoc.io))
2. A Live API key from your LiteSOC dashboard

## Getting Your API Key

1. Log in to [LiteSOC Dashboard](https://litesoc.io/dashboard)
2. Navigate to **Settings → API Keys**
3. Click **Create API Key** or copy your existing Live key

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

### Add to Send-Phone-Message Flow

1. Go to **Auth0 Dashboard → Actions → Flows → Send Phone Message**
2. Drag the **LiteSOC MFA Tracker** action into the flow
3. Click **Apply**

## What Gets Tracked

Every MFA phone challenge sends the following to LiteSOC:

| Field | Description |
|-------|-------------|
| `event_type` | `auth.mfa_challenge` |
| `actor.id` | Auth0 user ID |
| `actor.email` | User's email address |
| `user_ip` | User IP address |
| `metadata.mfa_type` | SMS or Voice |
| `metadata.phone_masked` | Last 4 digits of phone number |

## Security Benefits

- **MFA Fatigue Detection**: Identify users receiving excessive MFA prompts
- **Geographic Correlation**: Match MFA requests with login locations
- **Anomaly Detection**: Flag unusual MFA patterns

## Important Note

This Action tracks when MFA codes are **sent**, not when they are verified. For MFA verification events, use the Post-Login Action.

## Support

- **LiteSOC Documentation**: [litesoc.io/docs](https://litesoc.io/docs)
- **Email Support**: support@litesoc.io
