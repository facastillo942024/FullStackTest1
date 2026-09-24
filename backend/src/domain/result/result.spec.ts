import { ok, err, fromPromise, Ok, Err } from './result';

describe('Result (ROP)', () => {
  describe('Ok', () => {
    it('maps the value', () => {
      const result = ok<number>(2).map((n) => n * 3);
      expect(result.isOk).toBe(true);
      expect((result as Ok<number, Error>).value).toBe(6);
    });

    it('flatMaps into another Ok', () => {
      const result = ok<number>(2).flatMap((n) => ok(n + 1));
      expect((result as Ok<number, Error>).value).toBe(3);
    });

    it('flatMapAsync resolves the next step', async () => {
      const result = await ok<number>(2).flatMapAsync(async (n) => ok(n + 5));
      expect((result as Ok<number, Error>).value).toBe(7);
    });

    it('mapErr is a no-op on the success track', () => {
      const result = ok<number>(1).mapErr(() => new Error('x'));
      expect(result.isOk).toBe(true);
    });

    it('unwrap returns the value and unwrapOr ignores fallback', () => {
      expect(ok(9).unwrap()).toBe(9);
      expect(ok(9).unwrapOr(0)).toBe(9);
    });
  });

  describe('Err', () => {
    const boom = new Error('boom');

    it('short-circuits map and flatMap', () => {
      const mapped = err<number>(boom).map((n) => n * 2);
      const flat = err<number>(boom).flatMap((n) => ok(n));
      expect(mapped.isErr).toBe(true);
      expect(flat.isErr).toBe(true);
    });

    it('flatMapAsync stays on the error track', async () => {
      const result = await err<number>(boom).flatMapAsync(async (n) => ok(n));
      expect(result.isErr).toBe(true);
    });

    it('mapErr transforms the error', () => {
      const result = err<number>(boom).mapErr(() => new Error('mapped'));
      expect((result as Err<number, Error>).error.message).toBe('mapped');
    });

    it('unwrap throws and unwrapOr returns fallback', () => {
      expect(() => err(boom).unwrap()).toThrow('boom');
      expect(err<number>(boom).unwrapOr(42)).toBe(42);
    });
  });

  describe('fromPromise', () => {
    it('captures a resolved value as Ok', async () => {
      const result = await fromPromise(Promise.resolve('hi'), () => 'e');
      expect((result as Ok<string, string>).value).toBe('hi');
    });

    it('captures a rejection as Err via the mapper', async () => {
      const result = await fromPromise(
        Promise.reject(new Error('fail')),
        (reason) => (reason as Error).message,
      );
      expect((result as Err<never, string>).error).toBe('fail');
    });
  });
});
