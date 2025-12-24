import type { Response } from "express"
const clearCookies = (res : Response , cookieName : string  ) => {
 res.clearCookie(cookieName , {
        httpOnly : true ,
        secure : process.env.NODE_ENV === "production" ,
        sameSite : "strict" 
        })
       
}

export default clearCookies