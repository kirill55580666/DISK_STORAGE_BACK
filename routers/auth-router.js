import { Router } from 'express'
import AuthController from "../controllers/AuthController.js";
import {body} from "express-validator";
import AuthMiddleware from '../middlewares/auth-middleware.js'

const router = new Router()

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    AuthController.registration)
router.post('/login', AuthController.login)
router.get('/auth', AuthMiddleware, AuthController.authentication)

export default router
