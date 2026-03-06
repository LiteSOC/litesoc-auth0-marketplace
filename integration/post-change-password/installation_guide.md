# LiteSOC Post-Change-Password Action

Monitor password change events with LiteSOC's security platform.

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

### Add to Post-Change-Password Flow

1. Go to **Auth0 Dashboard → Actions → Flows → Post Change Password**
2. Drag the **LiteSOC Password Change Tracker** action into the flow
3. Click **Apply**

## What Gets Tracked

Every password change sends the following to LiteSOC:

| Field | Description |
|-------|-------------|
| `event_type` | `auth.password_reset` |
| `actor.id` | Auth0 user ID |
| `actor.email` | User's email address |
| `metadata.connection` | Auth0 connection name |

## Security Benefits

- **Account Takeover Detection**: Correlate password changes with suspicious login activity
- **Audit Trail**: Maintain SOC 2 compliant records of credential changes
- **Alerting**: Get notified when high-value accounts change passwords

## Note

This flow runs asynchronously after a password change for database connections only. It does not run for federated connections.

## Support

- **LiteSOC Documentation**: [litesoc.io/docs](https://litesoc.io/docs)
- **Email Support**: support@litesoc.io
