# event-loop-spinner

Tiny helper to prevent blocking Node.js event loop.

## Example

```typescript
import { eventLoopSpinner } from 'event-loop-spinner';
async function cpuIntensiveOperationHandler(hugeArray) {
  for (const item of hugeArray) {
    // ...
    if (eventLoopSpinner.isStarving()) {
      await eventLoopSpinner.spin();
    }
  }
}
```

## Reading

[Node.js: How even quick async functions can block the Event-Loop, starve I/O](https://snyk.io/blog/nodejs-how-even-quick-async-functions-can-block-the-event-loop-starve-io/)
