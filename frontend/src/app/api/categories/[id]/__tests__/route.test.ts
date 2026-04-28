// src/app/api/categories/[id]/__tests__/route.test.ts

import { GET, PATCH, DELETE } from '../route';

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

describe('Categories [id] API Route', () => {
  const mockId = '123';
  const mockParams = { params: Promise.resolve({ id: mockId }) };

  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'fake-token';
    global.fetch = jest.fn();
  });

  describe('GET', () => {
    it('récupère avec succès une catégorie depuis le backend', async () => {
      const mockData = { id: 123, name: 'Action' };
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: async () => mockData,
      });

      const response = await GET(new Request('http://localhost') as any, mockParams as any);
      
      expect(response.status).toBe(200);
      const json = await (response as any).json();
      expect(json).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://backend/api/categories/123/',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('gère les erreurs du backend', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      const response = await GET(new Request('http://localhost') as any, mockParams as any);
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH', () => {
    it('retourne 401 si l\'utilisateur n\'est pas authentifié', async () => {
      mockToken = undefined;
      const response = await PATCH(new Request('http://localhost', { method: 'PATCH' }) as any, mockParams as any);
      expect(response.status).toBe(401);
    });

    it('met à jour une catégorie avec succès', async () => {
      const updateData = { name: 'Horror' };
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: async () => ({ id: 123, ...updateData }),
      });

      const request = new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      }) as any;

      const response = await PATCH(request, mockParams as any);
      
      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://backend/api/categories/123/',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token',
          }),
        })
      );
    });
  });

  describe('DELETE', () => {
    it('retourne 401 si l\'utilisateur n\'est pas authentifié', async () => {
      mockToken = undefined;
      const response = await DELETE(new Request('http://localhost') as any, mockParams as any);
      expect(response.status).toBe(401);
    });

    it('supprime une catégorie avec succès (204 No Content)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 204,
      });

      const response = await DELETE(new Request('http://localhost') as any, mockParams as any);
      
      expect(response.status).toBe(204);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://backend/api/categories/123/',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('gère les erreurs de suppression du backend', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 400,
        json: async () => ({ error: 'Cannot delete category' }),
      });

      const response = await DELETE(new Request('http://localhost') as any, mockParams as any);
      expect(response.status).toBe(400);
      const json = await (response as any).json();
      expect(json).toEqual({ error: 'Cannot delete category' });
    });
  });
});
