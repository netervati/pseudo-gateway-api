import { FastifyRequest } from 'fastify';

class AuthNotProvidedError extends Error {}

export function extractCredentials(req: FastifyRequest) {
  try {
    if (!req.headers.authorization) {
      throw new AuthNotProvidedError('Request is not authorized.');
    }

    const auth = req.headers.authorization
      .replace('Basic ', '');

    const creds = Buffer.from(auth, 'base64')
      .toString()
      .split(':');
  
    return {
      data: {
        userId: creds[0],
        password: creds[1],
      },
      error: null,
    };

  } catch (err) {
    return {
      data: null,
      error: err.message,
    }
  }
}
