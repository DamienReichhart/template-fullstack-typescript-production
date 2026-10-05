/**
 * Ensures at most one refresh request is in flight: concurrent 401s all wait for the same
 * refresh instead of each rotating the refresh token (which would look like token theft).
 */
export class RefreshCoordinator {
  #inFlight: Promise<boolean> | null = null;

  constructor(private readonly performRefresh: () => Promise<boolean>) {}

  refresh(): Promise<boolean> {
    this.#inFlight ??= this.performRefresh()
      .catch(() => false)
      .finally(() => {
        this.#inFlight = null;
      });
    return this.#inFlight;
  }
}
