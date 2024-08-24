import { TimeBlock } from "./TimeBlock.js";


export interface IAvailabilityService {
  getAvailability(days?: string[] | null): { [key: string]: TimeBlock[]; };
  configureAvailability(days: string[], timeBlocks: TimeBlock[]): void;
}
