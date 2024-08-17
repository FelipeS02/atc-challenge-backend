import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { formatDate } from 'date-fns';

import { Club } from '../../domain/model/club';
import { Court } from '../../domain/model/court';
import { Slot } from '../../domain/model/slot';
import { AlquilaTuCanchaClient } from '../../domain/ports/aquila-tu-cancha.client';
import {
  getClubCacheKey,
  getCourtsCacheKey,
  getSlotCacheKey,
} from '../constants/cacheKeys';
import { DATE_FORMAT } from '../constants/date';

@Injectable()
export class HTTPAlquilaTuCanchaClient implements AlquilaTuCanchaClient {
  private base_url: string;
  private api: HttpService['axiosRef'];

  constructor(
    private httpService: HttpService,
    config: ConfigService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {
    this.base_url = config.get<string>('ATC_BASE_URL', 'http://localhost:4000');

    this.httpService.axiosRef.defaults.baseURL = this.base_url;

    this.api = this.httpService.axiosRef;
  }

  async getClubs(placeId: string): Promise<Club[]> {
    const cacheKey = getClubCacheKey(placeId);
    //#region Cache data
    // Check if place´s clubs are stored
    const cachedClubs = await this.cacheService.get<Club[]>(cacheKey);

    if (cachedClubs) return cachedClubs;
    //#endregion

    //#region New data from API management
    // Get clubs from API
    const { data: clubs } = await this.api.get<Club[]>('clubs', {
      params: { placeId },
    });

    if (!clubs) return [];

    // If valid stores it in cache service and return
    await this.cacheService.set(cacheKey, clubs);

    return clubs;
    //#endregion
  }

  async getCourts(clubId: number): Promise<Court[]> {
    const cacheKey = getCourtsCacheKey(clubId);

    //#region Cache Data
    const cachedCourts = await this.cacheService.get<Court[]>(cacheKey);

    if (cachedCourts) return cachedCourts;
    //#endregion

    //#region New data from API management
    const { data: courts } = await this.api.get(`/clubs/${clubId}/courts`);

    if (!courts) return [];

    await this.cacheService.set(cacheKey, courts);

    return courts;
    //#endregion
  }

  async getAvailableSlots(
    clubId: number,
    courtId: number,
    date: Date,
  ): Promise<Slot[]> {
    const cacheKey = getSlotCacheKey(clubId, courtId);

    //#region Cache data
    const cachedSlots = await this.cacheService.get<Slot[]>(cacheKey);
    if (cachedSlots) return cachedSlots;
    //#endregion

    //#region New data from API management
    const { data: slots } = await this.api.get<Slot[]>(
      `/clubs/${clubId}/courts/${courtId}/slots`,
      {
        params: { date: formatDate(date, DATE_FORMAT) },
      },
    );

    if (!slots) return [];

    this.cacheService.set(cacheKey, slots);

    return slots;
  }
}
