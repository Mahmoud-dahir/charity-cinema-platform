// src/app/api/events/categories/__tests__/route.test.ts

import { GET } from '../route';

if (typeof global.Request === 'undefined') {
  (global as any).Request = class Request {
    url: string; method: string;
    constructor(input: string, init?: any) {
      this.url = input;
      this.method = init?.method || 'GET';
    }
  };
}

let mockToken: string | undefined = 'fake-token';
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockImplementation(async () => ({
    get: (name: string) => mockToken ? { value: mockToken } : undefined,
  })),
}));

jest.mock('next/server', () => {
  class MockNextResponse {
    status: number;
    body: any;
    constructor(body?: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
    }
    static json(body: any, init?: any) {
      return new MockNextResponse(body, init);
    }
    async json() {
      return this.body;
    }
  }
  return { NextResponse: MockNextResponse };
});

jest.mock('@/lib/auth', () => ({
  ACCESS_TOKEN_COOKIE: 'access_token',
  getBackendBaseUrl: () => 'http://backend',
}));

describe('Events Categories API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'fake-token';
    global.fetch = jest.fn();
  });

  it('récupère les catégories d\'événements avec authentification', async () => {
    const mockData = [{ id: 1, name: 'Cinéma' }];
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => mockData,
    });

    const response = await GET(new Request('http://localhost') as any);
    
    expect(response.status).toBe(200);
    const json = await (response as any).json();
    expect(json).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://backend/api/events/categories/',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer fake-token'
        })
      })
    );
  });

  it('récupère les catégories d\'événements sans authentification', async () => {
    mockToken = undefined;
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => [],
    });

    const response = await GET(new Request('http://localhost') as any);
    
    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://backend/api/events/categories/',
      expect.objectContaining({
        headers: { 'Accept': 'application/json' }
      })
    );
  });

  it('gère les erreurs du backend', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 500,
      json: async () => ({ error: 'Internal Error' }),
    });

    const response = await GET(new Request('http://localhost') as any);
    expect(response.status).toBe(500);
  });
});
