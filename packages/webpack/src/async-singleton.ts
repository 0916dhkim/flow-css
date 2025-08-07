class AsyncSingleton<T> {
  #buildPromise: Promise<T> | null;

  constructor() {
    this.#buildPromise = null;
  }

  async getOrCreate(builder: () => Promise<T>) {
    this.#buildPromise ??= builder();
    return this.#buildPromise;
  }
}

export = AsyncSingleton;
