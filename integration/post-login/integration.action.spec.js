const { onExecutePostLogin } = require('./integration.action');

// Mock fetch globally
global.fetch = jest.fn();

describe('LiteSOC Post-Login Action', () => {
  let mockEvent;
  let mockApi;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset fetch mock
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(''),
    });

    // Standard event object
    mockEvent = {
      secrets: {
        LITESOC_API_KEY: 'lsoc_live_test_key_123',
      },
      configuration: {
        LITESOC_DEBUG_MODE: 'false',
      },
      user: {
        user_id: 'auth0|123456789',
        email: 'test@example.com',
        name: 'Test User',
        nickname: 'testuser',
      },
      request: {
        ip: '203.0.113.50',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        geoip: {
          cityName: 'San Francisco',
          countryCode: 'US',
          latitude: 37.7749,
          longitude: -122.4194,
        },
      },
      tenant: {
        id: 'test-tenant',
      },
      connection: {
        name: 'Username-Password-Authentication',
        strategy: 'auth0',
      },
      client: {
        client_id: 'abc123',
        name: 'My App',
      },
      authentication: {
        methods: [
          { name: 'pwd', timestamp: '2024-01-01T00:00:00.000Z' },
        ],
      },
      stats: {
        logins_count: 5,
      },
      riskAssessment: null,
    };

    mockApi = {};
  });

  describe('Successful execution', () => {
    it('should send event to LiteSOC API', async () => {
      await onExecutePostLogin(mockEvent, mockApi);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.litesoc.io/collect',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-KEY': 'lsoc_live_test_key_123',
          }),
        })
      );
    });

    it('should include correct event', async () => {
      await onExecutePostLogin(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.event).toBe('auth.login_success');
    });

    it('should include actor information', async () => {
      await onExecutePostLogin(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.actor).toEqual({
        id: 'auth0|123456789',
        email: 'test@example.com',
      });
    });

    it('should include context with IP and geo', async () => {
      await onExecutePostLogin(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.user_ip).toBe('203.0.113.50');
    });

    it('should include metadata', async () => {
      await onExecutePostLogin(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.auth0_tenant).toBe('test-tenant');
      expect(body.metadata.connection).toBe('Username-Password-Authentication');
      expect(body.metadata.mfa_used).toBe(false);
      expect(body.metadata.login_count).toBe(5);
    });

    it('should detect MFA usage', async () => {
      mockEvent.authentication.methods.push({ name: 'mfa', timestamp: '2024-01-01T00:00:01.000Z' });

      await onExecutePostLogin(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.mfa_used).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should not throw when API key is missing', async () => {
      mockEvent.secrets.LITESOC_API_KEY = undefined;

      await expect(onExecutePostLogin(mockEvent, mockApi)).resolves.not.toThrow();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not throw on API error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      await expect(onExecutePostLogin(mockEvent, mockApi)).resolves.not.toThrow();
    });

    it('should not throw on network error', async () => {
      global.fetch.mockRejectedValue(new Error('Network timeout'));

      await expect(onExecutePostLogin(mockEvent, mockApi)).resolves.not.toThrow();
    });
  });

  describe('Debug mode', () => {
    it('should log when debug mode is enabled', async () => {
      mockEvent.configuration.LITESOC_DEBUG_MODE = 'true';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await onExecutePostLogin(mockEvent, mockApi);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('LiteSOC: Sending event')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('LiteSOC: Response status')
      );

      consoleSpy.mockRestore();
    });

    it('should redact API key in debug logs', async () => {
      mockEvent.configuration.LITESOC_DEBUG_MODE = 'true';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await onExecutePostLogin(mockEvent, mockApi);

      const logCall = consoleSpy.mock.calls.find(call => 
        call[0].includes('Sending event')
      );
      expect(logCall[0]).toContain('***');
      expect(logCall[0]).not.toContain('lsoc_live_test_key_123');

      consoleSpy.mockRestore();
    });
  });
});
