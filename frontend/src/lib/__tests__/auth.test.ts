// src/lib/__tests__/auth.test.ts
import { getBackendBaseUrl, isProd, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../auth';

describe('Auth Lib', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('exports correct cookie names', () => {
    expect(ACCESS_TOKEN_COOKIE).toBe("access_token");
    expect(REFRESH_TOKEN_COOKIE).toBe("refresh_token");
  });

  it('getBackendBaseUrl returns env var if set', () => {
    process.env.BACKEND_URL = "https://api.example.com";
    expect(getBackendBaseUrl()).toBe("https://api.example.com");
  });

  it('getBackendBaseUrl returns default if env var is not set', () => {
    delete process.env.BACKEND_URL;
    expect(getBackendBaseUrl()).toBe("http://127.0.0.1:8000");
  });

  it('isProd returns true if window is defined and protocol is https:', () => {
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, protocol: 'https:' } as any;
    
    expect(isProd()).toBe(true);
    
    window.location = originalLocation; // Restore
  });

  it('isProd returns false if window is defined and protocol is http:', () => {
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, protocol: 'http:' } as any;
    
    expect(isProd()).toBe(false);
    
    window.location = originalLocation; // Restore
  });

  it('isProd uses process.env when window is undefined', () => {
    const tempWindow = global.window;
    delete (global as any).window; // Force window to be undefined
    
    process.env.NODE_ENV = 'production';
    process.env.PROTOCOL = 'https';
    expect(isProd()).toBe(true);
    
    process.env.NODE_ENV = 'development';
    expect(isProd()).toBe(false);
    
    global.window = tempWindow; // Restore
  });
});