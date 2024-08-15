import UserModel, { IUser } from "./model";

export const createUser = function (userData:Partial<IUser>) {
    return UserModel.create(userData)
}

export const findUserByEmail = function (email:string) {
    return UserModel.findOne({email})
}

export const findUserById = function (id:string) {
    return UserModel.findById(id)
}