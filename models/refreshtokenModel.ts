// models/refreshTokenModel.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
    token: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    isRevoked: boolean;
    replacedBy: string | null;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default:Date.now
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    replacedBy: {
        type: String,
        default: null
    }
});
const refreshTokenModel = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default refreshTokenModel