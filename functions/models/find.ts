import { type FastifyRequest, type FastifyReply } from 'fastify';
import supabase from '../../supabase/client';
import { getApp } from '../../utils/auth';
import formatResponse from '../../utils/formatResponse';

type Params = {
  model: string;
  id: string;
};

export default async function (
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id, model } = request.params as Params;
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
    .eq('model_data.schema->>id', id)
    .eq('name', model)
    .eq('app_id', data.id);

  if (record.error) {
    return reply.status(record.status).send({
      error: record.error.message,
    });
  }

  if (record.data.length == 0) {
    return reply.status(404).send({
      error: `${model} with id ${id} not found.`,
    });
  }

  const response = formatResponse(
    record.data[0].model_data[0]
  );

  reply.send(response);
}
