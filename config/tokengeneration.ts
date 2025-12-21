import JWT from "jsonwebtoken";
 
const generateToken = {
    generateAccessToken: (payload: object) => {
        return JWT.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
    },
    
    generateRefreshToken: (payload: object) => {
        return JWT.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "15d" });
    }
}

export default generateToken;