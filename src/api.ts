const BASE = '/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  login: (account: string, password: string) =>
    req<{ token: string }>('POST', '/auth/login', { account, password }),

  getFinishers: (race?: string) =>
    req<any[]>('GET', `/finishers${race ? `?race=${encodeURIComponent(race)}` : ''}`),
  addFinisher: (f: any) => req<any>('POST', '/finishers', f),
  updateFinisher: (id: string, f: any) => req<any>('PUT', `/finishers/${id}`, f),
  deleteFinisher: (id: string) => req<any>('DELETE', `/finishers/${id}`),
  batchDeleteFinishers: (ids: string[]) => req<any>('POST', '/finishers/batch-delete', { ids }),
  batchFinishers: (items: any[]) => req<any>('POST', '/finishers/batch', items),

  getVolunteers: (race?: string) =>
    req<any[]>('GET', `/volunteers${race ? `?race=${encodeURIComponent(race)}` : ''}`),
  addVolunteer: (v: any) => req<any>('POST', '/volunteers', v),
  updateVolunteer: (id: string, v: any) => req<any>('PUT', `/volunteers/${id}`, v),
  deleteVolunteer: (id: string) => req<any>('DELETE', `/volunteers/${id}`),
  batchDeleteVolunteers: (ids: string[]) => req<any>('POST', '/volunteers/batch-delete', { ids }),
  batchVolunteers: (items: any[]) => req<any>('POST', '/volunteers/batch', items),

  getRaces: () => fetch(`${BASE}/races`).then(r => r.json()) as Promise<string[]>,

  generateQuote: (name: string, category: string, finishTime: string, lang: string) =>
    req<{ quote: string }>('POST', '/ai/quote', { name, category, finishTime, lang }),
  generateBatchQuotes: (runners: any[], lang: string) =>
    req<{ name: string; quote: string }[]>('POST', '/ai/quotes/batch', { runners, lang }),
  generateBadge: (theme: string) =>
    req<{ imageUrl: string | null }>('POST', '/ai/badge', { theme }),
};
