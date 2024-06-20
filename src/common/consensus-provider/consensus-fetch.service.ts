import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { FetchModuleOptions, FetchService, RequestInfo, RequestInit } from '@lido-nestjs/fetch';
import { MiddlewareService } from '@lido-nestjs/middleware';
import { AbortController } from 'node-abort-controller';
import { Response } from 'node-fetch';
import { CONSENSUS_REQUEST_TIMEOUT } from './consensus-provider.constants';
import { LOGGER_PROVIDER } from '@lido-nestjs/logger';

@Injectable()
export class ConsensusFetchService extends FetchService {
  constructor(
    options: FetchModuleOptions,
    middlewareService: MiddlewareService<Promise<Response>>,
    @Inject(LOGGER_PROVIDER) protected readonly logger: LoggerService,
  ) {
    super(options, middlewareService);
  }

  /**
   * Adds timeout to the source method of fetch service
   */
  protected request(
    url: RequestInfo,
    options?: RequestInit | undefined,
    attempt?: number | undefined,
  ): Promise<Response> {
    const controller = new AbortController();
    const { signal } = controller;

    setTimeout(() => {
      controller.abort();
    }, CONSENSUS_REQUEST_TIMEOUT);

    return super.request(url, { ...options, signal }, attempt);
  }
}
