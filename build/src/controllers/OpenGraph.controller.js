"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenGraphController = void 0;
const open_graph_scraper_1 = __importDefault(require("open-graph-scraper"));
const constants_1 = require("../constants");
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
        this.router.get('/title', this.getTitle.bind(this));
        this.router.get('/locale', this.getLocale.bind(this));
        this.router.get('/requestUrl', this.getRequestUrl.bind(this));
        this.router.get('/image', this.getImage.bind(this));
        this.router.get('/all', this.getAllData.bind(this));
        return this.router;
    }
    async getDescription(req, res) {
        await this.handleRequest(req, res, 'ogDescription');
    }
    async getTitle(req, res) {
        await this.handleRequest(req, res, 'ogTitle');
    }
    async getLocale(req, res) {
        await this.handleRequest(req, res, 'ogLocale');
    }
    async getRequestUrl(req, res) {
        await this.handleRequest(req, res, 'requestUrl');
    }
    async getImage(req, res) {
        await this.handleRequest(req, res, 'ogImage');
    }
    async getAllData(req, res) {
        const { url } = req.query;
        if (typeof url !== 'string') {
            res.status(400).json({ error: 'URL must be a string' });
            return;
        }
        try {
            const data = await this.fetchAllDataFromURL(url);
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch OpenGraph data' });
        }
    }
    async handleRequest(req, res, property) {
        const { url } = req.query;
        if (typeof url !== 'string') {
            res.status(400).json({ error: 'URL must be a string' });
            return;
        }
        try {
            const data = await this.fetchDataFromURL(url, property);
            res.json({ [property]: data });
        }
        catch (error) {
            res.status(500).json({ error: `Failed to fetch ${property}` });
        }
    }
    async fetchDataFromURL(url, property) {
        try {
            const { result } = await (0, open_graph_scraper_1.default)({ ...this.options, url });
            if (property === 'ogImage' && Array.isArray(result.ogImage) && result.ogImage.length > 0) {
                return result.ogImage[0].url;
            }
            return result[property] || null;
        }
        catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'An unknown error occurred'}`);
        }
    }
    async fetchAllDataFromURL(url) {
        try {
            const { result } = await (0, open_graph_scraper_1.default)({ ...this.options, url });
            const { ogTitle, ogDescription, ogLocale, requestUrl, ogImage } = result;
            return {
                ogTitle,
                ogDescription,
                ogLocale,
                requestUrl,
                ogImage: Array.isArray(ogImage) && ogImage.length > 0 ? ogImage[0].url : null,
            };
        }
        catch (error) {
            throw new Error(`${error instanceof Error ? error.message : 'An unknown error occurred'}`);
        }
    }
}
exports.OpenGraphController = OpenGraphController;
//# sourceMappingURL=OpenGraph.controller.js.map