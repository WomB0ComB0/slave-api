'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const App_1 = __importDefault(require('./App'));
const logger_1 = __importDefault(require('./lib/logger'));
const app = new App_1.default();
let server;
function serverError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  // handle specific error codes here.
  throw error;
}
function serverListening() {
  const addressInfo = server.address();
  logger_1.default.info(`Listening on ${addressInfo.address}:${process.env.PORT || 8080}`);
}
app
  .init()
  .then(() => {
    app.express.set('port', process.env.PORT || 8080);
    server = app.httpServer;
    server.on('error', serverError);
    server.on('listening', serverListening);
    server.listen(process.env.PORT || 8080);
  })
  .catch((err) => {
    logger_1.default.info('app.init error');
    logger_1.default.error(err.name);
    logger_1.default.error(err.message);
    logger_1.default.error(err.stack);
  });
process.on('unhandledRejection', (reason) => {
  logger_1.default.error('Unhandled Promise Rejection: reason:', reason.message);
  logger_1.default.error(reason.stack);
  // application specific logging, throwing an error, or other logic here
});
//# sourceMappingURL=server.js.map
