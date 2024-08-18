import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SlotCanceledEvent } from 'src/domain/events/slot-cancelled.event';

import { getSlotCanceledFlagKey } from '../../helpers/cache-keys';

@EventsHandler(SlotCanceledEvent)
export class SlotCanceledHandler implements IEventHandler<SlotCanceledEvent> {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  async handle(e: SlotCanceledEvent) {
    if (!e.slot) return;

    await this.cacheService.set(
      getSlotCanceledFlagKey(
        e.clubId,
        e.courtId,
        e.slot.datetime.substring(0, 11),
      ),
      e.slot,
    );
  }
}
