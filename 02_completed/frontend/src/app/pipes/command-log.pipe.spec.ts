import { CommandLogPipe } from './command-log.pipe';

describe('CommandLogPipe', () => {
  it('create an instance', () => {
    const pipe = new CommandLogPipe();
    expect(pipe).toBeTruthy();
  });
});
