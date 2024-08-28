import { ResponseStatus, UserRoles } from "../../core/utils/constants";
import controllerHandler from "../../core/utils/controllerHandler";
import sendEmail from "../../core/utils/sendEmail";
import generateOTP from "../../core/utils/generateOTP";
import bcrypt from "bcrypt"
import { sign, verify} from "jsonwebtoken"

import { 
    TAccountVerificationParams,
    TAccountVerificationPayload, 
    TChangeUserRoleParams, 
    TChangeUserRolePayload, 
    TCreateUserPayload, 
    TDeleteUserParams, 
    TGetAllUsersQuery, 
    TGetResetPasswordParams, 
    TGetUserByIdParams, 
    TSubmitResetPasswordParams, 
    TSubmitResetPasswordPayload, 
    TUpdateUserParams, 
    TUpdateUserPayload, 
    TUserLoginPayload, 
    TUserTokenPayload 
} from "./schema";

import { 
    createUser, 
    deleteUserById, 
    findUserByEmail, 
    findUserById, 
    getUsers, 
    updateUserById 
} from "./service";


import { 
    getAccountVerificationEmailPayload, 
    getResetPasswordEmailPayload 
} from "./constants";





export default class UserController {
    static register = controllerHandler<{},{},TCreateUserPayload>(
        async (req,res,next) => {
            const {email,password} = req.body
            const isUserExist = Boolean((await findUserByEmail(email)))

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
            user.setVerifyUserOTPExpiration(otpExpirationTime);
            
            await sendEmail(getAccountVerificationEmailPayload(user))

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
            const userId = req.params.id
            try {
                const user = await findUserById(userId)

                if (!user) {
                    return res.status(404).json({
                        error:null,
                        status:ResponseStatus.FAILED,
                        data:null,
                        message:"user not exists"
                    })
                }else if (user.verified) {
                    return res.status(403).json({
                        error:null,
                        status:ResponseStatus.FAILED,
                        data:null,
                        message:"user is already verified"
                    })
                }
                user.verifyUserOTP = generateOTP()
                await user.save()
                const otpExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
                user.setVerifyUserOTPExpiration(otpExpirationTime);
                
                await sendEmail(getAccountVerificationEmailPayload(user))
    
                
                return res.status(200).json({
                    error:null,
                    status:ResponseStatus.SUCCESS,
                    data:null,
                    message:"activation code is sent to your email"
                })
            }catch(err) {
                return res.status(404).json({
                    error:null,
                    status:ResponseStatus.FAILED,
                    data:null,
                    message:"user not exists"
                })
            }
            
        }
    )

    static submitAccountVerificationOTP = controllerHandler<TAccountVerificationParams, {}, TAccountVerificationPayload>(
        async (req, res, next) => {
            const { id: userId } = req.params;
            const { accountVerificationOTP } = req.body;

            const user = await findUserById(userId);
            if (!user) {
                return res.status(404).json({
                    error: null,
                    status: ResponseStatus.FAILED,
                    data: null,
                    message: "User not exists",
                });
            } else if (user.verified) {
                return res.status(403).json({
                    error: null,
                    status: ResponseStatus.FAILED,
                    data: null,
                    message: "User is already verified",
                });
            }

            if (user.verifyUserOTP !== accountVerificationOTP) {
                return res.status(400).json({
                    error: null,
                    status: ResponseStatus.FAILED,
                    data: null,
                    message: "Verification code is not valid",
                });
            }

            user.verified = true;
            await user.save();

            const { _id, email, firstName, lastName, verified } = user.toObject();

            return res.status(200).json({
                error: null,
                status: ResponseStatus.SUCCESS,
                data: { _id, email, firstName, lastName, verified },
                message: "Your account is activated successfully",
            });
        }
    );

    static login = controllerHandler<{},{},TUserLoginPayload>(
        async (req,res,next) => {
            const {email,password} = req.body

            const user = await findUserByEmail(email)

            if (!user) {
                return res.status(404).json({
                    error: null,
                    status: ResponseStatus.FAILED,
                    data: null,
                    message: "User not exists",
                });
            }

            const isPwdValid = await bcrypt.compare(password,user.password)

            if (!isPwdValid) {
                return res.status(400).json({
                    error: null,
                    status: ResponseStatus.FAILED,
                    data: null,
                    message: "Invalid Email Or Password",
                });
            }

            if (!user.verified) {
                user.verifyUserOTP = generateOTP()
                await user.save()
                const otpExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
                user.setVerifyUserOTPExpiration(otpExpirationTime);
                
                await sendEmail(getAccountVerificationEmailPayload(user))

                const { _id, email, firstName, lastName, verified } = user.toObject()
                return res.status(403).json({
                    error: null,
                    status: ResponseStatus.FAILED,
                    data: { _id, email, firstName, lastName, verified },
                    message: "please verify your account before login",
                });
            }
            const refreshSecret = process.env.REFRESH_TOKEN_JWT_SECRET as string
            const accessSecret = process.env.ACCESS_TOKEN_JWT_SECRET as string

            const tokenPayload : TUserTokenPayload = {
                _id:user._id,
                email:user.email,
                role:user.role
            }

            const refreshToken = sign(tokenPayload,refreshSecret,{
                expiresIn:'30d'
            })

            const accessToken = sign(tokenPayload,accessSecret,{
                expiresIn:'15m'
            })
            res.cookie('token',refreshToken,{
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            })

            const { _id, firstName, lastName, verified } = user.toObject()
            
            return res.status(200).json({
                data:{
                    user:{ _id, firstName, lastName, verified, email },
                    token:accessToken
                },
                error:null,
                message:"logged in successfully",
                status:ResponseStatus.SUCCESS
            })
        }
    )

    static logout = controllerHandler(
        async (req,res,next) => {
            res.clearCookie('token');

            return res.status(200).json({
                data:null,
                error:null,
                status:ResponseStatus.SUCCESS,         
                message:'logged out successfully'
            })
        }
    )

    static refreshToken = controllerHandler(
        async (req,res,next) => {
            const token = req.cookies.token

            if (!token) {
                return res.status(401).json({
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED,
                    message:'user is not authorized'
                })
            }

            try {
                const decodedToken = verify(token as string,process.env.REFRESH_TOKEN_JWT_SECRET as string) as TUserTokenPayload
                if (decodedToken) {
                    const user = await findUserById(decodedToken._id)

                    if (!user) {
                        return res.status(404).json({
                            data:null,
                            error:null,
                            status:ResponseStatus.FAILED,
                            message:'user is not found'
                        })
                    }
                    const tokenPayload : TUserTokenPayload = {
                        _id:user._id,
                        email:user.email,
                        role:user.role
                    }

                    const accessSecret = process.env.ACCESS_TOKEN_JWT_SECRET as string

                    const accessToken = sign(tokenPayload,accessSecret,{
                        expiresIn:'15m'
                    })

                    return res.status(200).json({
                        data:{
                            token:accessToken
                        },
                        error:null,
                        status:ResponseStatus.SUCCESS,
                        message:'refresh token successfully'
                    })
                }
            }catch(err) {
                return res.status(401).json({
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED,
                    message:'user is not authorized'
                })
            }

            
        }
    )

    static getResetPasswordOTP = controllerHandler<TGetResetPasswordParams>(
        async (req,res,next) => {
            const userEmail = req.params.email
            
            const user = await findUserByEmail(userEmail)

            if (!user) {
                return res.status(404).json({
                    error:null,
                    status:ResponseStatus.FAILED,
                    data:null,
                    message:"user not exists"
                })
            }else if (!user.verified) {
                return res.status(403).json({
                    error:null,
                    status:ResponseStatus.FAILED,
                    data:null,
                    message:"user is not verified, please verify your account"
                })
            }
            user.resetPasswordOTP = generateOTP()
            await user.save()
            const otpExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
            user.setResetPasswordOTPExpiration(otpExpirationTime);
            
            await sendEmail(getResetPasswordEmailPayload(user))

            
            return res.status(200).json({
                error:null,
                status:ResponseStatus.SUCCESS,
                data:null,
                message:"password reset code is sent to your email"
            })
        
        }
    )


    static submitResetPasswordOTP = controllerHandler<TSubmitResetPasswordParams,{},TSubmitResetPasswordPayload>(
        async (req,res,next) => {
            const { email:userEmail } = req.params;
            const { resetPasswordOTP,newPassword } = req.body;

            const user = await findUserByEmail(userEmail);
            if (!user) {
                return res.status(404).json({
                    error: null,
                    status: ResponseStatus.FAILED,
                    data: null,
                    message: "User not exists",
                });
            } else if (!user.verified) {
                return res.status(403).json({
                    error:null,
                    status:ResponseStatus.FAILED,
                    data:null,
                    message:"user is not verified, please verify your account"
                })
            }

            if (user.resetPasswordOTP !== resetPasswordOTP) {
                return res.status(409).json({
                    error: null,
                    status: ResponseStatus.FAILED,
                    data: null,
                    message: "password reset code is not valid",
                });
            }
            const hashedPassword = await bcrypt.hash(newPassword,12)


            user.password = hashedPassword;
            await user.save();

            const { _id, email, firstName, lastName, verified } = user.toObject();

            return res.status(200).json({
                error: null,
                status: ResponseStatus.SUCCESS,
                data: { _id, email, firstName, lastName, verified },
                message: "your account password is changed successfully",
            });
        }
    )

    static getAllUsers = controllerHandler<{},{},{},TGetAllUsersQuery>(
        async (req,res,next) => {
            const { search = '', page = '1', limit = '10' } = req.query || {}
            const parsedPages = parseInt(page)
            const parsedLimit = parseInt(limit)
            
            const usersData = await getUsers(parsedPages,parsedLimit,search)
            
            return res.status(200).json({
                data:usersData,
                message:'success getting all users',
                status:ResponseStatus.SUCCESS,
                error:null
            })
        }
    )

    static getUserById = controllerHandler<TGetUserByIdParams>(
        async (req,res,next) => {
            const userId = req.params.id

            const user = await findUserById(userId,'-resetPasswordOTP -verifyUserOTP -password -__v')

            if (!user) {
                return res.status(404).json({
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED,
                    message:"user id not found"
                })
            }

            return res.status(200).json({
                data:user,
                error:null,
                status:ResponseStatus.SUCCESS,
                message:"got the user successfully"
            })
        }
    )

    static updateUserById = controllerHandler<TUpdateUserParams,{},TUpdateUserPayload>(
        async (req,res,next) => {
            const userId = req.params.id
            const body = req.body
            if (req.decodedUser?._id === userId || req.decodedUser?.role === UserRoles.ADMIN || req.decodedUser?.role === UserRoles.SUPER_ADMIN) {
                const user = findUserById(userId)

                if (!user) {
                    return res.status(404).json({
                        data:null,
                        error:null,
                        status:ResponseStatus.FAILED,
                        message:"user with this id is not found"
                    })
                }

                const updatedUser = await updateUserById(body,userId)

                return res.status(200).json({
                    data:updatedUser,
                    error:null,
                    status:ResponseStatus.SUCCESS,
                    message:"user updated successfully"
                })
            }
            else {
                return res.status(403).json({
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED,
                    message:"you don't have access to this method"
                })
            }
            
        }
    )

    static deleteUserById = controllerHandler<TDeleteUserParams>(
        async (req,res,next) => {
            const id = req.params.id
            if (req.decodedUser?._id === id || req.decodedUser?.role === UserRoles.ADMIN || req.decodedUser?.role === UserRoles.SUPER_ADMIN) {
                const deletedUser = await deleteUserById(id)

                if (Boolean(deletedUser)) {
                    return res.status(200).json({
                        data:null,
                        error:null,
                        status:ResponseStatus.SUCCESS,
                        message:"success on deleting user's data"
                    })
                }

                return res.status(500).json({
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED,
                    message:"error on deleing user's data"
                })
            }else {
                return res.status(403).json({
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED,
                    message:'only account owner can modify account data'
                })
            }

            
        }
    )
    

    static changeRole = controllerHandler<TChangeUserRoleParams,{},TChangeUserRolePayload>(
        async (req,res,next) => {
            const id = req.params.id

            const user = await findUserById(id)

            if (!user) {
                return res.status(404).json({
                    data:null,
                    error:null,
                    status:ResponseStatus.FAILED,
                    message:"user is not found"
                })
            }

            switch (user.role) {
                case UserRoles.ADMIN:
                case UserRoles.USER:
                    user.role = req.body.role
                    await user.save()
                    return res.status(200).json({
                        data:null,
                        error:null,
                        status:ResponseStatus.SUCCESS,
                        message:"role is changed successfully"
                    })
                case UserRoles.SUPER_ADMIN:
                    return res.status(403).json({
                        data:null,
                        error:null,
                        status:ResponseStatus.FAILED,
                        message:"cannot modify super admins roles"
                    })
            }
         
        }
    )
}