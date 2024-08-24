import { auth } from "googleapis/build/src/apis/abusiveexperiencereport/index.js";
import { authorize } from "./google-oauth.js";
import { consildatedEventList } from "./GoogleCalendarService.js";
import { Booking } from "./Booking.js";
import { AvailibilityService } from "./AvailabilityService.js";
import { IAvailabilityService } from './IAvailabilityService.js';
import { Schedule } from "./Schedule.js";


export class SchedulerService {
  constructor(private availabilityService: IAvailabilityService) {

  }

  async getSchedule(): Promise<Schedule> {
    const externalBookings = await this.getBookings();
    const availability = await this.availabilityService.getAvailability();
    const schedule = new Schedule();

    if(!externalBookings) {
      throw new Error('Failed to fetch external bookings');
    }
    
    schedule.Availability = availability;
    schedule.Bookings = [ ...externalBookings ];

    return schedule;
  }

  private async getBookings(): Promise<Booking[] | undefined> {
    const auth = await authorize();

    if(!auth) {
      console.log('authorization failed');
      return;
    }

    const events = await consildatedEventList(auth);
    
    return events.map((event) => {
      const { summary, start, end } = event;

      return new Booking(summary, start.dateTime, end.dateTime);
    })
  }
}