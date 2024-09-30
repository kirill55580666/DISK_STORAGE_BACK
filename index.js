import express from 'express'
import mongoose from "mongoose";
import config from 'config'
import authRouter from "./routers/auth-router.js";
import fileRouter from './routers/file-router.js'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import errorMiddleware from './middlewares/error-middleware.js'
import corsMiddleware from './middlewares/cors-middleware.js'
import * as path from "path";
const app = express()
const filePathMiddleware = require('./middlewares/filepath.middleware')
//const path = require('path')


const PORT = process.env.PORT || config.get('serverPort')

app.use(fileUpload({}))
app.use(cors())
app.use(filePathMiddleware(path.resolve(__dirname, 'files')))
app.use(express.json())
app.use(express.static('static'))
//app.use(corsMiddleware)

app.use('/api', authRouter)
app.use('/api/files', fileRouter)
app.use(errorMiddleware)

const start = async () => {
    try {
        await mongoose.connect(config.get("dbUrl"))
        app.listen(PORT, () => {
            console.log(`Сервер запустился на порту ${PORT }`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()