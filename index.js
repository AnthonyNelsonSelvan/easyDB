import express from "express";
import cookieParser from "cookie-parser";

import handleConnectoMainServer from "./connections/mongo.js";
import { connectToMongo, getMongoClient } from "./database.js";
import UserRouter from "./routes/user.js";
import DBOperationRouter from "./routes/operations.js";
import handleCheckIfLoggedIn from "./middleware/auth.js";

const app = express();
const MONGO_URL = 'mongodb://localhost:27018/data-main';//main server url

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(handleCheckIfLoggedIn);
app.use((req, res, next) => {
    try {
        req.mongoClient = getMongoClient();
        console.log(req.mongoClient);
        next();
    } catch (error) {
        console.error("Middleware DB Client Error:", error.message);
        res.status(503).json({ message: "Database service unavailable" });
    }
});

app.use("/api/user", UserRouter);
app.use("/api/db", DBOperationRouter);


app.get("/", (req, res) => {
    res.send("vanakam from server.");
});


await connectToMongo().then(() => {
    handleConnectoMainServer(MONGO_URL)
    app.listen(3000, () => {
        console.log("Server listening at port 3000");
    });
}).catch((err) => {
    console.error("Application startup failed due to MongoDB connection error.", err);
});
