jest.mock('node:child_process', () => ({ execFile: jest.fn() }));

import { execFile } from 'node:child_process';
import { LlmService } from './llm.service';

describe('LlmService', () => {
  const redis = { get: jest.fn(), set: jest.fn() };
  const service = new LlmService(redis as any);

  beforeEach(() => {
    jest.clearAllMocks();
    (execFile as unknown as jest.Mock).mockImplementation((_command: string, _args: string[], _options: unknown, callback: (error: null, result: { stdout: string; stderr: string }) => void) => callback(null, { stdout: JSON.stringify({ category: 'billing' }), stderr: '' }));
    process.env.PYTHON_NLP_ENABLED = 'true';
    delete process.env.AI_BASE_URL;
    delete process.env.AI_API_KEY;
    delete process.env.AI_MODEL;
  });

  it('uses Python NLP fallback when provider configuration is absent', async () => {
    redis.get.mockResolvedValue(null);
    await expect(service.analyze('Payment failed', 'The charge is missing')).resolves.toEqual(expect.objectContaining({ category: 'billing', suggestedReply: expect.any(String) }));
    expect(execFile).toHaveBeenCalled();
    expect(redis.set).toHaveBeenCalled();
  });

  it('returns only valid cached analysis', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ category: 'billing', suggestedReply: 'We are checking this for you.' }));
    await expect(service.analyze('Payment failed', 'The charge is missing')).resolves.toEqual({ category: 'billing', suggestedReply: 'We are checking this for you.' });
  });

  it('ignores malformed cached analysis', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ category: 'unknown', suggestedReply: '' }));
    await expect(service.analyze('Payment failed', 'The charge is missing')).resolves.toEqual(expect.objectContaining({ category: 'billing' }));
  });
});
