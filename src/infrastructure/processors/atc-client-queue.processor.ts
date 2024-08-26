import { HttpService } from '@nestjs/axios';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { Job, Queue } from 'bull';

import { ATC_CLIENT_JOB, ATC_CLIENT_QUEUE } from '../constants/queue';
import { isApiLimitReached } from '../helpers/queue';
import { AtcClientJob } from '../models/atc-client-job.model';

@Injectable()
@Processor(ATC_CLIENT_QUEUE)
export class ApiRequestProcessor {
  private throttleDelayUnity = 2000;
  private throttleDelayTotal = this.throttleDelayUnity;
  private firstJob = true;

  private readonly logger = new Logger(ApiRequestProcessor.name);

  constructor(
    @InjectQueue(ATC_CLIENT_QUEUE) private readonly queue: Queue<AtcClientJob>,
    private readonly httpService: HttpService,
  ) {}

  // Timeout to continue when API reached its request limit
  async handleRequestsThrottle() {
    await new Promise((resolve) =>
      setTimeout(resolve, this.throttleDelayTotal),
    );
  }

  @Process(ATC_CLIENT_JOB)
  async handleApiCall(job: Job<AtcClientJob>) {
    const { endpoint, params, method } = job.data;
    try {
      this.logger.log(`Queue job for ${endpoint} created`);

      // If is the first queue job it means the API is throttling
      const queueLength = await this.queue.count();
      if (queueLength === 1 && this.firstJob) {
        await this.handleRequestsThrottle();
        this.firstJob = false;
      }

      const response = await this.httpService.axiosRef(endpoint, {
        params,
        method,
      });

      this.throttleDelayTotal = this.throttleDelayUnity;

      return response.data;
    } catch (error) {
      const { message = 'Unknown error' } = error as AxiosError;

      await job.releaseLock();

      // Too many requests
      if (isApiLimitReached(error)) {
        if (this.throttleDelayTotal < this.throttleDelayUnity * 4)
          this.throttleDelayTotal += this.throttleDelayUnity;

        await this.handleRequestsThrottle();

        await job.retry();
      } else {
        await job.moveToFailed({
          message,
        });

        throw error;
      }
    }
  }
}
