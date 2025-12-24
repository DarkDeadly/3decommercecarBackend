import express from "express";
import "dotenv/config";
import connectDb from "./config/db.ts";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/UserRoute.ts";

const app = express();
const port = process.env.PORT;

connectDb();

app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRoutes);

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});