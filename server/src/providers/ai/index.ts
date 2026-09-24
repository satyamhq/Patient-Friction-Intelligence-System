import { IAIProvider } from './IAIProvider.js';
import { DeterministicAIProvider } from './DeterministicAIProvider.js';
import { OllamaProvider } from './OllamaProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import { config } from '../../config/env.js';

let activeAIProvider: IAIProvider | null = null;

export const getAIProvider = (): IAIProvider => {
  if (!activeAIProvider) {
    if (config.aiProvider === 'ollama') {
      activeAIProvider = new OllamaProvider(config.ollamaBaseUrl, config.ollamaModel);
    } else if (config.aiProvider === 'openai' && config.openaiApiKey) {
      activeAIProvider = new OpenAIProvider(config.openaiApiKey);
    } else {
      activeAIProvider = new DeterministicAIProvider();
    }
  }
  return activeAIProvider;
};

export * from './IAIProvider.js';
export * from './DeterministicAIProvider.js';
export * from './OllamaProvider.js';
export * from './OpenAIProvider.js';
