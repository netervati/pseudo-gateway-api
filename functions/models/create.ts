import { type FastifyRequest, type FastifyReply } from 'fastify';
import { v4 as uuidv4  } from 'uuid';
import supabase from '../../supabase/client';
import { getApp } from '../../utils/auth';
import formatResponse from '../../utils/formatResponse';
import isValidAttribute from '../../utils/isValidAttribute';

type Params = {
  model: string;
};

type Object = {
  [key:string]: any;
};

const MAX_MODEL_DATA_ALLOWED = 10;

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

  const body = request.body as Object;
  
  if (Object.keys(body).length === 0) {
    return reply.status(400).send({
      error: 'Invalid request body provided.',
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
}
