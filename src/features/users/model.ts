import { Document ,Schema ,model } from "mongoose";

export interface IUser extends Document {
    firstName:string,
    lastName:string,
    password:string,
    email:string,
    resetPasswordOTP:string|null,
    verifyUserOTP:string|null,
    verified:boolean,
    setOTPExpiration: (otpField: 'verifyUserOTP' | 'resetPasswordOTP', expirationTime: number) => void;
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
    }

})


userSchema.methods.setOTPExpiration = function (
    otpField: 'verifyUserOTP' | 'resetPasswordOTP',
    expirationTime: number
) {
    setTimeout(() => {
        this[otpField] = null;
        this.save();
    }, expirationTime);
};

const UserModel = model<IUser>('User', userSchema);

export default UserModel;