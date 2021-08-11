import { eventLoopSpinner } from '../';

test('should not block event loop', async () => {
  let lastTick = Date.now();
  const interval = setInterval(() => {
    lastTick = Date.now();
  }, 10);
  let spins = 0;

  // Run blocking operation for one second.
  const startTime = Date.now();
  while (Date.now() - startTime < 1000) {
    if (eventLoopSpinner.isStarving()) {
      await eventLoopSpinner.spin();
      spins++;
    }
  }

  clearInterval(interval);
  expect(Date.now() - lastTick).toBeLessThanOrEqual(100);
  expect(spins).toBeLessThanOrEqual(99);
});
