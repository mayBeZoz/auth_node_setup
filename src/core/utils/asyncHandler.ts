import { Request, Response, NextFunction } from "express"

export default function (func:Function) {
    return async (req:Request,res:Response,next:NextFunction) => {
        try {
            await func()
        }catch (err) {
            next(err)
        }
    }
}

