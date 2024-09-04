"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenGraphController = void 0;
const open_graph_scraper_1 = __importDefault(require("open-graph-scraper"));
const constants_1 = require("@/constants");
const express_1 = require("express");
class OpenGraphController {
    constructor() {
        this.options = {
            fetchOptions: { headers: { 'user-agent': constants_1.userAgent } },
        };
        this.basePath = 'opengraph';
        this.router = (0, express_1.Router)();
    }
    register() {
        this.router.get('/description', this.getDescription.bind(this));
        return this.router;
    }
    async getDescription(req, res) {
        const { url } = req.query;
        if (typeof url !== 'string') {
            res.status(400).json({ error: 'URL must be a string' });
            return;
        }
        try {
            const description = await this.fetchDescriptionFromURL(url);
            res.json({ description });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch description' });
        }
    }
    async fetchDescriptionFromURL(url) {
        try {
            const { result } = await (0, open_graph_scraper_1.default)({ ...this.options, url });
            return result.ogDescription || 'No description found';
        }
        catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'An unknown error occurred'}`);
        }
    }
}
exports.OpenGraphController = OpenGraphController;
//# sourceMappingURL=OpenGraph.controller.js.map