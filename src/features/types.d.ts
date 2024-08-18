import 'express';
import { JwtPayload } from 'jsonwebtoken';

declare type TJwtTokenPayload = {
    _id:string,
    email:string,
    role:'user'|'admin'
}



declare module 'express' {
    interface Request {
        cookies: {
            user_token:string|undefined
        };
        user:TJwtTokenPayload|undefined,
        headers:{
            Authorization:string|undefined
        }
    }
}

