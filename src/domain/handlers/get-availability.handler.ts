import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  ClubWithAvailability,
  GetAvailabilityQuery,
} from '../commands/get-availaiblity.query';
import {
  ALQUILA_TU_CANCHA_CLIENT,
  AlquilaTuCanchaClient,
} from '../ports/aquila-tu-cancha.client';

@QueryHandler(GetAvailabilityQuery)
export class GetAvailabilityHandler
  implements IQueryHandler<GetAvailabilityQuery>
{
  constructor(
    @Inject(ALQUILA_TU_CANCHA_CLIENT)
    private alquilaTuCanchaClient: AlquilaTuCanchaClient,
  ) {}

  async execute(query: GetAvailabilityQuery): Promise<ClubWithAvailability[]> {
    // Get clubs by zone
    const clubs = await this.alquilaTuCanchaClient.getClubs(query.placeId);

    const clubsWithAvailability = await Promise.all(
      clubs.map(async (club) => {
        // Get courts static info
        const courts = await this.alquilaTuCanchaClient.getCourts(club.id);

        //#region Get courts with available time slots
        const courtsWithAvailability = await Promise.all(
          courts.map(async (court) => {
            const slots = await this.alquilaTuCanchaClient.getAvailableSlots(
              club.id,
              court.id,
              query.date,
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

    return clubsWithAvailability;
  }
}
