export const getClubCacheKey = (placeId: string) => `zone[${placeId}]-clubs`;

export const getCourtsCacheKey = (clubId: number) => `club[${clubId}]-courts`;

export const getSlotCacheKey = (clubId: number, courtId: number) =>
  `club[${clubId}]-court[${courtId}]-slots`;
