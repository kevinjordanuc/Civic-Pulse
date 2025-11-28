import axios from 'axios';

import { getOfflineEvents, type CivicEvent } from '@/data/civicEvents';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api',
  timeout: 10_000,
});

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  card?: unknown;
};

export async function fetchChatCompletion(
  messages: Array<Omit<ChatMessage, 'card'>>,
  profileId?: string,
) {
  const { data } = await api.post('/chat/completions', {
    messages,
    profile_id: profileId,
  });
  return data as { answer: string; citations: string[] };
}

export async function fetchEvents(municipality?: string) {
  try {
    const { data } = await api.get<CivicEvent[]>('/map/events', {
      params: { municipality },
    });

    if (Array.isArray(data) && data.length) {
      return data;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Fallo la carga del API de eventos, usando mocks locales.', error);
    }
  }

  return getOfflineEvents(municipality);
}

export async function fetchForums() {
  const { data } = await api.get('/forums');
  return data as Array<{ id: string; title: string; posts: Array<{ id: string; author: string; content: string }> }>;
}

export async function fetchNotifications(profileId: string) {
  const { data } = await api.get('/notifications/preview', {
    params: { profile_id: profileId },
  });
  return data as Array<{
    id: string;
    title: string;
    body: string;
    published_at: string;
    municipality?: string;
    tags?: string[];
  }>;
}

export default api;
