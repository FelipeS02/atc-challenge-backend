import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SlotCanceledEvent } from 'src/domain/events/slot-cancelled.event';

@EventsHandler(SlotCanceledEvent)
export class SlotCanceledHandler implements IEventHandler<SlotCanceledEvent> {
  private readonly logger = new Logger(SlotCanceledHandler.name);

  handle(event: SlotCanceledEvent) {
    this.logger.log(`Club ${event.clubId} updated`);
  }
}
