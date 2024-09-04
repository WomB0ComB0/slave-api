import ogs from 'open-graph-scraper';
import { userAgent } from '../constants';
import type { OpenGraphScraperOptions } from 'open-graph-scraper/types/lib/types';
import { Router } from 'express';
import express from 'express';

class OpenGraphController {
  private options: OpenGraphScraperOptions;
  public basePath: string;
  private router: Router;

  constructor() {
    this.options = {
      fetchOptions: { headers: { 'user-agent': userAgent } },
    };
    this.basePath = 'opengraph';
    this.router = Router();
  }

  public register(): Router {
    this.router.get('/description', this.getDescription.bind(this));
    this.router.get('/title', this.getTitle.bind(this));
    this.router.get('/locale', this.getLocale.bind(this));
    this.router.get('/requestUrl', this.getRequestUrl.bind(this));
    this.router.get('/image', this.getImage.bind(this));
    this.router.get('/all', this.getAllData.bind(this));
    return this.router;
  }

  private async getDescription(req: express.Request, res: express.Response): Promise<void> {
    await this.handleRequest(req, res, 'ogDescription');
  }

  private async getTitle(req: express.Request, res: express.Response): Promise<void> {
    await this.handleRequest(req, res, 'ogTitle');
  }

  private async getLocale(req: express.Request, res: express.Response): Promise<void> {
    await this.handleRequest(req, res, 'ogLocale');
  }

  private async getRequestUrl(req: express.Request, res: express.Response): Promise<void> {
    await this.handleRequest(req, res, 'requestUrl');
  }

  private async getImage(req: express.Request, res: express.Response): Promise<void> {
    await this.handleRequest(req, res, 'ogImage');
  }

  private async getAllData(req: express.Request, res: express.Response): Promise<void> {
    const { url } = req.query;
    if (typeof url !== 'string') {
      res.status(400).json({ error: 'URL must be a string' });
      return;
    }
    try {
      const data = await this.fetchAllDataFromURL(url);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch OpenGraph data' });
    }
  }

  private async handleRequest(req: express.Request, res: express.Response, property: string): Promise<void> {
    const { url } = req.query;
    if (typeof url !== 'string') {
      res.status(400).json({ error: 'URL must be a string' });
      return;
    }
    try {
      const data = await this.fetchDataFromURL(url, property);
      res.json({ [property]: data });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch ${property}` });
    }
  }

  private async fetchDataFromURL(url: string, property: string): Promise<string | object | null> {
    try {
      const { result } = await ogs({ ...this.options, url });
      if (property === 'ogImage' && Array.isArray(result.ogImage) && result.ogImage.length > 0) {
        return result.ogImage[0].url;
      }
      return result[property] || null;
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  }

  private async fetchAllDataFromURL(url: string): Promise<object> {
    try {
      const { result } = await ogs({ ...this.options, url });
      const { ogTitle, ogDescription, ogLocale, requestUrl, ogImage } = result;
      return {
        ogTitle,
        ogDescription,
        ogLocale,
        requestUrl,
        ogImage: Array.isArray(ogImage) && ogImage.length > 0 ? ogImage[0].url : null,
      };
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  }
}

export {
  OpenGraphController,
};