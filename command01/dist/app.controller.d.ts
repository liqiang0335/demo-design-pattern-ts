import { AppService, type ApplicationInfo } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getApplicationInfo(): ApplicationInfo;
}
