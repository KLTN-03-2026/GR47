import express from 'express';
import * as ClientController from '../../controllers/ClientController.js';

import * as ClientMiddleware from '../../middlewares/ClientMiddleware.js';

const clientRouter = express.Router();

clientRouter.post('/login', ClientController.login);
clientRouter.post('/register', ClientController.register);

clientRouter.post('/check-auth', ClientMiddleware.protect, ClientController.checkAuth);

export default clientRouter;