import { HttpService } from '@nestjs/axios';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { Job, Queue } from 'bull';

import { TOO_MANY_REQUESTS_CODE } from '../constants/petitions';

@Injectable()
@Processor('apiRequests')
export class ApiRequestProcessor {
  private isThrottled = false;
  private throttleDelay = 60000;

  constructor(
    private readonly httpService: HttpService,
    @InjectQueue('apiRequests') private readonly apiQueue: Queue,
  ) {}

  // Timeout to continue when API reached its request limit
  async handleRequestsThrottle() {
    await new Promise((resolve) => setTimeout(resolve, this.throttleDelay));
  }

  @Process('api-call')
  async handleApiCall(
    job: Job<{ endpoint: string; params: any; method: any }>,
  ) {
    console.log('PEDIIIILO');
    try {
      if (this.isThrottled) {
        await this.handleRequestsThrottle();
      }

      const { endpoint, params, method } = job.data;

      const response = await this.httpService.axiosRef(endpoint, {
        params,
        method,
      });

      this.isThrottled = false;

      return response.data;
    } catch (error) {
      // Too many requests
      console.log('error:; ', error);
      if (
        error instanceof AxiosError &&
        error.response?.status === TOO_MANY_REQUESTS_CODE
      ) {
        this.isThrottled = true;
        await this.handleRequestsThrottle();

        await this.handleApiCall(job);
      } else {
        // Other errors
        throw error;
      }
    }
  }
}
