"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerRoutes;
const express_1 = require("express");
const system_status_controller_1 = __importDefault(require("./components/system-status/system-status.controller"));
const controllers_1 = require("@/controllers");
/**
 * Here, you can register routes by instantiating the controller.
 *
 */
function registerRoutes() {
    const router = (0, express_1.Router)();
    const controllers = [
        new system_status_controller_1.default(),
        new controllers_1.OpenGraphController(),
    ];
    // Dynamically register routes for each controller
    controllers.forEach((controller) => {
        // make sure each controller has basePath attribute and register() method
        router.use(`/v1/${controller.basePath}`, controller.register());
    });
    return router;
}
//# sourceMappingURL=routes.js.map