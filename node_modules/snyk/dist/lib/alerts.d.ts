export declare type AlertType = 'info' | 'warning' | 'error';
export interface Alert {
    type: AlertType;
    name: string;
    msg: string;
}
declare function registerAlerts(alerts: Alert[]): void;
declare function hasAlert(name: string): boolean;
declare function displayAlerts(): string;
export { registerAlerts, hasAlert, displayAlerts };
