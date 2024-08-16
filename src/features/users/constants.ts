import { SendMailOptions } from "nodemailer";
import { IUser } from "./model";

export const accountVerificationPayload = (user:IUser,modifiedPayload?:SendMailOptions) => {
    return (
        {
            to: user.email,
            from: process.env.NODEMAILER_FROM_EMAIL,
            subject: "Verify your account",
            text: `verification code: ${user.verifyUserOTP}. Id: ${user._id}`,
            ...modifiedPayload
        }
    )
}


export const accountResetPasswordPayload = (user:IUser,modifiedPayload?:SendMailOptions) => {
    return (
        {
            to: user.email,
            from: process.env.NODEMAILER_FROM_EMAIL,
            subject: "Reset Password code",
            text: `Reset Password code: ${user.resetPasswordOTP}. Id: ${user._id}`,
            ...modifiedPayload
        }
    )
}