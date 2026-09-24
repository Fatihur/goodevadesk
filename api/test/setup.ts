jest.mock('@ai-sdk/openai-compatible', () => ({ createOpenAICompatible: jest.fn() }));
jest.mock('ai', () => ({ generateObject: jest.fn() }));
