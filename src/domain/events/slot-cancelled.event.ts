import { Slot } from '../model/slot';

export class SlotCanceledEvent {
  constructor(
    public clubId: number,
    public courtId: number,
    public slot: Slot,
  ) {}
}
