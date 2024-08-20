import { Document ,Schema ,model } from "mongoose";
import { UserRoles } from "../../core/utils/constants";

export interface IUser extends Document {
    firstName:string,
    lastName:string,
    password:string,
    email:string,
    resetPasswordOTP:string|null,
    verifyUserOTP:string|null,
    verified:boolean,
    setVerifyUserOTPExpiration: (expirationTime: number) => void,
    setResetPasswordOTPExpiration: (expirationTime: number) => void,
    role:UserRoles
}

const userSchema = new Schema<IUser>({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true,
    },
    verified:{
        type:Boolean,
        default:false
    },
    resetPasswordOTP:{
        type:null||String,
        default:null,
    },
    verifyUserOTP:{
        type:null||String,
        default:null,
    },
    role:{
        default:UserRoles.USER,
        type: String,
    }

})



userSchema.methods.setVerifyUserOTPExpiration = function (expirationTime: number){

    setTimeout(() => {
        this['verifyUserOTP'] = null;
        this.save();
    }, expirationTime);
};


userSchema.methods.setResetPasswordOTPExpiration = function (expirationTime: number){

    setTimeout(() => {
        this['resetPasswordOTP'] = null;
        this.save();
    }, expirationTime);
};


const UserModel = model<IUser>('User', userSchema);

export default UserModel;