export interface RunehandConfig {
  apiKey: string;
  baseUrl: string;
}

const DEFAULT_BASE_URL = 'https://app.runehand.co/api/v1';

export function loadConfig(env: NodeJS.ProcessEnv = process.env): RunehandConfig {
  const apiKey = env.RUNEHAND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RUNEHAND_API_KEY is required. Generate one at https://app.runehand.co/settings/api-keys ' +
        '(requires a Pro or Enterprise plan) and set it as an environment variable.'
    );
  }

  return {
    apiKey,
    baseUrl: env.RUNEHAND_API_BASE_URL ?? DEFAULT_BASE_URL,
  };
}
