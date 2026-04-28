// src/app/api/__tests__/api-routes.test.ts

if (typeof global.Request === 'undefined') {
  (global as any).Request = class Request {
    url: string; method: string; bodyText: string;
    constructor(input: string, init?: any) {
      this.url = input; this.method = init?.method || 'GET'; this.bodyText = init?.body || '{}';
    }
    async json() { return JSON.parse(this.bodyText); }
  };
}
if (typeof global.Response === 'undefined') {
  (global as any).Response = class Response {
    status: number; ok: boolean;
    constructor(body?: any, init?: any) {
      this.status = init?.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
    }
    async json() { return {}; }
  };
}

jest.mock('next/server', () => {
  class MockNextResponse {
    status: number; body: any; cookies: any;
    constructor(body?: any, init?: any) {
      this.body = body; this.status = init?.status || 200; this.cookies = { set: jest.fn() };
    }
    static json(body: any, init?: any) { return new MockNextResponse(body, init); }
  }
  return { NextResponse: MockNextResponse };
});

let mockHasToken = true;
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockImplementation(async () => ({
    get: (name: string) => mockHasToken ? { value: 'fake-token' } : undefined,
    set: jest.fn(),
  })),
}));

// TOUS LES IMPORTS
import { GET as getAdminUsers } from '../admin/users/route';
import { GET as getAssocReq, POST as postAssocReq } from '../association-requests/route';
import { POST as postApprove } from '../association-requests/[id]/approve/route';
import { POST as postReject } from '../association-requests/[id]/reject/route';
import { GET as getAssoc } from '../associations/route';
import { POST as postLogin } from '../auth/login/route';
import { POST as postLogout } from '../auth/logout/route';
import { GET as getAuthMe } from '../auth/me/route';
import { POST as postRegister } from '../auth/register/route';
import { GET as getDashEvents } from '../dashboard/events/route';
import { GET as getEvents, POST as postEvents } from '../events/route';
import { POST as postCancel } from '../events/[id]/cancel/route';
import { GET as getComments, POST as postComments } from '../events/[id]/comments/route';
import { POST as postFavorite, DELETE as deleteFavorite } from '../events/[id]/favorite/route';
import { POST as postPublish } from '../events/[id]/publish/route';
import { POST as postSignup, DELETE as deleteSignup } from '../events/[id]/signup/route';

describe('API Routes Full Coverage', () => {
  beforeEach(() => {
    mockHasToken = true;
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ access: 'acc', refresh: 'ref', data: [] }) });
  });

  const makeReq = (method = 'GET', body = {}) => new Request('http://localhost', { method, body: JSON.stringify(body) }) as any;
  const makeParams = (id = '1') => ({ params: Promise.resolve({ id }) }) as any;

  it('handles all standard successful routes', async () => {
    expect((await getAdminUsers() as any).status).toBe(200);
    expect((await getAssocReq() as any).status).toBe(200);
    expect((await postAssocReq(makeReq('POST')) as any).status).toBe(200);
    expect((await postApprove(makeReq('POST'), makeParams()) as any).status).toBe(200);
    expect((await postReject(makeReq('POST'), makeParams()) as any).status).toBe(200);
    expect((await getAssoc(makeReq()) as any).status).toBe(200);
    expect((await postLogin(makeReq('POST', { email: 't@t.com', password: 'pwd' })) as any).status).toBe(200);
    expect((await postLogout() as any).status).toBe(200);
    expect((await getAuthMe() as any).status).toBe(200);
    expect((await postRegister(makeReq('POST', { email: 't@t.com' })) as any).status).toBe(200);
    expect((await getDashEvents() as any).status).toBe(200);
    expect((await getEvents(makeReq()) as any).status).toBe(200);
    expect((await postEvents(makeReq('POST')) as any).status).toBe(200);
    expect((await postCancel(makeReq('POST'), makeParams()) as any).status).toBe(200);
    expect((await getComments(makeReq(), makeParams()) as any).status).toBe(200);
    expect((await postComments(makeReq('POST'), makeParams()) as any).status).toBe(200);
    expect((await postPublish(makeReq('POST'), makeParams()) as any).status).toBe(200);

    // 204 No Content handlers
    global.fetch = jest.fn().mockResolvedValue({ status: 204, ok: true });
    expect((await postFavorite(makeReq('POST'), makeParams()) as any).status).toBe(204);
    expect((await deleteFavorite(makeReq('DELETE'), makeParams()) as any).status).toBe(204);
    expect((await postSignup(makeReq('POST'), makeParams()) as any).status).toBe(204);
    expect((await deleteSignup(makeReq('DELETE'), makeParams()) as any).status).toBe(204);
  });

  it('returns 401 when token is missing', async () => {
    mockHasToken = false;
    expect((await getAdminUsers() as any).status).toBe(401);
    expect((await postEvents(makeReq('POST')) as any).status).toBe(401);
    expect((await postSignup(makeReq('POST'), makeParams()) as any).status).toBe(401);
  });

  it('handles JSON parse errors in Auth', async () => {
    const badReq = new Request('http://localhost', { method: 'POST', body: 'invalid-json{' }) as any;
    badReq.json = async () => { throw new Error('Bad JSON'); }; 
    
    expect((await postLogin(badReq) as any).status).toBe(400);
    expect((await postRegister(badReq) as any).status).toBe(400);
  });

  it('handles backend returning errors in Auth', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'bad req' }) });
    expect((await postLogin(makeReq('POST')) as any).status).toBe(400);
    expect((await postRegister(makeReq('POST')) as any).status).toBe(400);
  });

  it('handles token refresh in Auth Me', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) }) // Access failed
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ access: 'new-token' }) }) // Refresh ok
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 1 }) }); // Second access ok
    
    const res: any = await getAuthMe();
    expect(res.status).toBe(200);
  });
});