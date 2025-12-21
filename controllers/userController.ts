import expressAsyncHandler from "express-async-handler";
import { registrationSchema , loginSchema} from "../util/dataValidation";
import apiErrorHandler from "../util/ErrorHandler";
import UserModel from "../models/userModel";
import { HashPassword, comparePassword } from "../util/passwordCryptdecrypt";
import IdempotentKeyModel from "../models/IdempotentKey";
import generateToken from "../config/tokengeneration.ts"

// @ts-ignore
const RegisterUser = expressAsyncHandler(async(req , res) => {

    const idempotentKeyHeader = req.headers["idempotent-key"] as string | undefined;
    if (idempotentKeyHeader) {
        const cached = await IdempotentKeyModel.findOne(
            {key : idempotentKeyHeader , createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }}
        );
        if (cached) {
            return res.status(200).json(cached.response);
        }
    }



    const result = registrationSchema.safeParse(req.body) ; 
    if (!result.success) {
        return apiErrorHandler(res , 400 , "Validation Error" , {
            errors: result.error.issues
        })
        
    } 
    const {fullname  , email  , password } = result.data

   
    const hashPass = await HashPassword(password) 
    
    let newUser ;
   try {
      newUser = await UserModel.create({
        fullname,
        email,
        password : hashPass
    })
   } catch (error : any) {
      if (error.code === 11000) {
        return apiErrorHandler(res, 409, "Email already registered");
    }
    throw error;
   }
    
   
    const accessToken = generateToken.generateAccessToken({id : newUser._id})
    const refreshToken = generateToken.generateRefreshToken({id : newUser._id})
    const successfullResponse = {
        message: "User registered successfully",
        user : {
            id: newUser._id , 
            fullname: newUser.fullname,
            email: newUser.email,
            avatarUrl: newUser.avatarUrl,
            role: newUser.role
        }, 
        token: accessToken
    }
    res.cookie("refreshToken" , refreshToken , {
        httpOnly : true ,
        secure : process.env.NODE_ENV === "production" ,
        sameSite : "strict" ,
        maxAge : 15 * 24 * 60 * 60 * 1000 // 15 days
    })

    if (idempotentKeyHeader) {
        await IdempotentKeyModel.create({
            key: idempotentKeyHeader,
            response: successfullResponse
        })
    }

    return res.status(201).json(successfullResponse);
})
//@ts-ignore
const LoginUser = expressAsyncHandler(async(req , res) => {
    
    const Result = loginSchema.safeParse(req.body) ;
    if (!Result.success) {
        return apiErrorHandler(res , 400 , "Validation Error" , {
            errors: Result.error.issues
        })
        
    }
    const {email , password} = Result.data
    const User = await UserModel.findOne({email}) 
    if (!User) {
        return apiErrorHandler(res , 401 , "Invalid credentials") ;
    }
    const passwordMatch = await comparePassword(password , User.password);
    if (!passwordMatch) {
        return apiErrorHandler(res , 401 , "Invalid credentials") ;
    }
    const accessToken = generateToken.generateAccessToken({id : User._id})
    const refreshToken = generateToken.generateRefreshToken({id : User._id})

    const successfulLoginResponse = {
        message : "Login successful" ,
        user : {
            id: User._id ,
            fullname: User.fullname,
            email: User.email,
            avatarUrl: User.avatarUrl,
            role: User.role
        },
        token:  accessToken,     
    } 
    res.cookie("refreshToken" , refreshToken , {
        httpOnly : true ,
        secure : process.env.NODE_ENV === "production" ,
        sameSite : "strict" ,
        maxAge : 15 * 24 * 60 * 60 * 1000 // 15 days
    }) 
    return res.status(200).json(successfulLoginResponse) ;
})


export { RegisterUser , LoginUser } ;