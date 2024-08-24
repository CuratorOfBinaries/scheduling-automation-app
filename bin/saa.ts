#!/usr/bin/env node

import yargs from 'yargs'
import { authorize } from '../src/google-oauth.js';
import { consildatedEventList, listEvents } from '../src/GoogleCalendarService.js';
import { Event } from '../src/Event.js';
import { AvailibilityService } from '../src/AvailabilityService.js';
import { dayCode, TimeBlock } from '../src/TimeBlock.js';
import dotenv from 'dotenv';
import { SchedulerService } from '../src/SchedulerService.js';

dotenv.config();

const dataDirectory = process.env.DATA_DIRECTORY || 'data';
const _availabilityService = new AvailibilityService(`${dataDirectory}/availability.json`);
const _schedulerService = new SchedulerService(_availabilityService);

const parser = yargs(process.argv.slice(2))
  .command('auth', 'Authorize the application', {}, async (argv) => {
      await authorize();
      console.log('authorization complete');
  })
  .command('list', 'List the next 10 events on the user\'s primary calendar', 
    (yargs) => {
      return yargs.option('all', {
        alias: 'a',
        type: 'boolean',
        description: 'List all the events from all the calendars'
      })
    },async (argv) => {
    const auth = await authorize();

    if(!auth) {
      console.log('authorization failed');
      return;
    }

    if(argv.all) {
      const combinedEvents: Event[] = await consildatedEventList(auth);
      const listOfTitles = combinedEvents.map((event) => {
        const { summary, start, end } = event;

        return `${summary} (${start.dateTime} - ${end.dateTime})`;
      });

      console.log(listOfTitles);
      return;
    }

    await listEvents(auth);
  })
  .command('configure', 'Configure the availability of the user', (yargs) => {
    return yargs.option('start', {
      alias: 's',
      type: 'string',
      description: 'The time when availability starts'
    })
    .option('end', {
      alias: 'e',
      type: 'string',
      description: 'The time when availability ends'
    });
  }, (argv) => {
    try {
      const { _, start, end } = argv;
      
      const [, days] = _;

      if(!days || !start || !end) {
        console.log('Please provide all the required options');
        return;
      }
  
      const daysArr = days.toString().split(',');
  
      const timeblock = new TimeBlock(start.toString(), end.toString());
      _availabilityService.configureAvailability(daysArr, [timeblock]);

    } catch(ex : unknown) {
      const error = ex as Error;
      console.log("Failed to parse availability", error.message);
    }
  })
  .command('available', 'List the availability of the user', yargs => {
    return yargs.option('date', {
      alias: 'd',
      type: 'string',
      description: 'The day for which availability is to be checked'
    })
  }, async (argv) => {
    try {
      const timeInterval = parseInt(process.env.TIME_INTERVAL_IN_MINUTES!) || 30;
      const timeIntervalInMilliseconds = timeInterval * 60 * 1000;

      const { date } = argv;

      if(!date) {
        console.log('Please provide the date for which availability is to be checked');
        return;
      }

      const parsedDate = new Date(date);

      const dayFromDayCode = dayCode[parsedDate.getDay()];

      const schedule = await _schedulerService.getSchedule();

      const availability = schedule.Availability[dayFromDayCode];

      if(!availability) {
        console.log(`No availability found for ${parsedDate.toDateString()}`);
        return;
      }

      const bookings = schedule.Bookings.filter((booking) => { 
        const startDate = new Date(booking.start);
        const month = startDate.getMonth();
        const day = startDate.getDate();

        return month === parsedDate.getMonth() && day === parsedDate.getDate();
      }) || [];

      const availableTimeSlots = [];

      const startTime = new Date();
      const availabilityStartTimeArr = availability[0].start.split(':');
      const availabilityStartTimeHour = parseInt(availabilityStartTimeArr[0]);
      const availabilityStartTimeMinute = parseInt(availabilityStartTimeArr[1]);
      startTime.setHours(availabilityStartTimeHour, availabilityStartTimeMinute);
      const startTimeUnix = startTime.getTime();

      const endTime = new Date();
      const availabilityEndTimeArr = availability[0].end.split(':');
      const availabilityEndTimeHour = parseInt(availabilityEndTimeArr[0]);
      const availabilityEndTimeMinute = parseInt(availabilityEndTimeArr[1]);
      endTime.setHours(availabilityEndTimeHour, availabilityEndTimeMinute);
      const endTimeUnix = endTime.getTime();

      for(let time = startTimeUnix; time < endTimeUnix; time += timeIntervalInMilliseconds) {
        const slotStart = time;
        const slotEnd = time + timeIntervalInMilliseconds;

        const isBooked = bookings.some((booking) => {
          const bookingStart = new Date(booking.start).getTime();
          const bookingEnd = new Date(booking.end).getTime();

          return bookingStart <= slotStart && bookingEnd >= slotEnd;
        });

        if(!isBooked) {
          const slotStartTime = new Date(slotStart);
          const slotEndTime = new Date(slotEnd);
          availableTimeSlots.push(`${slotStartTime.toTimeString().slice(0, 5)} - ${slotEndTime.toTimeString().slice(0, 5)}\n`);
        }
      }

      console.log(`Available time slots for ${parsedDate.toDateString()}:`);
      console.log(availableTimeSlots.join('\n'));
    } catch (ex: unknown) {
      const error = ex as Error;
      console.log("Failed to list availability", error.message);
    }
  });

(async () => {
  await parser.parse();
})();


