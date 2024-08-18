import { findUserById } from "../../features/users/service";
import { ResponseStatus } from "../utils/constants";
import controllerHandler from "../utils/controllerHandler";
import { validateToken } from "./validateToken";

export const validateUser = controllerHandler(
    async (req,res,next) => {
        validateToken(async ()=> {
            let data = req.user
            const isUser = data?.role === 'user'
            if (!isUser && !data) {
                return res.status(403).json({
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED,
                    message:"user only can access this method"
                })
            }
            
            const user = await findUserById(data._id)
            if (!user) {
                return res.status(404).json({
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED,
                    message:'user not found'
                })
            }

            next()
        })
    }
)