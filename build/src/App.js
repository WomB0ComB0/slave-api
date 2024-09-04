"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const helmet_1 = __importDefault(require("helmet"));
require("dotenv/config");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const routes_1 = __importDefault(require("./routes"));
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
class App {
    async init() {
        this.express = (0, express_1.default)();
        this.httpServer = http_1.default.createServer(this.express);
        // add all global middleware like cors
        this.middleware();
        // // register the all routes
        this.routes();
        // add the middleware to handle error, make sure to add if after registering routes method
        this.sentry.setupExpressErrorHandler(this.express);
        this.express.use(error_handler_1.default);
        // In a development/test environment, Swagger will be enabled.
        if (process.env.NODE_ENV !== 'prod') {
            this.setupSwaggerDocs();
        }
    }
    /**
     * here register your all routes
     */
    routes() {
        this.express.get('/', this.basePathRoute);
        this.express.get('/web', this.parseRequestHeader, this.basePathRoute);
        this.express.use('/', (0, routes_1.default)());
    }
    /**
     * here you can apply your middlewares
     */
    middleware() {
        // support application/json type post data
        // support application/x-www-form-urlencoded post data
        // Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
        this.express.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
        this.express.use(express_1.default.json({ limit: '100mb' }));
        this.express.use(express_1.default.urlencoded({ limit: '100mb', extended: true }));
        // add multiple cors options as per your use
        const corsOptions = {
            origin: [
                'http://localhost:8080/',
                'http://example.com/',
                'http://127.0.0.1:8080',
            ],
        };
        this.express.use((0, cors_1.default)(corsOptions));
    }
    parseRequestHeader(req, res, next) {
        // parse request header
        // console.log(req.headers.access_token);
        next();
    }
    basePathRoute(request, response) {
        response.json({ message: 'base path' });
    }
    setupSwaggerDocs() {
        this.express.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map