import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { formatDate } from 'date-fns';

import { Club } from '../../domain/model/club';
import { Court } from '../../domain/model/court';
import { Slot } from '../../domain/model/slot';
import { Zone } from '../../domain/model/zone';
import { IAlquilaTuCanchaClient } from '../../domain/ports/aquila-tu-cancha.client';
import { DATE_FORMAT } from '../constants/date';
import { GET } from '../constants/petitions';

@Injectable()
export class HTTPAlquilaTuCanchaClient implements IAlquilaTuCanchaClient {
  private base_url: string;
  private api: HttpService['axiosRef'];

  constructor(
    private httpService: HttpService,
    config: ConfigService,
    @InjectQueue('apiRequests') private readonly apiQueue: Queue,
  ) {
    this.base_url = config.get<string>('ATC_BASE_URL', 'http://localhost:4000');

    this.httpService.axiosRef.defaults.baseURL = this.base_url;

    this.api = this.httpService.axiosRef;
  }

  async getClubs(placeId: string): Promise<Club[]> {
    try {
      const job = await this.apiQueue.add('api-call', {
        endpoint: `${this.base_url}/clubs`,
        params: { placeId },
        method: GET,
      });

      const clubs = await job.finished();

      return clubs;
    } catch (error) {
      console.log('error: ', error);
      const errRes: Club[] = [];
      return errRes;
    }
  }

  async getCourts(clubId: number): Promise<Court[]> {
    console.log('entre 2');
    const job = await this.apiQueue.add('api-call', {
      endpoint: `${this.base_url}/clubs/${clubId}/courts`,
      params: { clubId },
      method: GET,
    });

    const courts = await job.finished();

    return courts;
  }

  async getAvailableSlots(
    clubId: number,
    courtId: number,
    date: Date,
  ): Promise<Slot[]> {
    console.log('entre 3');
    const job = await this.apiQueue.add('api-call', {
      endpoint: `${this.base_url}/clubs/${clubId}/courts/${courtId}/slots`,
      params: { date: formatDate(date, DATE_FORMAT) },
      method: GET,
    });

    // const { data: slots } = await this.api.get<Slot[]>(
    //   `/clubs/${clubId}/courts/${courtId}/slots`,
    //   {
    //     params: { date: formatDate(date, DATE_FORMAT) },
    //   },
    // );

    const slots = await job.finished();

    return slots;
  }

  async getClubById(clubId: number): Promise<Club> {
    const { data: club } = await this.api.get<Club>(`/clubs/${clubId}`);

    return club;
  }

  async getCourtById(clubId: number, courtId: number): Promise<Court> {
    const { data: court } = await this.api.get<Court>(
      `/clubs/${clubId}/courts/${courtId}`,
    );

    return court;
  }

  async getZones(): Promise<Zone[]> {
    const { data: zones } = await this.api.get<Zone[]>('/zones');

    return zones;
  }
}
