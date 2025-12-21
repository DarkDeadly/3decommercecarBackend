import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import apiErrorHandler from "../util/ErrorHandler";

interface UserPayload {
    id: string;
    iat?: number;
    exp?: number;
}

export interface AuthenticatedRequest extends Request {
    user?: UserPayload;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return apiErrorHandler(res, 401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return apiErrorHandler(res, 401, "Unauthorized: Invalid token format");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return apiErrorHandler(res, 401, "Unauthorized: Token expired");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return apiErrorHandler(res, 401, "Unauthorized: Invalid token");
        }
        return apiErrorHandler(res, 500, "Internal Server Error");
    }
};

export default authMiddleware; 