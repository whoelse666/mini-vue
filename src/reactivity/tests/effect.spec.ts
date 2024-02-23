// import { reactive } from '../src/reactive.ts';
// import { effect, stop } from '../src/effect.ts';
import { add } from '../index.ts';

describe('effect', () => {
  it('should run the passed function once (wrapped by a effect)', () => {
    expect(true).toBe(true);
    expect(add(1, 1)).toBe(2);
  });
});
