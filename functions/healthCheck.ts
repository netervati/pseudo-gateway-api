import { type FastifyRequest, type FastifyReply } from "fastify";

type ServerlessRoutes = {
  [key: string]: (req: FastifyRequest, rep: FastifyReply) => void;
}

const routes: ServerlessRoutes = {
  get: function (_request, reply) {
    reply.send({ status: 'ok' })
  },
}

export default routes;
