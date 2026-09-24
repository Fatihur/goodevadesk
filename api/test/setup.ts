jest.mock('@ai-sdk/openai-compatible', () => ({ createOpenAICompatible: jest.fn() }));
jest.mock('ai', () => ({ generateText: jest.fn() }));
