# LiteSOC Post-User-Registration Action

Track new user signups in real-time with LiteSOC's security monitoring platform.

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

### Add to Post-User-Registration Flow

1. Go to **Auth0 Dashboard → Actions → Flows → Post User Registration**
2. Drag the **LiteSOC Signup Tracker** action into the flow
3. Click **Apply**

## What Gets Tracked

Every new user signup sends the following to LiteSOC:

| Field | Description |
|-------|-------------|
| `event_type` | `auth.login_success` |
| `actor.id` | Auth0 user ID |
| `actor.email` | User's email address |
| `context.ip_address` | Signup IP address |
| `context.user_agent` | Browser/device info |
| `metadata.connection` | Auth0 connection name |

## Use Cases

- **Signup Velocity Monitoring**: Detect bot signups or account farming
- **Geographic Analysis**: See where your users are signing up from
- **Connection Tracking**: Monitor which auth methods are most popular

## Troubleshooting

### Events not appearing in LiteSOC

1. Enable **Debug Mode** in the integration settings
2. Check Auth0 Logs for any action errors
3. Verify your API key is correct (starts with `lsoc_live_`)

## Support

- **LiteSOC Documentation**: [litesoc.io/docs](https://litesoc.io/docs)
- **Email Support**: support@litesoc.io
