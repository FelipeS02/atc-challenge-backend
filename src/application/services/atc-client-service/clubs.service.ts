import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  ALQUILA_TU_CANCHA_CLIENT,
  IAlquilaTuCanchaClient,
} from '../../../infrastructure/interfaces/aquila-tu-cancha.client';
import { Club } from '../../../infrastructure/models/club';
import {
  getClubAttrFlagKey,
  getClubsByZoneCacheKey,
} from '../../helpers/cache-keys';

@Injectable()
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(ALQUILA_TU_CANCHA_CLIENT)
    private readonly client: IAlquilaTuCanchaClient,
  ) {}

  async getCachedClubs(placeId: string) {
    const cacheKey = getClubsByZoneCacheKey(placeId);
    const cachedClubs = await this.cacheService.get<Club[]>(cacheKey);

    if (cachedClubs) {
      // Clubs en caché
      const updatedCachedClubs = await Promise.all(
        cachedClubs.map(async (c) => {
          const clubUpdatedFlagKey = getClubAttrFlagKey(c.id);
          // Verificar si los datos se actualizaron en los eventos
          const isClubUpdated = await this.cacheService.get(clubUpdatedFlagKey);

          if (!isClubUpdated) return c;

          this.logger.verbose(`Updating club ${c.id}`);

          const newClubInfo = await this.client.getClubById(c.id);

          if (!newClubInfo) return c;

          await this.cacheService.del(clubUpdatedFlagKey);

          // Si se actualizó, obtener los nuevos datos
          return newClubInfo;
        }),
      );

      // Actualizar info en el caché
      await this.cacheService.set(cacheKey, updatedCachedClubs, 10 * 1000);

      return updatedCachedClubs;
    }

    const newClubs = await this.client.getClubs(placeId);

    if (!newClubs) throw new Error('Hubo un error al obtener los clubs');

    await this.cacheService.set(cacheKey, newClubs);

    return newClubs;
  }
}
