/**
 * Utility function for more granular error handling
 * @param fn
 * @returns
 */
export const result = <T>(fn: () => T) => new Result(fn);

class Result<T> {
  #result: { success: true; value: T } | { success: false; error: unknown };

  constructor(fn: () => T) {
    try {
      this.#result = {
        success: true,
        value: fn(),
      };
    } catch (error) {
      this.#result = {
        success: false,
        error,
      };
    }
  }

  catch<U>(fn: (e: unknown) => U): Result<T> | Result<U> {
    const current = this.#result;
    if (current.success) {
      return this;
    } else {
      return new Result(() => fn(current.error));
    }
  }

  done() {
    const current = this.#result;
    if (current.success) {
      return current.value;
    } else {
      throw current.error;
    }
  }
}
