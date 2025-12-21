# Setup understanding 
 we download the package ts-node and we create the script in package.json like this
```JavaScript
"scripts": {

"start": "node dist/server.js",

"build": "tsc",

"dev": "nodemon --exec ts-node server.ts"

},
```

dont forget this -exec ts-node this will force to execute ts-node
then u need to install the package @types/express let ts know express and its elements
concerning type Script : 
```TypeScript
const connectDb = async(): Promise<void> 
```

this mean that connect is a Promise also a function (void) and when you do process.env.MONGO_URL as string

this means the same as process.env.MONGO_URL! but the difference u specified the type too 

in addition to that this        process.exit(1);
 mean the shut down when error

 ``` TypeScript
const apiErrorHandler = (res : Response , code : number , message : string , details? : object) => {
    return res.status(code).json({
        message,
        details: details || null,
        timestamp : new Date().toISOString()
    })
}


export default apiErrorHandler ;
```
like this with typeScript there will be an error with status "this expression is not callable.Type 'Number' has no call signatures " for this error u must import Response from express 

```JavaScript
import type { Response } from "express" ;
```