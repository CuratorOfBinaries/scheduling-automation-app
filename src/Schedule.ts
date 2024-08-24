import { TimeBlock } from './TimeBlock.js';
import { Booking } from "./Booking.js";

export class Schedule {
    public Availability: { [key: string]: TimeBlock[] } = {};
    public Bookings: Booking[] = [];
}