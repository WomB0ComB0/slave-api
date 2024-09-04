import { Router } from 'express';
import SystemStatusController from './components/system-status/system-status.controller';
import { OpenGraphController } from './controllers';

/**
 * Here, you can register routes by instantiating the controller.
 *
 */
export default function registerRoutes(): Router {
	const router = Router();

	const controllers = [
		new SystemStatusController(),
		new OpenGraphController(),
	];

	// Dynamically register routes for each controller
	controllers.forEach((controller) => {
		// make sure each controller has basePath attribute and register() method
		router.use(`/v1/${controller.basePath}`, controller.register());
	});

	return router;
}
