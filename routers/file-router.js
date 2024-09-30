import { Router } from 'express'
const router = new Router()
import AuthMiddleware from '../middlewares/auth-middleware.js'
import fileController from '../controllers/FileContoller.js'

router.post('', AuthMiddleware, fileController.createDir)
router.post('/upload', AuthMiddleware, fileController.uploadFile)
router.post('/avatar', AuthMiddleware, fileController.uploadAvatar)
router.get('', AuthMiddleware, fileController.getFiles)
router.get('/download', AuthMiddleware, fileController.downloadFile)
router.delete('/', AuthMiddleware, fileController.deleteFile)
router.delete('/avatar', AuthMiddleware, fileController.deleteAvatar)
router.get('/search', AuthMiddleware, fileController.searchFile)

export default router