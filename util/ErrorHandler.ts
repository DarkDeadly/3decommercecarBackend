import type { Response } from "express" ;

const apiErrorHandler = (res : Response , code : number , message : string , details? : object) => {
    return res.status(code).json({
        message,
        details: details || null,
        timestamp : new Date().toISOString()
    })
}


export default apiErrorHandler ;