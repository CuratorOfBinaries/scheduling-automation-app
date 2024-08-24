import { google } from "googleapis";
import { calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Event } from "./Event.js";

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {OAuth2Client} auth An authorized OAuth2 client.
 */
export async function listEvents(auth: OAuth2Client) {
  const calendar = google.calendar({version: 'v3', auth});
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }
  console.log('Upcoming events:');
  events.map((event, i) => {
    const start = event?.start?.dateTime || event?.start?.date;
    console.log(start);
  });
}

export async function consildatedEventList(auth: OAuth2Client): Promise<Event[]> {
  const calendar = google.calendar({version: 'v3', auth});
  const res = await calendar.calendarList.list();

  const calendarList = res.data.items;
  let events: Event[] = [];

  if(!calendarList || calendarList.length === 0) {
    return await events;
  }

  for(const cal of calendarList) {
    const payload = await calendar.events.list({
      calendarId: cal.id!,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    if(payload.data.items) {
      const calEvents = retrieveAllEventsForCalendar(payload.data.items);

      events = [...events, ...calEvents];
    }
  }

  return events;
}

function retrieveAllEventsForCalendar(items: calendar_v3.Schema$Event[]): Event[] {
  let events: Event[] = [];

  for(const item of items) {
    events = [...events, item as Event];
  }

  return events;
}
