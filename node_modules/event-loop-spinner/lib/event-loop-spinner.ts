export class EventLoopSpinner {
  private afterLastSpin: number;

  constructor(private thresholdMs: number = 10) {
    this.afterLastSpin = Date.now();
  }

  public isStarving(): boolean {
    return Date.now() - this.afterLastSpin > this.thresholdMs;
  }

  public async spin(): Promise<void> {
    return new Promise((resolve) =>
      setImmediate(() => {
        this.afterLastSpin = Date.now();
        resolve();
      }),
    );
  }
}
