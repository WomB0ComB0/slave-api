import './instrument';

import http from 'http';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import 'dotenv/config';
import * as Sentry from '@sentry/node';
import swaggerUi from 'swagger-ui-express';
import swag from '../swagger.json';
import addErrorHandler from './middleware/error-handler';
import { Api } from './myApi';
import registerRoutes from './routes';
import path from 'path';

export default class App {
  public express: express.Application;
  public httpServer: http.Server;
  private api: Api<unknown>;

  constructor() {
    this.express = express();
    this.httpServer = http.createServer(this.express);
    this.api = new Api();
    this.setupRoutes();
    this.setupSwaggerDocs();
  }

  public async init(): Promise<void> {
    // add all global middleware like cors
    this.middleware();

    // register all routes
    this.routes();

    // The error handler must be before any other error middleware and after all controllers
    this.express.use(Sentry.expressErrorHandler);

    // add the custom error handler
    this.express.use(addErrorHandler);

    // In a development/test environment, Swagger will be enabled.
    if (process.env.NODE_ENV !== 'prod') {
      this.setupSwaggerDocs();
    }
  }

  /**
   * here register your all routes
   */
  private routes(): void {
    this.express.get('/', this.basePathRoute);
    this.express.get('/web', this.parseRequestHeader, this.basePathRoute);
    this.express.use('/', registerRoutes());
  }

  /**
   * here you can apply your middlewares
   */
  private middleware(): void {
    // support application/json type post data
    // support application/x-www-form-urlencoded post data
    // Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
    this.express.use(helmet({ contentSecurityPolicy: false }));
    this.express.use(express.json({ limit: '100mb' }));
    this.express.use(express.urlencoded({ limit: '100mb', extended: true }));
    // add multiple cors options as per your use
    const corsOptions = {
      origin: [
        'http://localhost:8080/',
        'http://example.com/',
        'http://127.0.0.1:8080',
        'https://slave-api.vercel.app/',
      ],
    };
    this.express.use(cors(corsOptions));
  }

  private parseRequestHeader(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void {
    // parse request header
    // console.log(req.headers.access_token);
    next();
  }

  private basePathRoute(request: express.Request, response: express.Response): void {
    response.json({ message: 'base path' });
  }

  private setupRoutes(): void {
    // Example of using the generated API client
    this.express.get('/opengraph', async (req, res) => {
      try {
        const url = req.query.url as string;
        const result = await this.api.opengraph.getOpengraph({ url });
        res.json(result.data);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
      }
    });

    // Add more routes as needed
  }

  private setupSwaggerDocs(): void {
    const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath();

    this.express.use('/api-docs', express.static(swaggerUiAssetPath));

    // Setup Swagger UI
    this.express.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swag, {
        swaggerOptions: {
          url: '/swagger.json',
        },
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.css'
      })
    );

    this.express.get('/swagger.json', (req, res) => {
      res.sendFile(path.join(__dirname, '../swagger.json'));
    });
  }
}
