import express from 'express';
import validateRequest from '../../core/middlewares/validateRequest';
import { createUserSchema, submitUserAccountValidationOTP, submitUserResetPasswordOTP, userLoginSchema } from './schema';
import UserController from './controller';

const router = express.Router();


router.post(
    '/register',
    validateRequest(createUserSchema),
    UserController.register
)

router.post(
    '/login',
    validateRequest(userLoginSchema),
    UserController.login
)

router.get(
    '/refresh-token',
    UserController.refreshToken
)

router.get(
    '/get-account-verification-otp/:id',
    UserController.getAccountVerificationOTP
)

router.post(
    '/submit-account-verification-otp/:id',
    validateRequest(submitUserAccountValidationOTP),
    UserController.submitAccountVerificationOTP
)

router.get(
    '/get-reset-password-otp/:id',
    UserController.getResetPasswordOTP
)

router.post(
    '/submit-reset-password/:id',
    validateRequest(submitUserResetPasswordOTP),
    UserController.submitResetPasswordOTP
)

export {router as UsersRouter}