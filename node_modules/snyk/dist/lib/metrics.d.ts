declare type MetricType = 'timer' | 'synthetic';
export declare type MetricValue = number | undefined;
export declare const METRIC_TYPE_TIMER = "timer";
export declare const METRIC_TYPE_SYNTHETIC = "synthetic";
export declare abstract class MetricInstance {
    abstract getValue(): MetricValue;
}
export declare class TimerMetricInstance extends MetricInstance {
    startTimeMs: number;
    endTimeMs: number;
    metricTag: string;
    /**
     * Creates a new TimerMetricInstance
     * @param metricTag used for logging to identify the metric
     */
    constructor(metricTag: string);
    getValue(): MetricValue;
    start(): void;
    stop(): void;
}
export declare class SyntheticMetricInstance extends MetricInstance {
    private value;
    setValue(value: number): void;
    getValue(): number;
}
export declare abstract class Metric {
    name: string;
    context: string;
    metricType: MetricType;
    protected instances: Array<MetricInstance>;
    clear(): void;
    getValues(): number[];
    getTotal(): number;
    constructor(name: string, metricType: MetricType, context: string);
}
export declare class TimerMetric extends Metric {
    createInstance(): TimerMetricInstance;
}
export declare class SyntheticMetric extends Metric {
    createInstance(): SyntheticMetricInstance;
}
export declare class MetricsCollector {
    static NETWORK_TIME: TimerMetric;
    static CPU_TIME: SyntheticMetric;
    static getAllMetrics(): any[];
}
export {};
