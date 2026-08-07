const { onExecutePostChangePassword } = require('./integration.action');

// Additional coverage: the inline `.catch(() => ({}))` on the 429 path and the
// name || nickname || null fallback branch.
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

function makeEvent(user = {}) {
  return {
    secrets: { LITESOC_API_KEY: 'lsoc_live_mockkey' },
    configuration: { LITESOC_DEBUG_MODE: 'false' },
    user: { user_id: 'u1', email: 'a@example.com', ...user },
    tenant: { id: 't1' },
    connection: { name: 'Username-Password-Authentication', strategy: 'auth0' },
  };
}

describe('Post-Change-Password Action — branch/function coverage', () => {
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
    await expect(onExecutePostChangePassword(makeEvent(), {})).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Rate limited'));
  });

  it('falls back to nickname then null when name is absent', async () => {
    await onExecutePostChangePassword(makeEvent({ name: undefined, nickname: 'nick' }), {});
    let body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.metadata.name).toBe('nick');

    jest.clearAllMocks();
    global.fetch.mockResolvedValue(baseResponse());
    await onExecutePostChangePassword(makeEvent({ name: undefined, nickname: undefined }), {});
    body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.metadata.name).toBeNull();
  });

  it('logs 403 quota-exceeded branch', async () => {
    global.fetch.mockResolvedValue(baseResponse({ ok: false, status: 403 }));
    await expect(onExecutePostChangePassword(makeEvent(), {})).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('event quota exceeded'));
  });
});
