import express from 'express';
import validateRequest from '../../core/middlewares/validateRequest';
import { createUserSchema, submitUserAccountValidationOTP, userLoginSchema } from './schema';
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


export {router as UsersRouter}