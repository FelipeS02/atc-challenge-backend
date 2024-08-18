import { Cache } from '@nestjs/cache-manager';

import { Club } from '../model/club';
import { Court } from '../model/court';
import { Slot } from '../model/slot';
import { AlquilaTuCanchaClient } from '../ports/aquila-tu-cancha.client';
import {
  getClubsByZoneCacheKey,
  getCourtsCacheKey,
  getSlotCacheKey,
} from './cache-keys';

export const getCachedClubs = async (
  placeId: string,
  cacheService: Cache,
  client: AlquilaTuCanchaClient,
): Promise<Club[]> => {
  const cacheKey = getClubsByZoneCacheKey(placeId);
  const cachedClubs = await cacheService.get<Club[]>(cacheKey);

  if (cachedClubs) return cachedClubs;

  const newClubs = await client.getClubs(placeId);

  if (newClubs) await cacheService.set(cacheKey, newClubs);

  return newClubs;
};

export const getCachedCourts = async (
  clubId: Club['id'],
  cacheService: Cache,
  client: AlquilaTuCanchaClient,
): Promise<Court[]> => {
  const cacheKey = getCourtsCacheKey(clubId);
  const cachedCourts = await cacheService.get<Court[]>(cacheKey);

  if (cachedCourts) return cachedCourts;

  const newCourts = await client.getCourts(clubId);

  if (newCourts) await cacheService.set(cacheKey, newCourts);

  return newCourts;
};

export const getCachedSlots = async (
  clubId: Club['id'],
  courtId: Court['id'],
  date: Date,
  cacheService: Cache,
  client: AlquilaTuCanchaClient,
): Promise<Slot[]> => {
  const cacheKey = getSlotCacheKey(clubId, courtId, date);
  const cachedSlots = await cacheService.get<Slot[]>(cacheKey);

  if (cachedSlots) return cachedSlots;

  const newSlots = await client.getAvailableSlots(clubId, courtId, date);

  if (newSlots) await cacheService.set(cacheKey, newSlots);

  return newSlots;
};
