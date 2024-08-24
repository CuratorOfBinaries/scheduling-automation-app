type Creator = {
  email: string;
  self: boolean;
};

type Attendee = {
  email: string;
  organizer: boolean;
  self: boolean;
  responseStatus: string;
};

type Source = {
  url: string;
  title: string;
};

export interface Event {
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  description: string;
  location: string;
  creator: Creator;
  organizer: Creator;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  transparency: string;
  visibility: string;
  iCalUID: string;
  sequence: number;
  attendees: Array<Attendee>;
  guestsCanInviteOthers: boolean;
  reminders: {
    useDefault: boolean;
  };
  source: Source;
  eventType: string;
}