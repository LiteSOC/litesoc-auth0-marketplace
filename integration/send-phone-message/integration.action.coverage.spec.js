const { onExecuteSendPhoneMessage } = require('./integration.action');

// Additional coverage: exercises the inline `.catch(() => ({}))` callback on the
// 429 path, and the debug-mode redaction / null-fallback branches.
global.fetch = jest.fn();

function baseResponse(overrides = {}) {
  return {
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(''),
    json: jest.fn().mockResolvedValue({}),
    headers: { get: jest.fn().mockReturnValue(null) },
    ...overrides,
  };
}

describe('Send-Phone-Message Action — branch/function coverage', () => {
  let consoleSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue(baseResponse());
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => consoleSpy.mockRestore());

  it('runs the 429 .catch(() => ({})) when response.json() rejects (rate-limited branch)', async () => {
    global.fetch.mockResolvedValue(
      baseResponse({ ok: false, status: 429, json: jest.fn().mockRejectedValue(new Error('bad json')) })
    );
    const event = {
      secrets: { LITESOC_API_KEY: 'lsoc_live_mockkey' },
      configuration: { LITESOC_DEBUG_MODE: 'false' },
      user: { user_id: 'u1', email: 'a@example.com' },
      request: { ip: '203.0.113.9', user_agent: 'UA' },
      tenant: { id: 't1' },
      message_options: { recipient: '+15551234567', action: 'authentication', channel: 'sms' },
    };
    await expect(onExecuteSendPhoneMessage(event)).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Rate limited'));
  });

  it('debug mode with full values redacts email/ip/name (truthy redaction branches)', async () => {
    const event = {
      secrets: { LITESOC_API_KEY: 'lsoc_live_mockkey' },
      configuration: { LITESOC_DEBUG_MODE: 'true' },
      user: { user_id: 'u1', email: 'a@example.com', name: 'Full Name' },
      request: { ip: '203.0.113.9', user_agent: 'UA' },
      tenant: { id: 't1' },
      message_options: { recipient: '+15551234567', action: 'enrollment', channel: 'voice' },
    };
    await onExecuteSendPhoneMessage(event);
    const log = consoleSpy.mock.calls.find(c => c[0].includes('Sending MFA challenge event'));
    expect(log[0]).toContain('***@***.***');
    expect(log[0]).toContain('***redacted***');
    expect(log[0]).not.toContain('a@example.com');
  });

  it('debug mode with missing values hits the null-fallback branches', async () => {
    const event = {
      secrets: { LITESOC_API_KEY: 'lsoc_live_mockkey' },
      configuration: { LITESOC_DEBUG_MODE: 'true' },
      user: { user_id: 'u1' }, // no email, name, nickname
      // no request → user_ip null, user_agent null
      tenant: { id: 't1' },
      // no message_options → maskedPhone null, mfa_type 'unknown', channel 'sms'
    };
    await expect(onExecuteSendPhoneMessage(event)).resolves.not.toThrow();
    const log = consoleSpy.mock.calls.find(c => c[0].includes('Sending MFA challenge event'));
    const body = JSON.parse(log[0].replace('LiteSOC: Sending MFA challenge event ', ''));
    expect(body.actor.email).toBeNull();
    expect(body.user_ip).toBeNull();
    expect(body.metadata.name).toBeNull();
  });

  it('403 response logs quota-exceeded branch', async () => {
    global.fetch.mockResolvedValue(baseResponse({ ok: false, status: 403 }));
    const event = {
      secrets: { LITESOC_API_KEY: 'lsoc_live_mockkey' },
      configuration: { LITESOC_DEBUG_MODE: 'false' },
      user: { user_id: 'u1', email: 'a@example.com' },
      request: { ip: '203.0.113.9' },
      tenant: { id: 't1' },
      message_options: { recipient: '+15551234567' },
    };
    await expect(onExecuteSendPhoneMessage(event)).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('event quota exceeded'));
  });
});
