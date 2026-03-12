import { createRouter } from '../utils/createRouter.ts';
import { AdminController } from '../controllers/admins.js';

const router = createRouter();

// Controller akan di-instantiate di app initialization
export function setupAdminRoutes(controller: AdminController) {
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}

export default router;
