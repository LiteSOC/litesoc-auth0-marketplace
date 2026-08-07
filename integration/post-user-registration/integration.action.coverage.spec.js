const { onExecutePostUserRegistration } = require('./integration.action');

// Additional coverage: the inline `.catch(() => ({}))` on the 429 path and the
// request?.ip / name || nickname || null fallback branches.
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

function makeEvent(user = {}, request) {
  const e = {
    secrets: { LITESOC_API_KEY: 'lsoc_live_mockkey' },
    configuration: { LITESOC_DEBUG_MODE: 'false' },
    user: { user_id: 'u1', email: 'a@example.com', created_at: '2024-01-01T00:00:00.000Z', ...user },
    tenant: { id: 't1' },
    connection: { name: 'Username-Password-Authentication', strategy: 'auth0' },
  };
  if (request !== null) e.request = request || { ip: '203.0.113.9', user_agent: 'UA' };
  return e;
}

describe('Post-User-Registration Action — branch/function coverage', () => {
  let consoleSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue(baseResponse());
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => consoleSpy.mockRestore());

  it('runs the 429 .catch(() => ({})) when response.json() rejects', async () => {
    global.fetch.mockResolvedValue(
      baseResponse({ ok: false, status: 429, json: jest.fn().mockRejectedValue(new Error('bad json')) })
    );
    await expect(onExecutePostUserRegistration(makeEvent(), {})).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Rate limited'));
  });

  it('handles missing request and name/nickname (null-fallback branches)', async () => {
    await onExecutePostUserRegistration(makeEvent({ name: undefined, nickname: undefined }, null), {});
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.user_ip).toBeNull();
    expect(body.metadata.name).toBeNull();
    expect(body.metadata.user_agent).toBeNull();
  });

  it('falls back to nickname when name absent', async () => {
    await onExecutePostUserRegistration(makeEvent({ name: undefined, nickname: 'nick' }), {});
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.metadata.name).toBe('nick');
  });

  it('logs 403 quota-exceeded branch', async () => {
    global.fetch.mockResolvedValue(baseResponse({ ok: false, status: 403 }));
    await expect(onExecutePostUserRegistration(makeEvent(), {})).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('event quota exceeded'));
  });
});
