const { onExecuteSendPhoneMessage } = require('./integration.action');

// Mock fetch globally
global.fetch = jest.fn();

describe('LiteSOC Send-Phone-Message Action', () => {
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
        user_id: 'auth0|mfa_user_123',
        email: 'mfauser@example.com',
        name: 'MFA User',
        nickname: 'mfauser',
      },
      request: {
        ip: '192.0.2.100',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
        geoip: {
          cityName: 'Los Angeles',
          countryCode: 'US',
          latitude: 34.0522,
          longitude: -118.2437,
        },
      },
      tenant: {
        id: 'test-tenant',
      },
      message_options: {
        recipient: '+14155551234',
        action: 'authentication',
        channel: 'sms',
      },
    };

    mockApi = {};
  });

  describe('Successful execution', () => {
    it('should send MFA challenge event to LiteSOC API', async () => {
      await onExecuteSendPhoneMessage(mockEvent, mockApi);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.litesoc.io/collect',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should include correct event_type', async () => {
      await onExecuteSendPhoneMessage(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.event_type).toBe('auth.mfa_challenge');
    });

    it('should mask phone number for privacy', async () => {
      await onExecuteSendPhoneMessage(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.phone_masked).toBe('***1234');
      expect(body.metadata.phone_masked).not.toContain('+1415555');
    });

    it('should include MFA type and channel', async () => {
      await onExecuteSendPhoneMessage(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.mfa_type).toBe('authentication');
      expect(body.metadata.channel).toBe('sms');
    });

    it('should include geo context', async () => {
      await onExecuteSendPhoneMessage(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.context.geo.city).toBe('Los Angeles');
      expect(body.context.ip_address).toBe('192.0.2.100');
    });
  });

  describe('Edge cases', () => {
    it('should handle voice channel', async () => {
      mockEvent.message_options.channel = 'voice';

      await onExecuteSendPhoneMessage(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.channel).toBe('voice');
    });

    it('should handle enrollment action', async () => {
      mockEvent.message_options.action = 'enrollment';

      await onExecuteSendPhoneMessage(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.mfa_type).toBe('enrollment');
    });

    it('should handle missing message_options', async () => {
      mockEvent.message_options = undefined;

      await onExecuteSendPhoneMessage(mockEvent, mockApi);

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.metadata.phone_masked).toBeNull();
      expect(body.metadata.mfa_type).toBe('unknown');
    });
  });

  describe('Error handling', () => {
    it('should not throw when API key is missing', async () => {
      mockEvent.secrets.LITESOC_API_KEY = undefined;

      await expect(onExecuteSendPhoneMessage(mockEvent, mockApi)).resolves.not.toThrow();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not throw on network error', async () => {
      global.fetch.mockRejectedValue(new Error('Network timeout'));

      await expect(onExecuteSendPhoneMessage(mockEvent, mockApi)).resolves.not.toThrow();
    });
  });
});
