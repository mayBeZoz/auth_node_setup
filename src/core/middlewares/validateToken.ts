import controllerHandler from "../utils/controllerHandler";
import { ResponseStatus } from "../utils/constants";
import { verify } from "jsonwebtoken";
import { TJwtTokenPayload } from "../../features/types";


export const validateToken = (callback:Function) => controllerHandler(
    async (req,res,next) => {
        const token = req.headers.Authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                data:null,
                message:"user is not authorized",
                error:null,
                status:ResponseStatus.FAILED
            })
        }

        const decoded = verify(token,process.env.ACCESS_TOKEN_JWT_SECRET as string) as TJwtTokenPayload
        req.user = decoded
        callback()
    }
)