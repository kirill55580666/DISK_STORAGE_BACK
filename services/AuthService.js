import { UserModel } from '../models/user-model.js'
import { ApiError } from '../exceptions/api-error.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from 'config'
import UserDto from "../dtos/user-dto.js";
import fileService from '../services/FileService.js'
import {FileModel} from '../models/file-model.js'

class AuthService {
    async registration(req, email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const user = new UserModel({email, password: hashPassword})
        await user.save()
        await fileService.createDir(req, new FileModel({user:user.id, name: ''}))
    }
    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} не существует`)
        }
        const isPassValid = bcrypt.compareSync(password, user.password)
        if (!isPassValid) {
            throw ApiError.BadRequest(`Неверный пароль`)
        }
        const userDto = new UserDto(user)
        const token = jwt.sign({id: userDto.id}, config.get('secretKey'), {expiresIn: '1h'})
        return {token, user: userDto}

    }
    async authentication(id) {
        // РАЗОБРАТЬСЯ, А СТОИТ ЛИ КАЖДЫЙ РАЗ СОЗДАВАТЬ НОВЫЙ ТОКЕН
        // НУЖНО ПЕРЕПИСЫВАТЬ ЛОГИКУ НА ФРОНТЕНДЕ, В USE EFFECT СТАРТОВОМ APP.JSX
        const user = await UserModel.findOne({_id: id})
        const userDto = new UserDto(user)
        const token = jwt.sign({id: userDto.id}, config.get('secretKey'), {expiresIn: '1h'})
        return {token, user: userDto}
    }
}

export default new AuthService()