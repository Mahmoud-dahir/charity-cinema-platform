// src/app/api/categories/__tests__/route.test.ts

import { GET, POST } from '../route';

if (typeof global.Request === 'undefined') {
  (global as any).Request = class Request {
    url: string; method: string; bodyText: string;
    constructor(input: string, init?: any) {
      this.url = input;
      this.method = init?.method || 'GET';
      this.bodyText = init?.body || '{}';
    }
    async json() { return JSON.parse(this.bodyText); }
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

describe('Categories API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'fake-token';
    global.fetch = jest.fn();
  });

  describe('GET', () => {
    it('récupère la liste des catégories', async () => {
      const mockCategories = [{ id: 1, name: 'Action' }, { id: 2, name: 'Horreur' }];
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: async () => mockCategories,
      });

      const response = await GET();
      
      expect(response.status).toBe(200);
      const json = await (response as any).json();
      expect(json).toEqual(mockCategories);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://backend/api/categories/',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('gère les erreurs du backend lors de la récupération', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const response = await GET();
      expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    it('retourne 401 si l\'utilisateur n\'est pas authentifié', async () => {
      mockToken = undefined;
      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ name: 'Comédie' }),
      }) as any;

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('crée une nouvelle catégorie avec succès', async () => {
      const newCategory = { name: 'Comédie' };
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 201,
        json: async () => ({ id: 3, ...newCategory }),
      });

      const request = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(newCategory),
      }) as any;

      const response = await POST(request);
      
      expect(response.status).toBe(201);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://backend/api/categories/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newCategory),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token',
          }),
        })
      );
    });
  });
});
