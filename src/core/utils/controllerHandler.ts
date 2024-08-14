import { Request, Response, NextFunction } from "express"

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export default function (func:AsyncFunction) {
    return async (req:Request,res:Response,next:NextFunction) => {
        try {
            await func(req,res,next)
        }catch (err) {
            next(err)
        }
    }
}

