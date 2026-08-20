import { describe, it, expect } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('throws a clear error when RUNEHAND_API_KEY is missing', () => {
    expect(() => loadConfig({})).toThrow(/RUNEHAND_API_KEY is required/);
  });

  it('defaults baseUrl to the production API when RUNEHAND_API_BASE_URL is not set', () => {
    const config = loadConfig({ RUNEHAND_API_KEY: 'rh_live_test' });
    expect(config).toEqual({ apiKey: 'rh_live_test', baseUrl: 'https://app.runehand.co/api/v1' });
  });

  it('uses RUNEHAND_API_BASE_URL when provided, for local/staging testing', () => {
    const config = loadConfig({
      RUNEHAND_API_KEY: 'rh_live_test',
      RUNEHAND_API_BASE_URL: 'http://localhost:8090/api/v1',
    });
    expect(config.baseUrl).toBe('http://localhost:8090/api/v1');
  });
});
