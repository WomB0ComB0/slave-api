import type { Request, Response } from 'express';
import ogs from 'open-graph-scraper';
import { OpenGraphController } from '../../../src/controllers';
import IntegrationHelpers from '../../helpers/Integration-helpers';

// Mock the entire express module
jest.mock('express', () => {
  const mockRouter = {
    get: jest.fn(),
  };
  return {
    Router: jest.fn(() => mockRouter),
  };
});

jest.mock('open-graph-scraper');

describe('OpenGraphController', () => {
  let controller: OpenGraphController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockRouter: any;

  beforeEach(() => {
    // Reset the mock router for each test
    mockRouter = {
      get: jest.fn(),
    };
    (require('express').Router as jest.Mock).mockReturnValue(mockRouter);

    controller = new OpenGraphController();
    mockRequest = {
      query: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return a router with all routes registered', () => {
      const result = controller.register();
      expect(mockRouter.get).toHaveBeenCalledTimes(6);
      expect(mockRouter.get).toHaveBeenCalledWith('/description', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/title', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/locale', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/requestUrl', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/image', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/all', expect.any(Function));
      expect(result).toBe(mockRouter);
    });
  });

  describe('getDescription', () => {
    it('should return og description', async () => {
      mockRequest.query = { url: 'https://example.com' };
      (ogs as jest.Mock).mockResolvedValue({ result: { ogDescription: 'Test description' } });

      await controller['getDescription'](mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({ ogDescription: 'Test description' });
    });

    it('should handle invalid URL', async () => {
      mockRequest.query = {};

      await controller['getDescription'](mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'URL must be a string' });
    });

    it('should handle fetch error', async () => {
      mockRequest.query = { url: 'https://example.com' };
      (ogs as jest.Mock).mockRejectedValue(new Error('Fetch error'));

      await controller['getDescription'](mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch ogDescription' });
    });
  });

  // Similar tests for getTitle, getLocale, getRequestUrl, getImage

  describe('getAllData', () => {
    it('should return all og data', async () => {
      mockRequest.query = { url: 'https://example.com' };
      (ogs as jest.Mock).mockResolvedValue({
        result: {
          ogTitle: 'Test Title',
          ogDescription: 'Test Description',
          ogLocale: 'en_US',
          requestUrl: 'https://example.com',
          ogImage: [{ url: 'https://example.com/image.jpg' }],
        },
      });

      await controller['getAllData'](mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        ogTitle: 'Test Title',
        ogDescription: 'Test Description',
        ogLocale: 'en_US',
        requestUrl: 'https://example.com',
        ogImage: 'https://example.com/image.jpg',
      });
    });

    it('should handle invalid URL', async () => {
      mockRequest.query = {};

      await controller['getAllData'](mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'URL must be a string' });
    });

    it('should handle fetch error', async () => {
      mockRequest.query = { url: 'https://example.com' };
      (ogs as jest.Mock).mockRejectedValue(new Error('Fetch error'));

      await controller['getAllData'](mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch OpenGraph data' });
    });
  });
});
