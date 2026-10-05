import { describe, expect, it, mock } from 'bun:test';

import { RefreshCoordinator } from './refresh-coordinator.js';

describe('RefreshCoordinator', () => {
  it('shares one refresh between concurrent callers', async () => {
    let resolve: (value: boolean) => void = () => undefined;
    const performRefresh = mock(() => new Promise<boolean>((r) => (resolve = r)));
    const coordinator = new RefreshCoordinator(performRefresh);

    const results = Promise.all([
      coordinator.refresh(),
      coordinator.refresh(),
      coordinator.refresh(),
    ]);
    resolve(true);

    expect(await results).toEqual([true, true, true]);
    expect(performRefresh).toHaveBeenCalledTimes(1);
  });

  it('starts a new refresh once the previous one settled', async () => {
    const performRefresh = mock(async () => true);
    const coordinator = new RefreshCoordinator(performRefresh);
    await coordinator.refresh();
    await coordinator.refresh();
    expect(performRefresh).toHaveBeenCalledTimes(2);
  });

  it('reports a failed refresh as false instead of throwing', async () => {
    const coordinator = new RefreshCoordinator(async () => {
      throw new Error('network');
    });
    expect(await coordinator.refresh()).toBe(false);
  });
});
