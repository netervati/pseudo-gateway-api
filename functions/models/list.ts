import { type FastifyRequest, type FastifyReply } from 'fastify';
import supabase from '../../supabase/client';
import { getApp } from '../../utils/auth';
import formatResponse from '../../utils/formatResponse';

type Params = {
  model: string;
};

export default async function (
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { model } = request.params as Params;
  const { data, error } = await getApp(request);

  if (error) {
    return reply.status(error.status).send({
      error: error.message,
    });
  }

  const record = await supabase.from('models')
    .select('id, model_data!inner(schema)')
    .is('deleted_at', null)
    .is('model_data.deleted_at', null)
    .eq('name', model)
    .eq('app_id', data.id);

  let response: { id: any, data: any }[] = []
  
  if (record.data) {
    response = record.data[0].model_data
      .map(formatResponse);
  }

  reply.send(response);
}
