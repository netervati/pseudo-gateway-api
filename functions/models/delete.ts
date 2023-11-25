import { type FastifyRequest, type FastifyReply } from 'fastify';
import supabase from '../../supabase/client';
import { getApp } from '../../utils/auth';

type Params = {
  id: string;
  model: string;
};

export default async function (
  request: FastifyRequest,
  reply: FastifyReply)
{
  const { id, model } = request.params as Params;
  const { data, error } = await getApp(request);

  if (error) {
    return reply.status(error.status).send({
      error: error.message,
    });
  }

  const record = await supabase.from('models')
    .select('id, model_data!inner(id, schema)')
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

  const modelData = await supabase.from('model_data')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', record.data[0].model_data[0].id)
    .select('*');

  if (modelData.error) {
    return reply.status(modelData.status).send({
      error: modelData.error.message,
    });
  }

  return reply.status(204).send();
}
