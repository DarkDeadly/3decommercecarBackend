import express from "express";
import { AuthRateLimit } from "../middleware/RateLimiting";
import { 
    RegisterUser, 
    LoginUser, 
    logout, 
    logoutFromAllDevices 
} from "../controllers/userController";
import RefreshingToken from "../controllers/tokenController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", AuthRateLimit, RegisterUser);
router.post("/login", AuthRateLimit, LoginUser);
router.post("/refresh", RefreshingToken);
router.post("/logout", logout);
router.post("/logout-all", authMiddleware, logoutFromAllDevices);

export default router;