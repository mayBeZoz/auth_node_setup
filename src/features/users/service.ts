import { UserRoles } from "../../core/utils/constants";
import UserModel, { IUser } from "./model";

export const createUser = function (userData:Partial<IUser>) {
    return UserModel.create(userData)
}

export const findUserByEmail = function (email:string,selectString?:string) {
    return UserModel.findOne({email}).select(selectString)
}

export const findUserById = function (id:string,selectString?:string) {
    return UserModel.findById(id).select(selectString)
}


export const getUsers = async function (page:number,limit:number,query:string):Promise<{
    users:Partial<IUser>[],
    total_pages:number,
    curr_page:number
}> {
    const regexQuery = new RegExp(query, "i")
    const skip = (page - 1) * limit;

    const queryObj = {
        $or: [
        { email: { $regex: regexQuery } },
        { firstName: { $regex: regexQuery } },
        { lastName: { $regex: regexQuery } },
    ],}

    const totalUsers = await UserModel.countDocuments(queryObj);
    const totalPages = Math.ceil(totalUsers / limit)
    
    const filteredUsers = await UserModel
    .find(queryObj)
    .skip(skip)
    .limit(limit)
    .select("-password -__v -verifyUserOTP -resetPasswordOTP")

    return {
        users:filteredUsers,
        total_pages:totalPages,
        curr_page:page
    }
}



export const updateUserById = function (payload:Partial<IUser>,userId:string) {
    return UserModel.findOneAndUpdate(
        {_id:userId},
        {$set:payload},
        {new:true}
    ).select("-password -__v -verifyUserOTP -resetPasswordOTP")
}


export const deleteUserById = function (userId:string) {
    return UserModel.findByIdAndDelete(userId).select("-password -__v -verifyUserOTP -resetPasswordOTP")
}

