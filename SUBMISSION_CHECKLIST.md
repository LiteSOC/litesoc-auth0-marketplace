# Auth0 Partner Portal Submission Checklist

## Pre-Submission Requirements

### 1. Partner Portal Account
- [ ] Create account at [partners.marketplace.auth0.com](https://partners.marketplace.auth0.com)
- [ ] Complete company profile
  - [ ] Company name: LiteSOC
  - [ ] Company description
  - [ ] Company logo (256x256 PNG, transparent background)
  - [ ] Website URL: https://litesoc.io
  - [ ] Support email: support@litesoc.io
  - [ ] Privacy policy URL: https://www.litesoc.io/legal/privacy
  - [ ] Terms of service URL: https://www.litesoc.io/legal/terms

### 2. Integration Code
- [x] Post-Login Action (`integration/post-login/`)
  - [x] configuration.json
  - [x] installation_guide.md
  - [x] integration.action.js
  - [x] integration.action.spec.js
- [x] Post-User-Registration Action (`integration/post-user-registration/`)
  - [x] configuration.json
  - [x] installation_guide.md
  - [x] integration.action.js
  - [x] integration.action.spec.js
- [x] Post-Change-Password Action (`integration/post-change-password/`)
  - [x] configuration.json
  - [x] installation_guide.md
  - [x] integration.action.js
  - [x] integration.action.spec.js
- [x] Send-Phone-Message Action (`integration/send-phone-message/`)
  - [x] configuration.json
  - [x] installation_guide.md
  - [x] integration.action.js
  - [x] integration.action.spec.js

### 3. Media Assets
- [x] 256x256-logo.png (LiteSOC logo, transparent background)
- [x] Optional: 460x260-column-1.png (value proposition image 1)
- [x] Optional: 460x260-column-2.png (value proposition image 2)
- [x] Optional: 460x260-column-3.png (value proposition image 3)

### 4. Testing
- [x] Run `make test` - all tests passing
- [x] Run `make lint` - no linting errors
- [x] Manual testing on Auth0 test tenant
- [x] Verified events appear in LiteSOC dashboard

### 5. Documentation
- [x] README.md
- [x] LICENSE (MIT)
- [x] Installation guides for each action

## Submission Steps

1. **Run `make zip`** to create the submission package
2. **Log in** to [partners.marketplace.auth0.com](https://partners.marketplace.auth0.com)
3. **Navigate** to "Submit Integration"
4. **Fill in** integration details:
   - Name: LiteSOC Security Monitoring
   - Short description: Real-time authentication monitoring with Behavioral AI
   - Category: Security / Monitoring
   - Integration type: Actions
5. **Upload** the zip file from `dist/litesoc-auth0-integration.zip`
6. **Add value propositions** (optional):
   - Impossible Travel Detection
   - Behavioral Anomaly Detection
   - SOC 2 Compliant Audit Logging
7. **Submit** for review

## Post-Submission

- Auth0 will review the integration (typically 1-2 weeks)
- They may request changes or clarifications
- Once approved, the integration will be listed in the Auth0 Marketplace
- Update our docs page with "Available on Auth0 Marketplace" badge

## Integration Listing Content

### Title
LiteSOC Security Monitoring

### Short Description
Real-time authentication monitoring with Behavioral AI. Detect impossible travel, geo anomalies, and suspicious login patterns.

### Long Description
LiteSOC provides enterprise-grade security monitoring for your Auth0 authentication events. With one-click installation, you can:

- **Track all auth events** in a unified security timeline
- **Detect impossible travel** - alert when users log in from two distant locations
- **Identify geo anomalies** - flag logins from unusual countries
- **Spot VPN/Tor usage** - detect users behind anonymizing services
- **Monitor MFA challenges** - track MFA fatigue attacks
- **SOC 2 compliant** - maintain audit trails for compliance

### Tags
- Security
- Monitoring
- Behavioral AI
- Impossible Travel
- MFA
- Audit Logging
- SOC 2
