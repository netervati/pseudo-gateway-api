import { FastifyInstance, FastifyServerOptions } from 'fastify';
import healthCheck from './healthCheck';

export default function (app: FastifyInstance, _opts: FastifyServerOptions, done: () => void) {
  app.get('/', healthCheck.get);
  done();
}
