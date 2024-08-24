export class Booking {
  public summary: string;
  public start: string;
  public end: string;

  constructor(summary: string, start: string, end: string) {
    this.summary = summary;
    this.start = start;
    this.end = end;
  }
}