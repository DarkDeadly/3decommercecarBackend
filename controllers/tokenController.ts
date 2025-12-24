import type { Request, Response } from "express"
import refreshTokenModel from "../models/refreshtokenModel"
import apiErrorHandler from "../util/ErrorHandler"
import UserModel from "../models/userModel"
import generateToken from "../config/tokengeneration"
import { getExpirationDate } from "../util/DateExpire"


const RefreshingToken = async (req: Request, res: Response) => {
    // Step 1: Get refresh token from cookie
    const currentRefreshToken = req.cookies.refreshToken
    if (!currentRefreshToken) {
    return apiErrorHandler(res, 401, 'No refresh token provided');
    }
    // Step 2: Find token in database
    try {
        const tokenExists = await refreshTokenModel.findOne({ token: currentRefreshToken })
        if (!tokenExists) { return apiErrorHandler(res, 401, 'Invalid or expired token. Please login again.') }
        // Step 3: Check if token is revoked if yes revoke all possible thief
        if (tokenExists.isRevoked) {
            console.warn(`[SECURITY] Revoked token used: userId=${tokenExists.userId}`)
            await refreshTokenModel.updateMany(
            { userId: tokenExists.userId },
            { isRevoked: true }
        );
            return apiErrorHandler(res, 401, 'Invalid or expired token. Please login again.')
        }
        // Step 4: Check if token is expired
        if (tokenExists.expiresAt < new Date()) { return apiErrorHandler(res, 401, 'Invalid or expired token. Please login again.') }
        // Step 5: Find the user
        const userWithToken = await UserModel.findById(tokenExists.userId)
        if (!userWithToken) { return apiErrorHandler(res, 400, "User not Found") }
        // Step 6: Generate new tokens
        const newAccessToken = generateToken.generateAccessToken({ id: userWithToken?._id.toString() })
        const newRefreshToken = generateToken.generateRefreshToken()
        // Step 7: Revoke old token (rotation)  
        await refreshTokenModel.findOneAndUpdate({ token: currentRefreshToken },
            { isRevoked: true, replacedBy: newRefreshToken }
        )
        // Step 8: Save new refresh token
        await refreshTokenModel.create({
            token: newRefreshToken,
            userId: tokenExists.userId,
            expiresAt: getExpirationDate(15)
        });
        // Step 9: Set new cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days
        })
        // Step 10: Return new access token
        return res.status(200).json({
            message: "Access Token refreshed successfully",
            token: newAccessToken
        })
    } catch (error) {
        throw error
    }
}


export default RefreshingToken