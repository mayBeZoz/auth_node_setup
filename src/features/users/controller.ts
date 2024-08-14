import { ResponseStatus } from "../../core/utils/constants";
import controllerHandler from "../../core/utils/controllerHandler";
import sendEmail from "../../core/utils/sendEmail";
import { TCreateUserPayload } from "./schema";
import { createUser, findUserByEmail, findUserById } from "./service";
import { Request } from "express";
import bcrypt from "bcrypt"
import generateOTP from "../../core/utils/generateOTP";

export default class UserController {
    static register = controllerHandler(
        async (req:Request<{},{},TCreateUserPayload>,res,next) => {
            const {email,password} = req.body
            const isUserExist = Boolean(await findUserByEmail(email))
            
            if (isUserExist) {
                return res.status(409).send({
                    message:"user with this email already exists",
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED
                })
            }
            const hashedPassword = await bcrypt.hash(password,12)

            const user = await createUser({
                ...req.body, 
                password:hashedPassword,
                verifyUserOTP:generateOTP()
            })

            const otpExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
            user.setOTPExpiration('verifyUserOTP', otpExpirationTime);
            
            await sendEmail({
                to: user.email,
                from: process.env.NODEMAILER_FROM_EMAIL,
                subject: "Verify your email",
                text: `verification code: ${user.verifyUserOTP}. Id: ${user._id}`,
            })
            const { _id, email:userEmail, firstName, lastName, verified } = user.toObject();

            return res.status(201).json({
                data:{ _id, email:userEmail, firstName, lastName, verified },
                error:null,
                status:ResponseStatus.SUCCESS,
                message:"you account has been created successfully, activation code is sent to your email"
            })
        }
    )

    static getAccountVerificationOTP = controllerHandler(
        async (req,res,next) => {
            const userId = req.params.userId
            
            const user = await findUserById(userId)
            if (!user) {
                return res.status(404).json({
                    error:null,
                    status:ResponseStatus.FAILED,
                    data:null,
                    message:"user not exists"
                })
            }else if (user.verified) {
                return res.status(404).json({
                    error:null,
                    status:ResponseStatus.FAILED,
                    data:null,
                    message:"user is already verified"
                })
            }

            const otpExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
            user.setOTPExpiration('verifyUserOTP', otpExpirationTime);
            
            await sendEmail({
                to: user.email,
                from: process.env.NODEMAILER_FROM_EMAIL,
                subject: "Verify your email",
                text: `verification code: ${user.verifyUserOTP}. Id: ${user._id}`,
            })
            
            return res.status(404).json({
                error:null,
                status:ResponseStatus.SUCCESS,
                data:null,
                message:"activation code is sent to your email"
            })
        }
    )

    static submitAccountVerificationOTP = controllerHandler(
        async (req,res,next) => {
            const userId = req.params.id
            const verificationOTP = req.params.verificationOTP
            
            const user = await findUserById(userId)
            if (!user) {
                return res.status(404).json({
                    error:null,
                    status:ResponseStatus.FAILED,
                    data:null,
                    message:"user not exists"
                })
            }else if (user.verified) {
                return res.status(404).json({
                    error:null,
                    status:ResponseStatus.FAILED,
                    data:null,
                    message:"user is already verified"
                })
            }
            if (user.verifyUserOTP !== verificationOTP) {
                return res.status(404).json({
                    error:null,
                    status:ResponseStatus.FAILED,
                    data:null,
                    message:"verification code is not valid"
                })
            }
            user.verified = true
            await user.save()
            
            const { _id, email, firstName, lastName, verified } = user.toObject();

            return res.status(404).json({
                error:null,
                status:ResponseStatus.SUCCESS,
                data:{ _id, email, firstName, lastName, verified },
                message:"your account is activated successfully"
            })
        }
    )
}