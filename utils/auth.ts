import { FastifyRequest } from 'fastify';
import supabase from '../supabase/client';
import { extractCredentials } from './http';

export async function getApp(req: FastifyRequest) {
  const { data, error } = extractCredentials(req);

  if (error) {
    return {
      data: null,
      error: {
        status: 403,
        message: error,
      },
    }
  }

  const app = await supabase.from('apps')
    .select('id, app_keys!inner(api_key, secret_key)')
    .eq('app_keys.api_key', data?.userId);

  if (app.error) {
    return {
      data: null,
      error: {
        status: app.status,
        message: app.error,
      },
    }
  }

  return {
    data: app.data[0],
    error: null,
  }
}
