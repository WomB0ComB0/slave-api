/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import type { Response } from 'node-fetch';

export type ApiResponse = object;

export interface OpenGraphResponse {
  ogDescription?: string;
  ogTitle?: string;
  ogLocale?: string;
  requestUrl?: string;
  ogImage?: string;
}

export interface OpenGraphAllResponse {
  ogTitle?: string;
  ogDescription?: string;
  ogLocale?: string;
  requestUrl?: string;
  ogImage?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Response, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D, E = unknown> extends Response {
  data: D;
  error: E;
  ok: boolean;
}

type CancelToken = symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl = '/v1';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
        },
        signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
        body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = {
        ...response,
        data: null as unknown as T,
        error: null as unknown as E,
      } as HttpResponse<T, E>;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Slave API
 * @version 1.0.0
 * @baseUrl /v1
 * @externalDocs https://your-documentation-url.com
 *
 * Slave API for utility operations to support various projects
 */
export class Api<SecurityDataType> extends HttpClient<SecurityDataType> {
  utility = {
    /**
     * @description Convert a file from one format to another
     *
     * @tags utility
     * @name FileConversionCreate
     * @summary Convert file format
     * @request POST:/utility/file-conversion
     */
    fileConversionCreate: (params: RequestParams = {}) =>
      this.request<ApiResponse, any>({
        path: `/utility/file-conversion`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Resize an image to specified dimensions
     *
     * @tags utility
     * @name ImageResizeCreate
     * @summary Resize image
     * @request POST:/utility/image-resize
     */
    imageResizeCreate: (params: RequestParams = {}) =>
      this.request<ApiResponse, any>({
        path: `/utility/image-resize`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Validate data against a specified schema
     *
     * @tags utility
     * @name DataValidationCreate
     * @summary Validate data
     * @request POST:/utility/data-validation
     */
    dataValidationCreate: (params: RequestParams = {}) =>
      this.request<ApiResponse, any>({
        path: `/utility/data-validation`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description Perform various text processing operations
     *
     * @tags utility
     * @name TextProcessingCreate
     * @summary Process text
     * @request POST:/utility/text-processing
     */
    textProcessingCreate: (params: RequestParams = {}) =>
      this.request<ApiResponse, any>({
        path: `/utility/text-processing`,
        method: 'POST',
        ...params,
      }),
  };
  opengraph = {
    /**
     * @description Retrieve the OpenGraph description for a given URL
     *
     * @tags opengraph
     * @name DescriptionList
     * @summary Get OpenGraph description
     * @request GET:/opengraph/description
     */
    descriptionList: (
      query: {
        /** URL to fetch OpenGraph data from */
        url: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OpenGraphResponse, void>({
        path: `/opengraph/description`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * @description Retrieve the OpenGraph title for a given URL
     *
     * @tags opengraph
     * @name TitleList
     * @summary Get OpenGraph title
     * @request GET:/opengraph/title
     */
    titleList: (
      query: {
        /** URL to fetch OpenGraph data from */
        url: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OpenGraphResponse, void>({
        path: `/opengraph/title`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * @description Retrieve the OpenGraph locale for a given URL
     *
     * @tags opengraph
     * @name LocaleList
     * @summary Get OpenGraph locale
     * @request GET:/opengraph/locale
     */
    localeList: (
      query: {
        /** URL to fetch OpenGraph data from */
        url: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OpenGraphResponse, void>({
        path: `/opengraph/locale`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * @description Retrieve the OpenGraph request URL for a given URL
     *
     * @tags opengraph
     * @name RequestUrlList
     * @summary Get OpenGraph request URL
     * @request GET:/opengraph/requestUrl
     */
    requestUrlList: (
      query: {
        /** URL to fetch OpenGraph data from */
        url: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OpenGraphResponse, void>({
        path: `/opengraph/requestUrl`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * @description Retrieve the OpenGraph image URL for a given URL
     *
     * @tags opengraph
     * @name ImageList
     * @summary Get OpenGraph image
     * @request GET:/opengraph/image
     */
    imageList: (
      query: {
        /** URL to fetch OpenGraph data from */
        url: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OpenGraphResponse, void>({
        path: `/opengraph/image`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * @description Retrieve all OpenGraph data for a given URL
     *
     * @tags opengraph
     * @name GetOpengraph
     * @summary Get all OpenGraph data
     * @request GET:/opengraph/all
     */
    getOpengraph: (
      query: {
        /** URL to fetch OpenGraph data from */
        url: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<OpenGraphAllResponse, void>({
        path: `/opengraph/all`,
        method: 'GET',
        query: query,
        ...params,
      }),
  };
}
