import { Cache } from '@nestjs/cache-manager';
import { format, isBefore, isEqual } from 'date-fns';

import { DATE_FORMAT } from '../../infrastructure/constants/date';
import { Club } from '../model/club';
import { Court } from '../model/court';
import { Slot } from '../model/slot';
import { Zone } from '../model/zone';
import { IAlquilaTuCanchaClient } from '../ports/aquila-tu-cancha.client';
import {
  getClubAttrFlagKey,
  getClubDisponibilityFlagKey,
  getClubsByZoneCacheKey,
  getCourtAttrFlagKey,
  getCourtsCacheKey,
  getSlotBookedFlagKey,
  getSlotCacheKey,
  getSlotCanceledFlagKey,
  getZonesCacheKey,
} from './cache-keys';
import { parseSlotDatetime } from './date';
import { insertIntoSlotsList } from './slots';

export const getCachedClubs = async (
  placeId: string,
  cacheService: Cache,
  client: IAlquilaTuCanchaClient,
): Promise<Club[]> => {
  const cacheKey = getClubsByZoneCacheKey(placeId);
  const cachedClubs = await cacheService.get<Club[]>(cacheKey);

  if (cachedClubs) {
    // Clubs en caché
    const updatedCachedClubs = await Promise.all(
      cachedClubs.map(async (c) => {
        // Verificar si los datos se actualizaron en los eventos
        const isClubUpdated = await cacheService.get(getClubAttrFlagKey(c.id));
        if (!isClubUpdated) return c;

        // Si se actualizó, obtener los nuevos datos
        return await client.getClubById(c.id);
      }),
    );

    // Actualizar info en el caché
    await cacheService.set(cacheKey, updatedCachedClubs);

    return updatedCachedClubs;
  }

  const newClubs = await client.getClubs(placeId);

  if (newClubs) await cacheService.set(cacheKey, newClubs);

  return newClubs;
};

export const getCachedCourts = async (
  clubId: Club['id'],
  cacheService: Cache,
  client: IAlquilaTuCanchaClient,
): Promise<Court[]> => {
  const cacheKey = getCourtsCacheKey(clubId);
  const cachedCourts = await cacheService.get<Court[]>(cacheKey);

  if (cachedCourts) {
    const updatedCacheCourts = await Promise.all(
      cachedCourts.map(async (c) => {
        const isCourtUpdated = getCourtAttrFlagKey(clubId, c.id);

        if (!isCourtUpdated) return c;

        return await client.getCourtById(clubId, c.id);
      }),
    );

    await cacheService.set(cacheKey, updatedCacheCourts);

    return updatedCacheCourts;
  }

  const newCourts = await client.getCourts(clubId);

  if (newCourts) await cacheService.set(cacheKey, newCourts);

  return newCourts;
};

export const getCachedSlots = async (
  clubId: Club['id'],
  courtId: Court['id'],
  date: Date,
  cacheService: Cache,
  client: IAlquilaTuCanchaClient,
): Promise<Slot[]> => {
  const isClubDisponibilityChanged = getClubDisponibilityFlagKey(clubId);
  const cacheKey = getSlotCacheKey(clubId, courtId, date);

  if (!isClubDisponibilityChanged) {
    let cachedSlots = await cacheService.get<Slot[]>(cacheKey);

    if (cachedSlots) {
      const formatedDate = format(date, DATE_FORMAT);

      const bookedSlot = await cacheService.get<Slot>(
        getSlotBookedFlagKey(clubId, courtId, formatedDate),
      );

      const availableSlot = await cacheService.get<Slot>(
        getSlotCanceledFlagKey(clubId, courtId, formatedDate),
      );

      if (bookedSlot) {
        cachedSlots = cachedSlots.filter(
          (s) =>
            !isEqual(
              parseSlotDatetime(s.datetime),
              parseSlotDatetime(bookedSlot.datetime),
            ),
        );
      }

      if (availableSlot) {
        const indexToInsert = cachedSlots.findIndex((s) =>
          isBefore(
            parseSlotDatetime(availableSlot.datetime),
            parseSlotDatetime(s.datetime),
          ),
        );

        if (indexToInsert !== -1) {
          cachedSlots = insertIntoSlotsList(
            availableSlot,
            indexToInsert,
            cachedSlots,
          );
        }
      }

      await cacheService.set(cacheKey, cachedSlots);

      return cachedSlots;
    }
  }

  const newSlots = await client.getAvailableSlots(clubId, courtId, date);

  if (newSlots) await cacheService.set(cacheKey, newSlots);

  return newSlots;
};

export const getCachedZones = async (
  cacheService: Cache,
  client: IAlquilaTuCanchaClient,
) => {
  const cacheKey = getZonesCacheKey();
  const cachedZones = await cacheService.get<Zone[]>(cacheKey);

  if (cachedZones) return cachedZones;

  const newZones = await client.getZones();

  await cacheService.set(cacheKey, newZones);

  return newZones;
};
