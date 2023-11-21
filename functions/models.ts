import supabase from '../supabase/client';
import { ServerlessRoutes } from './types';
import { getApp } from '../utils/auth';

type Params = {
  model: string;
  id: string;
};

type Object = {
  [key:string]: any;
};

function formatResponse(body: Object) {
  const modelData = structuredClone(body.schema);
  const id = modelData.id;

  delete modelData.id;

  return { id, data: modelData };
}

const routes: ServerlessRoutes = {
  find: async function (request, reply) {
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

    if (!record.data || record.data.length == 0) {
      return reply.status(404).send({
        error: `${model} with id ${id} not found.`,
      });
    }

    const response = formatResponse(
      record.data[0].model_data[0]
    );

    reply.send(response);
  },
  list: async function (request, reply) {
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
  },
}

export default routes;
