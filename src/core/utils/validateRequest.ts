import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express"
import { ResponseStatus } from "./constants";

export default function (schema:AnyZodObject) {
    return (req:Request,res:Response,next:NextFunction) => {
        try {
            schema.parse(req)
            next()
        }catch(err:any) {
            return res.status(400).json({
                data:null,
                error:err.errors,
                message:"validation error",
                status:ResponseStatus.FAILED
            })
        }
    }
}