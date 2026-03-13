const { onExecutePostUserRegistration } = require('./integration.action');

// Mock fetch globally
global.fetch = jest.fn();

describe('LiteSOC Post-User-Registration Action', () => {
  let mockEvent;
  let mockApi;

  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(''),
    });

    mockEvent = {
      secrets: {
        LITESOC_API_KEY: 'lsoc_live_test_key_123',
      },
      configuration: {
        LITESOC_DEBUG_MODE: 'false',
      },
      user: {
        user_id: 'auth0|new_user_123',
        email: 'newuser@example.com',
        name: 'New User',
        nickname: 'newuser',
        created_at: '2024-01-15T10:30:00.000Z',
      },
      request: {
        ip: '198.51.100.25',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        geoip: {
          cityName: 'New York',
          countryCode: 'US',
          latitude: 40.7128,
          longitude: -74.0060,
        },
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
    it('should send signup event to LiteSOC API', async () => {
      await onExecutePostUserRegistration(mockEvent, mockApi);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.litesoc.io/collect',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer lsoc_live_test_key_123',
          }),
        })
      );
    });

    it('should include correct event_type', async () => {
      await onExecutePostUserRegistration(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.event_type).toBe('auth.login_success');
    });

    it('should include user created_at in metadata', async () => {
      await onExecutePostUserRegistration(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.created_at).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('Error handling', () => {
    it('should not throw when API key is missing', async () => {
      mockEvent.secrets.LITESOC_API_KEY = undefined;

      await expect(onExecutePostUserRegistration(mockEvent, mockApi)).resolves.not.toThrow();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle missing request data', async () => {
      mockEvent.request = undefined;

      await onExecutePostUserRegistration(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.context.ip_address).toBeNull();
      expect(body.context.user_agent).toBeNull();
    });

    it('should not throw on network error', async () => {
      global.fetch.mockRejectedValue(new Error('Network timeout'));

      await expect(onExecutePostUserRegistration(mockEvent, mockApi)).resolves.not.toThrow();
    });
  });
});
