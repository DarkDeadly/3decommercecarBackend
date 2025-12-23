import mongoose, { Document, Schema } from 'mongoose';


interface IUser extends Document {
    fullname: string;
    email: string;
    password: string;
    avatarUrl: string;      // Not optional - has default
    createdAt: Date;        // Not optional - has default
    role: 'user' | 'admin' | 'worker';   // Exact types
}

const userSchema = new Schema({
    fullname: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,    // Normalizes "John@Email.com" → "john@email.com"
        trim: true          // Removes whitespace
    },
    password: { 
        type: String, 
        required: true , 
        select: false      
    },
    avatarUrl: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm9GzTlYccwnEuuK7rE-X4mRuo-A6ere51_g&s"
    },
    createdAt: { type: Date, default: Date.now },
    role: {
        type: String,
        enum: ['user', 'admin', 'worker'],
        default: 'user'
    }
})


const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;