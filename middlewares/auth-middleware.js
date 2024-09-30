import { ApiError } from '../exceptions/api-error.js'
import jwt from "jsonwebtoken";
import config from 'config'

export default function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError());
        }
        const accessToken = authorizationHeader.split(' ')[1]
        if (!accessToken) {
            return next(ApiError.UnauthorizedError());
        }
        const decoded = jwt.verify(accessToken, config.get('secretKey'))
        req.user = decoded

        next()
    } catch (e) {
        console.log(e)
        return next(ApiError.UnauthorizedError())
    }
}