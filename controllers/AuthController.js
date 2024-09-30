import AuthService from '../services/AuthService.js'
import {validationResult} from "express-validator";
import {ApiError} from "../exceptions/api-error.js";

class AuthController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                next(ApiError.BadRequest('Ошибка при регистрации', errors.array()))
            }
            const {email, password} = req.body
            const userData = await AuthService.registration(email, password)
            res.json({message: "User was created"})
        } catch (e) {
            next(e)
        }
    }
    async login(req, res, next) {
        try {
            const {email, password} = req.body
            const userData = await AuthService.login(email, password)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }
    async authentication(req, res, next) {
        try {
            const id = req.user.id
            const userData = await AuthService.authentication(id)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }
}

export default new AuthController()