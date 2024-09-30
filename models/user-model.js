import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    diskSpace: {type: Number, default: 1024**3*10},
    // 10Гб = 1024 * 1024 * 1024 * 10 Байт = 1024 * 1024 * 10 Кбайт =
    // = 1024 * 10 Мбайт = 10 Гб
    usedSpace: {type: Number, default: 0},
    avatar: {type: String},
    files : [{type: mongoose.Types.ObjectId, ref:'File'}]
})

export const UserModel = mongoose.model('User', UserSchema)