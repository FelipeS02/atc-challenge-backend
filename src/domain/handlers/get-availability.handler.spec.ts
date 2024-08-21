import { Cache } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { format } from 'date-fns';

import {
  ALQUILA_TU_CANCHA_CLIENT,
  IAlquilaTuCanchaClient,
  FakeAlquilaTuCanchaClient,
} from '../../domain/ports/aquila-tu-cancha.client';
import { DATE_FORMAT } from '../../infrastructure/constants/date';
import { GetAvailabilityQuery } from '../commands/get-availaiblity.query';
import { getFallbackClubsKey } from '../helpers/cache-keys';
import { GetAvailabilityHandler } from './get-availability.handler';

describe('GetAvailabilityHandler', () => {
  let handler: GetAvailabilityHandler;
  let client: FakeAlquilaTuCanchaClient;
  let cacheService: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAvailabilityHandler,
        {
          provide: ALQUILA_TU_CANCHA_CLIENT,
          useClass: FakeAlquilaTuCanchaClient,
        },
        {
          provide: Cache,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetAvailabilityHandler>(GetAvailabilityHandler);
    client = module.get<IAlquilaTuCanchaClient>(IAlquilaTuCanchaClient);
    cacheService = module.get<Cache>(Cache);
  });

  it('returns the availability', async () => {
    client.clubs = {
      '123': [{ id: 1 }],
    };
    client.courts = {
      '1': [{ id: 1 }],
    };
    client.slots = {
      '1_1_2022-12-05': [],
    };
    const placeId = '123';
    const date = new Date('2022-12-05');

    const response = await handler.execute(
      new GetAvailabilityQuery(placeId, date),
    );

    expect(response).toEqual([{ id: 1, courts: [{ id: 1, available: [] }] }]);
    expect(cacheService.set).toHaveBeenCalledWith(
      getFallbackClubsKey(placeId, format(date, DATE_FORMAT)),
      [{ id: 1, courts: [{ id: 1, available: [] }] }],
      60 * 1000,
    );
  });

  it('returns fallback cache on error', async () => {
    const placeId = '123';
    const date = new Date('2022-12-05');
    const fallbackKey = getFallbackClubsKey(placeId, format(date, DATE_FORMAT));
    const fallbackResponse = [{ id: 1, courts: [{ id: 1, available: [] }] }];

    jest.spyOn(client, 'getClubs').mockRejectedValue(new Error('Client error'));
    jest.spyOn(cacheService, 'get').mockResolvedValue(fallbackResponse);

    const response = await handler.execute(
      new GetAvailabilityQuery(placeId, date),
    );

    expect(response).toEqual(fallbackResponse);
    expect(cacheService.get).toHaveBeenCalledWith(fallbackKey);
  });

  it('returns empty array if no clubs are available', async () => {
    client.clubs = {};
    const placeId = '123';
    const date = new Date('2022-12-05');

    const response = await handler.execute(
      new GetAvailabilityQuery(placeId, date),
    );

    expect(response).toEqual([]);
  });
});
