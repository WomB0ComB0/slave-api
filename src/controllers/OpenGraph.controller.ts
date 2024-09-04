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
    return this.router;
  }

  private async getDescription(req: express.Request, res: express.Response): Promise<void> {
    const { url } = req.query;
    if (typeof url !== 'string') {
      res.status(400).json({ error: 'URL must be a string' });
      return;
    }
    try {
      const description = await this.fetchDescriptionFromURL(url);
      res.json({ description });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch description' });
    }
  }

  private async fetchDescriptionFromURL(url: string): Promise<string> {
    try {
      const { result } = await ogs({ ...this.options, url });
      return result.ogDescription || 'No description found';
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  }
}

export {
  OpenGraphController,
};