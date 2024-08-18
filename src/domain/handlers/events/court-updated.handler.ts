import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CourtUpdatedEvent } from 'src/domain/events/court-updated.event';

import { getCourtAttrFlagKey } from '../../helpers/cache-keys';

@EventsHandler(CourtUpdatedEvent)
export class CourtUpdatedHandler implements IEventHandler<CourtUpdatedEvent> {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async handle(e: CourtUpdatedEvent) {
    if (e.fields)
      await this.cacheService.set(
        getCourtAttrFlagKey(e.clubId, e.courtId),
        true,
      );
  }
}
