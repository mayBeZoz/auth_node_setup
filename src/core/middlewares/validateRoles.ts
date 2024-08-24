import { verify } from "jsonwebtoken";
import { findUserById } from "../../features/users/service";
import { ResponseStatus, UserRoles } from "../utils/constants";
import controllerHandler from "../utils/controllerHandler";
import { TUserTokenPayload } from "../../features/users/schema";

export const validateRoles = (roles:UserRoles[]) => controllerHandler(
    async (req,res,next) => {
        const token = (req.headers?.authorization as string)?.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                data:null,
                message:"user is not authorized",
                error:null,
                status:ResponseStatus.FAILED
            })
        }

        try {
            const decoded = verify(token,process.env.ACCESS_TOKEN_JWT_SECRET as string) as TUserTokenPayload
            req.decodedUser = decoded
        }catch (err) {
            return res.status(401).json({
                data:null,
                message:"token expired ,user is not authorized",
                error:null,
                status:ResponseStatus.FAILED
            })
        }

        let data = req.decodedUser
        const isUserRoleMatch = Boolean(roles.find(role => role === data?.role))
        if (!isUserRoleMatch && !data) {
            return res.status(403).json({
                data:null,
                error:null,
                status:ResponseStatus.FAILED,
                message:"you don't have access to this method"
            })
        }
        
        const user = await findUserById(data?._id as string)

        if (user && user.role === data?.role) {
            next()
        }else {
            res.status(404).json({
                data:null,
                error:null,
                status:ResponseStatus.FAILED,
                message:'user is not authorized'
            })
        }
        
    }
)