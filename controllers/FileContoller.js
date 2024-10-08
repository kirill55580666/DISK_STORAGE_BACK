import fileService from '../services/FileService.js'
import {FileModel} from '../models/file-model.js'
import {UserModel} from '../models/user-model.js'
import config from 'config'
import * as fs from "fs";
import * as Uuid from 'uuid'

class FileController {
    async createDir(req, res) {
        try {
            const {name, type, parent} = req.body
            const file = new FileModel({name, type, parent, user: req.user.id})
            const parentFile = await FileModel.findOne({_id: parent})
            if (!parentFile) {
                file.path = name
                await fileService.createDir(req, file)
            } else {
                file.path = `${parentFile.path}\\${file.name}`
                await fileService.createDir(req, file)
                parentFile.children.push(file._id)
                await parentFile.save()
            }
            await file.save()
            return res.json(file)
        } catch (e) {
            console.log(e)
            return res.status(400).json(e)
        }
    }

    async getFiles(req, res) {
        try {
            const {sort} = req.query
            const files = await FileModel.find({user: req.user.id, parent: req.query.parent}).sort({[sort]: 1})
            return res.json(files)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Can not get files"})
        }
    }

    async uploadFile(req, res) {
        try {
            const file = req.files.file

            const parent = await FileModel.findOne({user: req.user.id, _id: req.body.parent})
            const user = await UserModel.findOne({_id: req.user.id})

            if (user.usedSpace + file.size > user.diskSpace) {
                return res.status(400).json({message: 'There no space on the disk'})
            }

            user.usedSpace = user.usedSpace + file.size
            // здесь стоит объединить две проверки на родителя, путем добавления абсолютного пути
            let path
            if (parent) {
                path = `${req.filePath}\\${user._id}\\${parent.path}\\${file.name}`
            } else {
                path = `${req.filePath}\\${user._id}\\${file.name}`
            }
            if (fs.existsSync(path)) {
                return res.status(400).json({message: 'File already exist'})
            }
            await file.mv(path)

            const type = file.name.split('.').pop()
            let filePath = file.name

            if (parent) {
                filePath = parent.path + "\\" + file.name
            }
            const dbFile = new FileModel({
                name: file.name,
                type,
                size: file.size,
                path: filePath,
                parent: parent?._id,
                user: user._id
            });

            await dbFile.save()
            await user.save()

            res.json(dbFile)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Upload error"})
        }
    }

    async downloadFile(req, res) {
        try {
            const file = await FileModel.findOne({_id: req.query.id, user: req.user.id})
            const path = fileService.getPath(req, file)
            if (fs.existsSync(path)) {
                return res.download(path, file.name)
            }
            return res.status(400).json({message: "Download error"})
        } catch (e) {
            console.log(e)
            res.status(500).json({message: "Download error"})
        }
    }

    async deleteFile(req, res) {
        try {
            const file = await FileModel.findOne({_id: req.query.id, user: req.user.id})
            if (!file) {
                return res.status(400).json({message: 'file not found'})
            }
            fileService.deleteFile(req, file)
            await file.remove()
            return res.json({message: 'File was deleted'})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Dir is not empty'})
        }
    }

    async searchFile(req, res) {
        try {
            const searchName = req.query.search
            let files = await FileModel.find({user: req.user.id})
            files = files.filter(file => file.name.includes(searchName))
            return res.json(files)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Search error'})
        }
    }
    async uploadAvatar(req, res) {
        try {
            const file = req.files.file
            const user = await UserModel.findById(req.user.id)
            const avatarName = Uuid.v4() + ".jpg"
            file.mv(config.get('staticPath') + "\\" + avatarName)
            user.avatar = avatarName
            await user.save()
            return res.json(user)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Avatar error'})
        }
    }
    async deleteAvatar(req, res) {
        try {
            const user = await UserModel.findById(req.user.id)
            fs.unlinkSync(config.get('staticPath') + "\\" + user.avatar)
            user.avatar = null
            await user.save()
            return res.json(user)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Delete avatar error'})
        }
    }
}

export default new FileController()