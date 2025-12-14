export interface Coordinator {
    id: number;
    name: string;
}

export interface CoordinatorStatus extends Coordinator {
    clockIn: number;
    clockOut: number;
    anomalies: number;
}

export interface ApiParams {
    userID: string;
    appSecret: string;
    appVersion: string;
    version: string;
    minorVersion: string;
    appName: string;
}