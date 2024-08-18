import { format } from 'date-fns';
import { DATE_FORMAT } from 'src/infrastructure/constants/date';

export const getClubsByZoneCacheKey = (placeId: string) =>
  `zone[${placeId}]-clubs`;

export const getCourtsCacheKey = (clubId: number) => `club[${clubId}]-courts`;

export const getSlotCacheKey = (clubId: number, courtId: number, date: Date) =>
  `club[${clubId}]-court[${courtId}]-date[${format(date, DATE_FORMAT)}]-slots`;
