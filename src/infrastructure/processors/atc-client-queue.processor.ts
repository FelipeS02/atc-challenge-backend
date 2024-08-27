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
  private readonly logger = new Logger(ApiRequestProcessor.name);

  constructor(
    @InjectQueue(ATC_CLIENT_QUEUE) private readonly queue: Queue<AtcClientJob>,
    private readonly httpService: HttpService,
  ) {
    this.queue.on('stalled', (job: Job) =>
      this.logger.warn(`[${job.id}] STALLED`),
    );
  }

  @Process(ATC_CLIENT_JOB)
  async handleApiCall(job: Job<AtcClientJob>) {
    const { endpoint, params, method } = job.data;
    try {
      this.logger.log(`[${job.id}] Executing - attemp ${job.attemptsMade + 1}`);

      const response = await this.httpService.axiosRef(endpoint, {
        params,
        method,
      });

      this.logger.log(`[${job.id}] Completed`);

      return response.data;
    } catch (error) {
      const { message = 'Unknown error' } = error as AxiosError;

      await job.releaseLock();

      // Too many requests
      if (isApiLimitReached(error)) {
        this.logger.log(`[${job.id}] Retrying`);
        return await job.retry();
      } else {
        await job.moveToFailed({
          message,
        });

        throw error;
      }
    }
  }
}
