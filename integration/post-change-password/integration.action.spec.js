const { onExecutePostChangePassword } = require('./integration.action');

// Mock fetch globally
global.fetch = jest.fn();

describe('LiteSOC Post-Change-Password Action', () => {
  let mockEvent;
  let mockApi;

  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(''),
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
    });

    mockEvent = {
      secrets: {
        LITESOC_API_KEY: 'lsoc_live_test_key_123',
      },
      configuration: {
        LITESOC_DEBUG_MODE: 'false',
      },
      user: {
        user_id: 'auth0|password_user_123',
        email: 'passworduser@example.com',
        name: 'Password User',
        nickname: 'pwuser',
      },
      tenant: {
        id: 'test-tenant',
      },
      connection: {
        name: 'Username-Password-Authentication',
        strategy: 'auth0',
      },
    };

    mockApi = {};
  });

  describe('Successful execution', () => {
    it('should send password change event to LiteSOC API', async () => {
      await onExecutePostChangePassword(mockEvent, mockApi);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.litesoc.io/collect',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should include correct event_type', async () => {
      await onExecutePostChangePassword(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.event_type).toBe('auth.password_reset');
    });

    it('should include password_changed_at timestamp', async () => {
      await onExecutePostChangePassword(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.password_changed_at).toBeDefined();
      expect(new Date(body.metadata.password_changed_at)).toBeInstanceOf(Date);
    });

    it('should have null IP and user_agent (not available in this flow)', async () => {
      await onExecutePostChangePassword(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.context.ip_address).toBeNull();
      expect(body.context.user_agent).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should not throw when API key is missing', async () => {
      mockEvent.secrets.LITESOC_API_KEY = undefined;

      await expect(onExecutePostChangePassword(mockEvent, mockApi)).resolves.not.toThrow();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not throw on network error', async () => {
      global.fetch.mockRejectedValue(new Error('Network timeout'));

      await expect(onExecutePostChangePassword(mockEvent, mockApi)).resolves.not.toThrow();
    });

    it('should not throw on API error response', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
        headers: { get: jest.fn().mockReturnValue(null) },
      });

      await expect(onExecutePostChangePassword(mockEvent, mockApi)).resolves.not.toThrow();
    });

    it('should handle 429 rate limit response', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: jest.fn().mockResolvedValue({ error: 'rate limit exceeded' }),
        headers: { get: jest.fn().mockReturnValue(null) },
      });

      await expect(onExecutePostChangePassword(mockEvent, mockApi)).resolves.not.toThrow();
    });

    it('should handle 429 quota exceeded response', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: jest.fn().mockResolvedValue({ error: 'monthly quota exceeded' }),
        headers: { get: jest.fn().mockReturnValue(null) },
      });

      await expect(onExecutePostChangePassword(mockEvent, mockApi)).resolves.not.toThrow();
    });

    it('should handle 403 quota exceeded response', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        headers: { get: jest.fn().mockReturnValue(null) },
      });

      await expect(onExecutePostChangePassword(mockEvent, mockApi)).resolves.not.toThrow();
    });
  });

  describe('Debug mode', () => {
    it('should log when debug mode is enabled', async () => {
      mockEvent.configuration.LITESOC_DEBUG_MODE = 'true';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await onExecutePostChangePassword(mockEvent, mockApi);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('LiteSOC: Sending password change event')
      );

      consoleSpy.mockRestore();
    });
  });
});
