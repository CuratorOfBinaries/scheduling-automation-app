
export const dayMapper: { [key: string]: string; } = {
  'mon': 'Monday',
  'tues': 'Tuesday',
  'wed': 'Wednesday',
  'thurs': 'Thursday',
  'fri': 'Friday',
  'sat': 'Saturday',
  'sun': 'Sunday'
};

export const dayCode: { [key: number]: string; } = {
  0: 'sun',
  1: 'mon',
  2: 'tues',
  3: 'wed',
  4: 'thurs',
  5: 'fri',
  6: 'sat'
}

export class TimeBlock {
  start: string = '';
  end: string = '';

  constructor(start: string, end: string) {
    this.start = start;
    this.end = end;
  }
}
