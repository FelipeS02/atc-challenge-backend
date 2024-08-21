import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { ClubUpdatedHandler } from '../domain/handlers/events/club-updated.handler';
import { CourtUpdatedHandler } from '../domain/handlers/events/court-updated.handler';
import { SlotBookedHandler } from '../domain/handlers/events/slot-booked.handler';
import { SlotCanceledHandler } from '../domain/handlers/events/slot-canceled.handler';
import { GetAvailabilityHandler } from '../domain/handlers/get-availability.handler';
import { GetZonesHandler } from '../domain/handlers/get-zones.handler';
import { ALQUILA_TU_CANCHA_CLIENT } from '../domain/ports/aquila-tu-cancha.client';
import { HTTPAlquilaTuCanchaClient } from '../infrastructure/clients/http-alquila-tu-cancha.client';
import { EventsController } from '../infrastructure/controllers/events.controller';
import { SearchController } from '../infrastructure/controllers/search.controller';
import { ZonesController } from '../infrastructure/controllers/zones.controller';

@Module({
  imports: [
    HttpModule,
    CqrsModule,
    ConfigModule.forRoot(),
    CacheModule.register({ isGlobal: true }),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      }),
    }),
    BullModule.registerQueueAsync({ name: 'apiRequests' }),
  ],
  controllers: [SearchController, EventsController, ZonesController],
  providers: [
    {
      provide: ALQUILA_TU_CANCHA_CLIENT,
      useClass: HTTPAlquilaTuCanchaClient,
    },
    GetAvailabilityHandler,
    ClubUpdatedHandler,
    CourtUpdatedHandler,
    SlotBookedHandler,
    SlotCanceledHandler,
    GetZonesHandler,
  ],
})
export class AppModule {}
