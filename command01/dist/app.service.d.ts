export interface ApplicationInfo {
    readonly name: string;
    readonly description: string;
}
export declare class AppService {
    getApplicationInfo(): ApplicationInfo;
}
