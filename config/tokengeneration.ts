import JWT from "jsonwebtoken";
import crypto from "crypto"

interface TokenPayload {
    id: string;
}

const generateToken = {
    generateAccessToken: (payload: TokenPayload):string => {
        return JWT.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
    },
    
    generateRefreshToken: () : string => {
        return crypto.randomBytes(64).toString("hex")
    }
}

export default generateToken;