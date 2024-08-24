import { IAvailabilityService } from './IAvailabilityService.js';
import { SchedulerService } from './SchedulerService.js';
import { Schedule } from './Schedule.js';
import { Booking } from './Booking.js';
import * as googleauth from './google-oauth.js';
import * as GoogleCalendarService from './GoogleCalendarService.js';
import { OAuth2Client } from 'google-auth-library';
import { TimeBlock } from './TimeBlock.js';
import { Event } from './Event.js';

function generateMockEvent(start: string, end: string, summary: string): Event {
  return  {
    id: "event123",
    status: "confirmed",
    htmlLink: "https://example.com/event123",
    created: "2023-10-01T12:00:00Z",
    updated: "2023-10-01T12:00:00Z",
    summary: summary,
    description: "This is a sample event description.",
    location: "123 Sample Street, Sample City, SC 12345",
    creator: {
      email: "creator@example.com",
      displayName: "Event Creator",
    },
    organizer: {
      email: "organizer@example.com",
      displayName: "Event Organizer",
    },
    start: {
      dateTime: start,
      timeZone: "UTC",
    },
    end: {
      dateTime: end,
      timeZone: "UTC",
    },
    transparency: "opaque",
    visibility: "default",
    iCalUID: "icaluid123",
    sequence: 0,
    attendees: [
      {
        email: "attendee1@example.com",
        displayName: "Attendee One",
        responseStatus: "accepted",
      },
      {
        email: "attendee2@example.com",
        displayName: "Attendee Two",
        responseStatus: "declined",
      },
    ],
    guestsCanInviteOthers: true,
    reminders: {
      useDefault: true,
    },
    source: {
      url: "https://example.com/source",
      title: "Event Source",
    },
    eventType: "default",
  } as unknown as Event;
}


describe('SchedulerService', () => {
  let availabilityService: IAvailabilityService = {
    getAvailability: jest.fn(),
    configureAvailability: jest.fn(),
  };
  let schedulerService: SchedulerService;

  beforeEach(() => {
    availabilityService = {
      getAvailability: jest.fn(),
      configureAvailability: jest.fn(),
    };
    schedulerService = new SchedulerService(availabilityService);
  });

  describe('getSchedule', () => {
    it('should return the schedule with availability and external bookings', async () => {
      const externalBookings: Booking[] = [
        new Booking('Meeting 1', '2022-01-01T09:00:00', '2022-01-01T10:00:00'),
        new Booking('Meeting 2', '2022-01-02T14:00:00', '2022-01-02T15:00:00'),
      ];

      // Mock availability
      const timeBlocks = [new TimeBlock('09:00', '17:00')];
      (availabilityService.getAvailability as jest.Mock).mockResolvedValue({
        mon: timeBlocks,
        tue: timeBlocks,
      });

      jest.spyOn(googleauth, 'authorize').mockResolvedValue(new OAuth2Client());

      // create a spyon for the consildatedEventList function that returns events that have matching values in the expected bookings above
      jest.spyOn(GoogleCalendarService, 'consildatedEventList').mockResolvedValue([
        generateMockEvent('2022-01-01T09:00:00', '2022-01-01T10:00:00', "Meeting 1"),
        generateMockEvent('2022-01-02T14:00:00', '2022-01-02T15:00:00', "Meeting 2"),
      ]);

      // Expected schedule
      const expectedSchedule: Schedule = {
        Availability: {
          mon: timeBlocks,
          tue: timeBlocks,
        },
        Bookings: externalBookings,
      };

      const schedule = await schedulerService.getSchedule();

      expect(schedule).toEqual(expectedSchedule);
    });

    it('should throw an error when failed to fetch external bookings', async () => {
      jest.spyOn(googleauth, 'authorize').mockResolvedValue(null);

      // Call getSchedule method and expect it to throw an error
      await expect(schedulerService.getSchedule()).rejects.toThrow('Failed to fetch external bookings');
    });
  });
});