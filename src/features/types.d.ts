import 'express';

declare module 'express' {
    interface Request {
        cookies: {
            user_token:string|undefined
        };
    }
}