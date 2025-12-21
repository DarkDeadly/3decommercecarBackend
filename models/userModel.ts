import mongoose, { Schema } from 'mongoose';


interface IUser {
    fullname: string;
    email: string;
    password: string;
    avatarUrl?: string;
    createdAt?: Date;
    role?: string;
}

const userSchema = new Schema({
    fullname : { type : String, required: true },
    email : { type : String, required: true, unique: true },
    password : { type : String, required: true },
    avatarUrl : { type : String , 
                default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm9GzTlYccwnEuuK7rE-X4mRuo-A6ere51_g&s" },
    createdAt : { type : Date, default: Date.now },
    role : { enum: ['user', 'admin' , 'worker'], default: 'user' }
})


const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;