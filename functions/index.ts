import { FastifyInstance, FastifyServerOptions } from 'fastify';
import models from './models';
import healthCheck from './healthCheck';

export default function (app: FastifyInstance, _opts: FastifyServerOptions, done: () => void) {
  app.get('/', healthCheck.get);
  app.get('/:model/:id', models.find);
  app.get('/:model', models.list);

  done();
}
