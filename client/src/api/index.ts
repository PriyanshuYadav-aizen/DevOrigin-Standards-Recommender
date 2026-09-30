export type Standard = {
  standardNumber: string;
  title: string;
  category: string;
  testMethods: string[];
  alliedCodes: string[];
  certificationRequired: string[];
  edition: string;
  status: 'current' | 'superseded';
  supersededBy?: string | null;
};

export type Recommendation = {
  matchedStandards: string[];
  standards: Standard[];
  confidenceScore: number;
  reasoning: string;
  certificationFlags: string[];
  needsReview: boolean;
  queryId: string;
  createdAt: string;
};

export type QueryLog = {
  id: string;
  inputText: string;
  matchedStandards: string[];
  confidenceScore: number;
  reasoning: string;
  certificationFlags: string[];
  needsReview: boolean;
  createdAt: string;
};

export type StandardsSummary = {
  total: number;
  current: number;
  categories: { category: string; count: number }[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}

export const recommend = (text: string) =>
  request<Recommendation>('/api/recommend', {
    method: 'POST',
    body: JSON.stringify({ inputText: text }),
  });

export const getQueries = () => request<QueryLog[]>('/api/queries');
export const getStandards = () => request<Standard[]>('/api/standards');
export const getStandardsSummary = () => request<StandardsSummary>('/api/standards/summary');
export const getHealth = () => request<{ status: string }>('/api/health');
