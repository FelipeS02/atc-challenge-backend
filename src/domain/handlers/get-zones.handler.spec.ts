import { Cache } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';

import { getCachedZones } from '../helpers/get-cached-info';
import {
  ALQUILA_TU_CANCHA_CLIENT,
  FakeAlquilaTuCanchaClient,
} from '../ports/aquila-tu-cancha.client';
import { GetZonesHandler } from './get-zones.handler';

jest.mock('../helpers/get-cached-info');

describe('GetZonesHandler', () => {
  let handler: GetZonesHandler;
  let client: FakeAlquilaTuCanchaClient;
  let cacheService: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetZonesHandler,
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

    handler = module.get<GetZonesHandler>(GetZonesHandler);
    client = module.get<FakeAlquilaTuCanchaClient>(ALQUILA_TU_CANCHA_CLIENT);
    cacheService = module.get<Cache>(Cache);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns zones successfully', async () => {
    const expectedZones = [{ id: 1, name: 'Zone 1' }];
    (getCachedZones as jest.Mock).mockResolvedValue(expectedZones);

    const response = await handler.execute();

    expect(response).toEqual(expectedZones);
    expect(getCachedZones).toHaveBeenCalledWith(cacheService, client);
  });

  it('returns an empty array if an error occurs', async () => {
    (getCachedZones as jest.Mock).mockRejectedValue(new Error('Error'));

    const response = await handler.execute();

    expect(response).toEqual([]);
    expect(getCachedZones).toHaveBeenCalledWith(cacheService, client);
  });
});
