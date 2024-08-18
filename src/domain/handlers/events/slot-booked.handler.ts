import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SlotBookedEvent } from 'src/domain/events/slot-booked.event';

@EventsHandler(SlotBookedEvent)
export class SlotBookedHandler implements IEventHandler<SlotBookedEvent> {
  private readonly logger = new Logger(SlotBookedHandler.name);

  handle(event: SlotBookedEvent) {
    this.logger.log(`Club ${event.clubId} updated`);
  }
}
