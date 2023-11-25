import { type FastifyRequest, type FastifyReply } from 'fastify';
import supabase from '../../supabase/client';
import { getApp } from '../../utils/auth';
import formatResponse from '../../utils/formatResponse';
import isValidAttribute from '../../utils/isValidAttribute';

type Params = {
  id: string;
  model: string;
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

  const body = request.body as Object;

  if (Object.keys(body).length === 0) {
    return reply.status(400).send({
      error: 'Invalid request body provided.',
    });
  }

  const record = await supabase.from('models')
    .select('id, schema, model_data!inner(id, schema)')
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

  const modelData = await supabase
    .from('model_data')
    .update({
      // TODO: Find a way to update via:
      // `schema || '${JSON.stringify(payload)}'`
      schema: {
        ...record.data[0].model_data[0].schema,
        ...payload,
      }
    })
    .eq('id', record.data[0].model_data[0].id)
    .select('*');

  if (modelData.error) {
    return reply.status(modelData.status).send({
      error: modelData.error.message,
    });
  }

  reply.send(formatResponse(modelData.data[0]));
}
