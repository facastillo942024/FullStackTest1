/**
 * Railway Oriented Programming (ROP) primitive.
 *
 * A `Result<T, E>` represents either a successful value (`Ok`) traveling on the
 * "success track", or a failure (`Err`) traveling on the "failure track".
 * Use cases chain operations with `map` / `flatMap` so that the first failure
 * short-circuits the rest of the pipeline without throwing exceptions.
 */

export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E> {
  readonly isOk = true as const;
  readonly isErr = false as const;

  constructor(public readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  async flatMapAsync<U>(
    fn: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    return fn(this.value);
  }

  mapErr<F>(_fn: (error: E) => F): Result<T, F> {
    return new Ok<T, F>(this.value);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_fallback: T): T {
    return this.value;
  }
}

export class Err<T, E> {
  readonly isOk = false as const;
  readonly isErr = true as const;

  constructor(public readonly error: E) {}

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return new Err<U, E>(this.error);
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return new Err<U, E>(this.error);
  }

  async flatMapAsync<U>(
    _fn: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    return new Err<U, E>(this.error);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return new Err<T, F>(fn(this.error));
  }

  unwrap(): T {
    throw this.error;
  }

  unwrapOr(fallback: T): T {
    return fallback;
  }
}

export const ok = <T, E = Error>(value: T): Result<T, E> => new Ok(value);
export const err = <T = never, E = Error>(error: E): Result<T, E> =>
  new Err(error);

/**
 * Runs an async operation that may throw and captures the exception on the
 * failure track using the provided mapper.
 */
export async function fromPromise<T, E>(
  promise: Promise<T>,
  onError: (reason: unknown) => E,
): Promise<Result<T, E>> {
  try {
    const value = await promise;
    return ok(value);
  } catch (reason) {
    return err(onError(reason));
  }
}
