// import { ClubUpdatedEvent } from '../domain/events/club-updated.event';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { ClubUpdatedEvent } from '../../../domain/events/club-updated.event';
import {
  getClubAttrFlagKey,
  getClubDisponibilityFlagKey,
} from '../../../domain/helpers/cache-keys';

@EventsHandler(ClubUpdatedEvent)
export class ClubUpdatedHandler implements IEventHandler<ClubUpdatedEvent> {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async handle(e: ClubUpdatedEvent) {
    let isOpenHoursChanged = false;
    let isStaticAttrChanged = false;

    if (!e.fields) return;

    e.fields.forEach((f) => {
      if (f === 'openhours') {
        isOpenHoursChanged = true;
        return;
      }
      isStaticAttrChanged = true;
    });

    if (isOpenHoursChanged)
      await this.cacheService.set(getClubDisponibilityFlagKey(e.clubId), true);

    if (isStaticAttrChanged)
      await this.cacheService.set(getClubAttrFlagKey(e.clubId), true);
  }
}
