import fs from 'fs';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'path';
import { TimeBlock, dayMapper } from './TimeBlock.js';
import { IAvailabilityService } from './IAvailabilityService.js';

const timeValidator = (timeInput: string) => {
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timePattern.test(timeInput);
}

export class AvailibilityService implements IAvailabilityService {
    private availability: { [key: string]: TimeBlock[] } = {};
    private dataFilePath: string;

    constructor(dataFilePath: string) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        
        this.dataFilePath = path.join(__dirname, dataFilePath);

        if (!fs.existsSync(path.dirname(this.dataFilePath))) {
          fs.mkdirSync(path.dirname(this.dataFilePath), { recursive: true });
        }

        this.loadAvailability();
    }

    public getAvailability(days: string[] | null = null) {
        const availability: { [key: string]: TimeBlock[] } = {};

        if(!days) {
          return this.availability;
        }

        for(const day in this.availability) {
          if(days.includes(day)) {
            availability[day] = this.availability[day];
          };
        }

        return availability;
    }

    public configureAvailability(days: string[], timeBlocks: TimeBlock[]) {
        days.forEach((day) => {
            if(!dayMapper[day]) {
                throw new Error(`Invalid day ${day}`);
            }
        });

        timeBlocks.forEach((timeBlock) => {
            if(!timeBlock.start || !timeValidator(timeBlock.start)) {
              throw new Error(`Invalid start time: ${timeBlock.start}`);
            }

            if(!timeBlock.end || !timeValidator(timeBlock.end)) {
              throw new Error(`Invalid end time: ${timeBlock.end}`);
            }

            const { start, end } = parseTimes(timeBlock);

            if(start > end) {
                throw new Error(`Invalid time block: ${start} - ${end}`);
            }
        });

        this.availability = {};

        for(const day of days) {
          this.availability[day] = timeBlocks;
        }

        this.saveAvailability();
    }

    private saveAvailability() {
      fs.writeFileSync(
        this.dataFilePath, 
        JSON.stringify(this.availability, null, 2),
        { flag: 'w' }
      );
    }
  
    private loadAvailability() {
      if (fs.existsSync(this.dataFilePath)) {
        const data = fs.readFileSync(this.dataFilePath, 'utf-8');
        this.availability = JSON.parse(data);
      }
    }
}

function parseTimes(timeBlock: TimeBlock): { start: any; end: any; } {
  const startMinutesFromMidnight = convertTimeStringToMinutes(timeBlock.start);
  const endMinutesFromMidnight = convertTimeStringToMinutes(timeBlock.end);

  return {
    start: startMinutesFromMidnight,
    end: endMinutesFromMidnight
  };
}

function convertTimeStringToMinutes(time: string) {
  const [hour, minute] = time.split(':');
  return (parseInt(hour) * 60) + parseInt(minute);
}
