import express from "express"
import { AuthRateLimit } from "../middleware/RateLimiting"
import { RegisterUser  , LoginUser} from "../controllers/userController"

const router = express.Router()



router.post("/register" , AuthRateLimit , RegisterUser ) 
router.post("/login" , AuthRateLimit , LoginUser )



export default router 