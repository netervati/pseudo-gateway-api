import * as dotenv from 'dotenv';
import Fastify, { type FastifyRequest, type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import registerFunctions from '../functions';

dotenv.config();

// Instantiate Fastify with some config
export const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: '*',
});

app.register(registerFunctions, {
  prefix: '/'
})

export default async (req: FastifyRequest, res: FastifyReply) => {
    await app.ready();
    app.server.emit('request', req, res);
}
