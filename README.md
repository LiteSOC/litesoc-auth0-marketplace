# LiteSOC Auth0 Marketplace Integration

This repository contains the Auth0 Marketplace integration package for LiteSOC - a security event monitoring and behavioral AI platform.

## Overview

LiteSOC provides real-time security monitoring for authentication events with:
- **Behavioral AI Detection**: Impossible travel, geo anomalies, VPN/Tor detection
- **Brute Force Protection**: Automatic detection of credential stuffing attacks
- **Unified Security Timeline**: All auth events in one dashboard
- **SOC 2 Compliant**: Enterprise-grade security and audit logging

## Features by Plan

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| GeoIP Enrichment | ✅ | ✅ | ✅ |
| Network Intelligence (VPN/Tor/Proxy) | ✅ | ✅ | ✅ |
| Brute Force Detection | ✅ | ✅ | ✅ |
| Monthly Events | 5,000 | 50,000 | 500,000+ |
| Event Retention | 7 days | 30 days | 90 days |
| Rate Limit | 60/min | 300/min | 1,200/min |
| Impossible Travel Detection | ❌ | ✅ | ✅ |
| Geo-Anomaly Detection | ❌ | ✅ | ✅ |
| Email/Slack/Discord Alerts | ❌ | ✅ | ✅ |
| Custom Threat Models | ❌ | ❌ | ✅ |
| IP Whitelisting | ❌ | ❌ | ✅ |

## Response Headers

The `/collect` endpoint returns headers with plan and usage info:

| Header | Description |
|--------|-------------|
| `X-LiteSOC-Plan` | Current plan: `free`, `pro`, or `enterprise` |
| `X-LiteSOC-Retention` | Event retention in days |
| `X-LiteSOC-Quota-Remaining` | Events remaining this month |

## Error Handling

| Status | Reason | Action |
|--------|--------|--------|
| 429 | Rate limit exceeded | Retry after `Retry-After` seconds |
| 429 | Monthly quota exceeded | Upgrade plan at litesoc.io/dashboard/billing |
| 401 | Invalid API key | Check LITESOC_API_KEY secret |
| 403 | Quota exceeded (legacy) | Upgrade plan |

## Integration Types

This package includes **4 Action integrations** for complete auth monitoring:

| Action | Trigger | Events Tracked |
|--------|---------|----------------|
| Post Login | Login Flow | `auth.login_success`, with full context |
| Post User Registration | Post Signup | `auth.login_success` |
| Post Change Password | Password Reset | `auth.password_reset` |
| Send Phone Message | MFA Trigger | `auth.mfa_enabled` |

## Directory Structure

```
litesoc-auth0-marketplace/
├── integration/
│   ├── post-login/
│   │   ├── configuration.json
│   │   ├── installation_guide.md
│   │   ├── integration.action.js
│   │   └── integration.action.spec.js
│   ├── post-user-registration/
│   │   ├── configuration.json
│   │   ├── installation_guide.md
│   │   ├── integration.action.js
│   │   └── integration.action.spec.js
│   ├── post-change-password/
│   │   ├── configuration.json
│   │   ├── installation_guide.md
│   │   ├── integration.action.js
│   │   └── integration.action.spec.js
│   └── send-phone-message/
│       ├── configuration.json
│       ├── installation_guide.md
│       ├── integration.action.js
│       └── integration.action.spec.js
├── media/
│   └── 256x256-logo.png
├── Makefile
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ (for local testing)
- Docker (for running `make test`)
- An Auth0 tenant for testing
- A LiteSOC account with API key

### Testing

```bash
# Run all tests
make test

# Lint code
make lint

# Deploy to test tenant
make deploy_init
make deploy_get_token
make deploy_create
```

## Submission Checklist

- [x] All Action code written and tested
- [x] configuration.json files complete
- [x] installation_guide.md files complete
- [x] Unit tests passing
- [ ] 256x256-logo.png added (transparent background)
- [ ] Partner portal account created
- [ ] Integration submitted for review

## Partner Portal Submission

1. Create account at [partners.marketplace.auth0.com](https://partners.marketplace.auth0.com)
2. Complete partner profile (company info, logos, legal)
3. Run `make zip` to create submission archive
4. Upload to partner portal

## Documentation

- [Auth0 Marketplace Partners Guide](https://auth0.com/docs/customize/integrations/marketplace-partners)
- [Actions Integrations for Partners](https://auth0.com/docs/customize/integrations/marketplace-partners/actions-integrations-for-partners)
- [LiteSOC API Documentation](https://litesoc.io/docs/api)

## Support

- **LiteSOC Support**: support@litesoc.io
- **Auth0 Partner Team**: Via partner portal

## License

MIT License - see [LICENSE](./LICENSE)
