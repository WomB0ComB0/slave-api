import ogs from 'open-graph-scraper';
import { userAgent } from '@/constants';
import type { OpenGraphScraperOptions } from 'open-graph-scraper/types/lib/types';

class OpenGraphController {
  private options: OpenGraphScraperOptions;

  constructor() {
    this.options = {
      fetchOptions: { headers: { 'user-agent': userAgent } },
    };
  }

  public async fetchDescriptionFromURL(url: string): Promise<string> {
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