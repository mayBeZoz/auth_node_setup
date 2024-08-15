import { Request, Response, NextFunction } from "express";


type Controller<
    P = any,  // Params type
    ResBody = any,  // Response body type
    ReqBody = any,  // Request body type
    ReqQuery = any  // Query string type
> = (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
) => Promise<any>;


export default function controllerHandler<
    P = any,  // Params type
    ResBody = any,  // Response body type
    ReqBody = any,  // Request body type
    ReqQuery = any  // Query string type
>(
    func: Controller<P, ResBody, ReqBody, ReqQuery>
) {
    return async (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => {
        try {
            await func(req, res, next);
        } catch (err) {
            next(err);
        }
    };
}
