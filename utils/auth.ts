import { FastifyRequest } from 'fastify';
import supabase from '../supabase/client';
import { extractCredentials } from './http';
import verifyPassword from './verifyPassword';

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

  if (!data?.password) {
    return {
      data: null,
      error: {
        status: 403,
        message: 'Unrecognized authentication scheme.',
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

  if (app.data.length === 0) {
    return {
      data: null,
      error: {
        status: 403,
        message: 'Provided keys do not match any existing apps.',
      },
    }
  }

  const isVerified = await verifyPassword(
    app.data[0].app_keys[0].secret_key,
    data?.password
  );

  if (!isVerified) {
    return {
      data: null,
      error: {
        status: 403,
        message: 'Provided keys do not match any existing apps.',
      },
    }
  }

  return {
    data: app.data[0],
    error: null,
  }
}
