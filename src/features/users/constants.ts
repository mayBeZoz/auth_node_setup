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