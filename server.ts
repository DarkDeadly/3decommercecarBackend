import express from "express"
import 'dotenv/config'
import connectDb from "./config/db.ts"

const app = express()
const port = process.env.PORT

app.use(express.json())
connectDb()

app.listen(port , () => {
    console.log(`listening to port ${port}`)
})