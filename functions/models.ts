import supabase from '../supabase/client';
import { ServerlessRoutes } from './types';
import { extractCredentials } from '../utils/http';

type Params = {
  model: string;
};

const routes: ServerlessRoutes = {
  get: async function (request, reply) {
    const { model } = request.params as Params;
    const { data, error } = extractCredentials(request);

    if (error) {
      return reply.status(401).send({
        error,
      });
    }

    const app = await supabase.from('apps')
      .select('id, app_keys!inner(api_key, secret_key)')
      .eq('app_keys.api_key', data?.userId);

    if (app.error) {
      return reply.status(app.status).send({
        error: app.error,
      });
    }

    const record = await supabase.from('models')
      .select('id, model_data!inner(schema)')
      .is('deleted_at', null)
      .is('model_data.deleted_at', null)
      .eq('name', model)
      .eq('app_id', app.data[0].id);

    reply.send(record.data)
  },
}

export default routes;
