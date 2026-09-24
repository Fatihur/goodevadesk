import { LlmService } from './llm.service';

describe('LlmService', () => {
  const redis = { get: jest.fn(), set: jest.fn() };
  const service = new LlmService(redis as any);

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.AI_BASE_URL;
    delete process.env.AI_API_KEY;
    delete process.env.AI_MODEL;
  });

  it('keeps enrichment optional when provider configuration is absent', async () => {
    redis.get.mockResolvedValue(null);
    await expect(service.analyze('Payment failed', 'The charge is missing')).resolves.toBeNull();
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('returns only valid cached analysis', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ category: 'billing', suggestedReply: 'We are checking this for you.' }));
    await expect(service.analyze('Payment failed', 'The charge is missing')).resolves.toEqual({ category: 'billing', suggestedReply: 'We are checking this for you.' });
  });

  it('ignores malformed cached analysis', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ category: 'unknown', suggestedReply: '' }));
    await expect(service.analyze('Payment failed', 'The charge is missing')).resolves.toBeNull();
  });
});
