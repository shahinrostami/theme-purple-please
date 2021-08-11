import { IDocumentProvider } from './index';
export declare class ProviderMock implements IDocumentProvider {
    requestInitialContent(): Promise<boolean>;
    putInitializedState(): void;
    acquireLock(): Promise<number>;
    releaseLock(lock: number): void;
    destroy(): void;
    setPath(path: string): void;
}
