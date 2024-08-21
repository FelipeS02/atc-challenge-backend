import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { format } from 'date-fns';

import { DATE_FORMAT } from '../../infrastructure/constants/date';
import {
  ClubWithAvailability,
  GetAvailabilityQuery,
} from '../commands/get-availaiblity.query';
import { getFallbackClubsKey } from '../helpers/cache-keys';
import {
  getCachedClubs,
  getCachedCourts,
  getCachedSlots,
} from '../helpers/get-cached-info';
import {
  ALQUILA_TU_CANCHA_CLIENT,
  IAlquilaTuCanchaClient,
} from '../ports/aquila-tu-cancha.client';

@QueryHandler(GetAvailabilityQuery)
export class GetAvailabilityHandler
  implements IQueryHandler<GetAvailabilityQuery>
{
  constructor(
    @Inject(ALQUILA_TU_CANCHA_CLIENT)
    private client: IAlquilaTuCanchaClient,
    @Inject(CACHE_MANAGER)
    private cacheService: Cache,
  ) {}

  async execute(query: GetAvailabilityQuery): Promise<ClubWithAvailability[]> {
    const fallbackKey = getFallbackClubsKey(
      query.placeId,
      format(query.date, DATE_FORMAT),
    );
    try {
      // Get clubs by zone
      const clubs = await getCachedClubs(
        query.placeId,
        this.cacheService,
        this.client,
      );

      if (!clubs) return [];

      const clubsWithAvailability = await Promise.all(
        clubs.map(async (club) => {
          // Get courts static info
          const courts = await getCachedCourts(
            club.id,
            this.cacheService,
            this.client,
          );

          if (!courts) return { ...club, courts: [] };

          //#region Get courts with available time slots
          const courtsWithAvailability = await Promise.all(
            courts.map(async (court) => {
              const slots = await getCachedSlots(
                club.id,
                court.id,
                query.date,
                this.cacheService,
                this.client,
              );

              return {
                ...court,
                available: slots,
              };
            }),
          );
          //#endregion

          return {
            ...club,
            courts: courtsWithAvailability,
          };
        }),
      );

      // Stores fallback response in case of error
      await this.cacheService.set(
        fallbackKey,
        clubsWithAvailability,
        60 * 1000,
      );

      return clubsWithAvailability;
    } catch (error) {
      console.log(error);

      // Return of cached response if exists
      const fallbackClubs = await this.cacheService.get<ClubWithAvailability[]>(
        fallbackKey,
      );

      if (fallbackClubs) return fallbackClubs;

      return [];
    }
  }
}
