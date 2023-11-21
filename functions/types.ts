import { type FastifyRequest, type FastifyReply } from "fastify";

export type ServerlessRoutes = {
  [key: string]: (req: FastifyRequest, rep: FastifyReply) => void;
}
