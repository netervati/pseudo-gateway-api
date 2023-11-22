import supabase from '../supabase/client';
import { v4 as uuidv4  } from 'uuid';
import { ServerlessRoutes } from './types';
import { getApp } from '../utils/auth';
import isValidAttribute from '../utils/isValidAttribute';

type Params = {
  model: string;
  id: string;
};

type Object = {
  [key:string]: any;
};

const MAX_MODEL_DATA_ALLOWED = 10;

function formatResponse(body: Object) {
  const modelData = structuredClone(body.schema);
  const id = modelData.id;

  delete modelData.id;

  return { id, data: modelData };
}

const routes: ServerlessRoutes = {
  create: async function (request, reply) {
    const { model } = request.params as Params;
    const { data, error } = await getApp(request);

    if (error) {
      return reply.status(error.status).send({
        error: error.message,
      });
    }

    const record = await supabase.from('models')
      .select('id, schema, model_data(id)')
      .is('deleted_at', null)
      .is('model_data.deleted_at', null)
      .eq('name', model)
      .eq('app_id', data.id);
    
    if (record.error) {
      return reply.status(record.status).send({
        error: record.error.message,
      });
    }

    if (record.data.length == 0) {
      return reply.status(404).send({
        error: 'Model not found.',
      });
    }

    if (record.data[0].model_data.length + 1 > MAX_MODEL_DATA_ALLOWED) {
      return reply.status(400).send({
        error: 'You have exceeded the allowed number of model data for this model.',
      });
    }

    const attrErrors: { attribute: string, detail: string }[] = [];
    const body = request.body as Object;
    const schema = record.data[0].schema as { name: string, type: string }[];

    const payload = schema.reduce<Object>(
      (obj, { name, type }) => {
        if (name in body && name !== 'id') {
          const isValid = isValidAttribute(type, body[name]);

          if (!isValid) {
            attrErrors.push({
              attribute: name,
              detail: `Not a valid ${type}`,
            });
          } else {
            obj[name] = body[name];
          } 
        }

        return obj;
      },
      {}
    );

    if (Object.keys(attrErrors).length > 0) {
      return reply.status(400).send({
        errors: attrErrors,
      });
    }

    payload.id = uuidv4();

    const modelData = await supabase
      .from('model_data')
      .insert({
        schema: payload,
        model_id: record.data[0].id,
      })
      .select('*');

    if (modelData.error) {
      return reply.status(modelData.status).send({
        error: modelData.error.message,
      });
    }

    reply.send(formatResponse(modelData.data[0]));
  },
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
