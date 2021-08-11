export class ProviderMock {
    requestInitialContent() {
        return Promise.resolve(false);
    }
    putInitializedState() {
        /* nop */
    }
    acquireLock() {
        return Promise.resolve(0);
    }
    releaseLock(lock) {
        /* nop */
    }
    destroy() {
        /* nop */
    }
    setPath(path) {
        /* nop */
    }
}
//# sourceMappingURL=mock.js.map