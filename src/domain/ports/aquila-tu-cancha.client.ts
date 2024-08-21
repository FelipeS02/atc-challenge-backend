import { format } from 'date-fns';

import { DATE_FORMAT } from '../../infrastructure/constants/date';
import { Club } from '../model/club';
import { Court } from '../model/court';
import { Slot } from '../model/slot';
import { Zone } from '../model/zone';

export const ALQUILA_TU_CANCHA_CLIENT = 'ALQUILA_TU_CANCHA_CLIENT';
export interface IAlquilaTuCanchaClient {
  getClubs(placeId: string): Promise<Club[]>;
  getCourts(clubId: number): Promise<Court[]>;
  getAvailableSlots(
    clubId: number,
    courtId: number,
    date: Date,
  ): Promise<Slot[]>;
  getClubById(clubId: number): Promise<Club>;
  getCourtById(clubId: number, courtId: number): Promise<Court>;
  getZones(): Promise<Zone[]>;
}

export class FakeAlquilaTuCanchaClient implements IAlquilaTuCanchaClient {
  clubs: Record<string, Club[]> = {};
  courts: Record<string, Court[]> = {};
  slots: Record<string, Slot[]> = {};

  async getClubs(placeId: string): Promise<Club[]> {
    return this.clubs[placeId] || [];
  }
  async getCourts(clubId: number): Promise<Court[]> {
    return this.courts[String(clubId)] || [];
  }
  async getAvailableSlots(
    clubId: number,
    courtId: number,
    date: Date,
  ): Promise<Slot[]> {
    return (
      this.slots[`${clubId}_${courtId}_${format(date, DATE_FORMAT)}`] || []
    );
  }
  async getClubById(clubId: number): Promise<Club> {
    return { id: clubId } as Club;
  }
  async getCourtById(_clubId: number, courtId: number): Promise<Court> {
    return {
      id: courtId,
      name: 'Cancha 1',
      sports: [
        {
          id: 2,
          parent_id: 1,
          name: 'FOOTBALL5',
          players_max: 10,
          order: 0,
          default_duration: 60,
          divisible_duration: 30,
          icon: 'football5.png',
          pivot: {
            court_id: 490,
            sport_id: 2,
            enabled: 1,
          },
        },
      ],
    };
  }
  async getZones(): Promise<Zone[]> {
    return [
      {
        id: 10,
        name: 'La Plata',
        full_name: 'La Plata, Buenos Aires, Argentina',
        placeid: 'ChIJoYUAHyvmopUR4xJzVPBE_Lw',
        country: {
          id: 1,
          name: 'Argentina',
          iso_code: 'ar',
        },
      },
    ];
  }
}
