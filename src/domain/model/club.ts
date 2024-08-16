import { Slot } from './slot';

export interface ClubLocation {
  name: string;
  city: string;
  lat: string;
  lng: string;
}

export interface ClubCountry {
  id: number;
  name: string;
  iso_code: string;
}

export interface ClubZone {
  id: number;
  name: string;
  full_name: string;
  placeid: string;
  country: ClubCountry;
}

export interface ClubProps {
  sponsor: boolean;
  favorite: boolean;
  stars: string;
  payment: boolean;
}

export type ClubAttributes = string[];

export interface ClubOpenHour {
  day_of_week: number;
  open_time: number;
  close_time: number;
  open: boolean;
}

export interface Club {
  id: number;
  permalink: string;
  name: string;
  logo: string;
  logo_url: string;
  background: string;
  background_url: string;
  location: Location;
  zone: ClubZone;
  props: ClubProps;
  attributes: ClubAttributes;
  openHours: ClubOpenHour[];
  _priority: number;
  available: Slot[];
}
