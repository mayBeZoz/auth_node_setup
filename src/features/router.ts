import {UsersRouter} from "./users/router";
import express from 'express';

const router = express.Router()

router.use('/api/users',UsersRouter)

export default router