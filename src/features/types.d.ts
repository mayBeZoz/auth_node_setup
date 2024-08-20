import 'express';
import { TUserTokenPayload } from './users/schema';



declare module 'express-serve-static-core' {
    interface Request {
        decodedUser?: TUserTokenPayload;
    }
}
