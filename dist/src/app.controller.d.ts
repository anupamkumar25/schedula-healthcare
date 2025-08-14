import { AppService } from './app.service';
interface JwtRequestUser {
    userId: string;
    email: string;
    userType: 'patient' | 'doctor';
}
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getProfile(req: Request & {
        user: JwtRequestUser;
    }): {
        success: boolean;
        message: string;
        data: {
            user: JwtRequestUser;
        };
    };
}
export {};
