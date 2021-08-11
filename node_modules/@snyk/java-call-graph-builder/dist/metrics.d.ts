export { Metrics, timeIt, getMetrics };
interface Metrics {
    fetchCallGraphBuilder?: number;
    getMvnClassPath?: number;
    getGradleClassPath?: number;
    getEntrypoints: number;
    generateCallGraph: number;
    mapClassesPerJar: number;
    getCallGraph: number;
}
declare function getMetrics(): Metrics;
declare function timeIt<T>(metric: keyof Metrics, fn: () => Promise<T>): Promise<T>;
