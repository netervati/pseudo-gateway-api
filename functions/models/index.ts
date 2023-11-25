import { ServerlessRoutes } from '../types';

import create from './create';
import del from './delete';
import find from './find';
import list from './list';
import update from './update';

const routes: ServerlessRoutes = {
  create,
  delete: del,
  find,
  list,
  update
}

export default routes;
