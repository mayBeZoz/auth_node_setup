import express from 'express';
import validateRequest from '../../core/middlewares/validateRequest';
import { changeUserRoleSchema, createUserSchema, deleteUserSchema, getAllUsersSchema, getUserByIdSchema, submitUserAccountValidationOTP, submitUserResetPasswordOTP, updateUserSchema, userLoginSchema } from './schema';
import UserController from './controller';
import { validateRoles } from '../../core/middlewares/validateRoles';
import { UserRoles } from '../../core/utils/constants';

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

router.get(
    "/",
    validateRequest(getAllUsersSchema),
    UserController.getAllUsers
)


router.get(
    "/:id",
    validateRequest(getUserByIdSchema),
    UserController.getUserById
)

router.patch(
    "/:id",
    validateRoles([UserRoles.USER,UserRoles.ADMIN,UserRoles.SUPER_ADMIN]),
    validateRequest(updateUserSchema),
    UserController.updateUserById
)

router.delete(
    "/:id",
    validateRoles([UserRoles.USER,UserRoles.ADMIN,UserRoles.SUPER_ADMIN]),
    validateRequest(deleteUserSchema),
    UserController.deleteUserById
)

router.post(
    "/change-role/:id",
    validateRoles([UserRoles.SUPER_ADMIN]),
    validateRequest(changeUserRoleSchema),
    UserController.changeRole
)

export {router as UsersRouter}