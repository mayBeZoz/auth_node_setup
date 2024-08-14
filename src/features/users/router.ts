import express from 'express';
import validateRequest from '../../core/utils/validateRequest';
import { createUserSchema } from './schema';
import UserController from './controller';

const router = express.Router();


router.post(
    '/register',
    validateRequest(createUserSchema),
    UserController.register
)