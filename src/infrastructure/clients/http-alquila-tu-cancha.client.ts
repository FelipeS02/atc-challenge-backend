import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatDate } from 'date-fns';

import { Club } from '../../domain/model/club';
import { Court } from '../../domain/model/court';
import { Slot } from '../../domain/model/slot';
import { AlquilaTuCanchaClient } from '../../domain/ports/aquila-tu-cancha.client';

@Injectable()
export class HTTPAlquilaTuCanchaClient implements AlquilaTuCanchaClient {
  private base_url: string;
  private api: HttpService['axiosRef'];
  constructor(private httpService: HttpService, config: ConfigService) {
    this.base_url = config.get<string>('ATC_BASE_URL', 'http://localhost:4000');

    this.httpService.axiosRef.defaults.baseURL = this.base_url;

    this.api = this.httpService.axiosRef;
  }

  async getClubs(placeId: string): Promise<Club[]> {
    const { data: clubs } = await this.api.get<Club[]>('clubs', {
      params: { placeId },
    });

    if (!clubs) return [];

    return clubs;
  }

  async getCourts(clubId: number): Promise<Court[]> {
    const { data: courts } = await this.api.get(`/clubs/${clubId}/courts`);

    if (!courts) return [];

    return courts;
  }

  async getAvailableSlots(
    clubId: number,
    courtId: number,
    date: Date,
  ): Promise<Slot[]> {
    const { data: slots } = await this.api.get<Slot[]>(
      `/clubs/${clubId}/courts/${courtId}/slots`,
      {
        params: { date: formatDate(date, 'YYYY-MM-DD') },
      },
    );

    if (!slots) return [];

    return slots;
  }
}
