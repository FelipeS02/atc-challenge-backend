import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CourtUpdatedEvent } from 'src/domain/events/court-updated.event';

@EventsHandler(CourtUpdatedEvent)
export class CourtUpdatedHandler implements IEventHandler<CourtUpdatedEvent> {
  private readonly logger = new Logger(CourtUpdatedHandler.name);

  handle(event: CourtUpdatedEvent) {
    this.logger.log(`Club ${event.clubId} updated`);
  }
}
