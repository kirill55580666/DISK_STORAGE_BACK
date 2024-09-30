export default class UserDto {
    id;
    email;
    diskSpace;
    usedSpace;
    avatar;

    constructor(model) {
        this.id = model._id;
        this.email = model.email;
        this.diskSpace = model.diskSpace;
        this.usedSpace = model.usedSpace;
        this.avatar = model.avatar;
    }
}