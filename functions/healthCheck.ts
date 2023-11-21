import { ServerlessRoutes } from './types';

const routes: ServerlessRoutes = {
  get: function (_request, reply) {
    reply.send({ status: 'ok' })
  },
}

export default routes;
