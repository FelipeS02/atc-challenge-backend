import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetZonesQuery } from '../commands/get-zones.query';
import { getCachedZones } from '../helpers/get-cached-info';
import { Zone } from '../model/zone';
import {
  ALQUILA_TU_CANCHA_CLIENT,
  IAlquilaTuCanchaClient,
} from '../ports/aquila-tu-cancha.client';

@QueryHandler(GetZonesQuery)
export class GetZonesHandler implements IQueryHandler<GetZonesQuery> {
  constructor(
    @Inject(ALQUILA_TU_CANCHA_CLIENT)
    private client: IAlquilaTuCanchaClient,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async execute(): Promise<Zone[]> {
    try {
      const zones = await getCachedZones(this.cacheService, this.client);

      return zones;
    } catch {
      return [];
    }
  }
}
