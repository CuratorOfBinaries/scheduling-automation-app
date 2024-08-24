import { AvailibilityService } from './AvailabilityService.js';
import { TimeBlock } from './TimeBlock.js';

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('{}'),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
}));

jest.mock('node:url', () => ({
  fileURLToPath: jest.fn().mockReturnValue('/mocked/file/path'),
}));

jest.mock('path', () => ({
  dirname: jest.fn().mockReturnValue('/mocked/dir/path'),
  join: jest.fn().mockReturnValue('/mocked/data/file/path'),
}));

describe('AvailibilityService', () => {
  let service: AvailibilityService;

  beforeEach(() => {
    service = new AvailibilityService('');
  });

  describe('configureAvailability', () => {
    it('should correctly set availability for valid inputs', () => {
      const days = [ 'tues'];
      const timeBlocks = [new TimeBlock('09:00', '17:00')];

      service.configureAvailability(days, timeBlocks);
           
      expect(service.getAvailability(days)).toEqual({
        tues: timeBlocks,
      });
    });

    it('should throw an error for invalid days', () => {
      const days = ['invalidDay'];
      const timeBlocks = [new TimeBlock( '09:00', '17:00')];
      expect(() => service.configureAvailability(days, timeBlocks)).toThrow();
    });

    it('should throw an error for invalid start times', () => {
      const days = ['mon'];
      const timeBlocks = [new TimeBlock( 'invalidTime', '17:00')];
      expect(() => service.configureAvailability(days, timeBlocks)).toThrow();
    });

    it('should throw an error for invalid end times', () => {
      const days = ['mon'];
      const timeBlocks = [new TimeBlock( '09:00', 'invalidTime')];
      expect(() => service.configureAvailability(days, timeBlocks)).toThrow();
    });

    it('should throw an error for start time being later than end time', () => {
      const days = ['mon'];
      const timeBlocks = [new TimeBlock( '18:00', '09:00')];
      expect(() => service.configureAvailability(days, timeBlocks)).toThrow();
    });
  });

  describe('getAvailability', () => {
    it('should return the correct availability for requested days', () => {
      const days = [ 'tues'];
      const timeBlocks = [new TimeBlock( '09:00', '17:00')];
      service.configureAvailability(days, timeBlocks);
      expect(service.getAvailability(['tues'])).toEqual({ tues: timeBlocks });
    });

    it('should return an empty object when no days match', () => {
      const days = [ 'tues'];
      const timeBlocks = [new TimeBlock( '09:00', '17:00')];
      service.configureAvailability(days, timeBlocks);
      expect(service.getAvailability(['wed'])).toEqual({});
    });
  });
});