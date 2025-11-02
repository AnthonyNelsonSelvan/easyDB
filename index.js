import express from "express";
import cookieParser from "cookie-parser";

//db connections
import handleConnectoMainServer from "./connections/mongo.js";
import { connectToMongo } from "./database.js";

//middleware
import handleCheckIfLoggedIn from "./middleware/auth.js";
import getClusterClient from "./middleware/getClient.js";

//routers
import UserRouter from "./routes/user.js";
import DBOperationRouter from "./routes/operations.js";
import CreateRouter from "./routes/create.js";
import ReadRouter from "./routes/read.js";
import UpdateRouter from "./routes/update.js";
import DeleteRouter from "./routes/delete.js";

const app = express();
const MONGO_URL = 'mongodb://localhost:27018/data-main';//main server url

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(handleCheckIfLoggedIn);
app.use(getClusterClient);

app.use("/api/user", UserRouter);
app.use("/api/db", DBOperationRouter);
app.use("/api/create", CreateRouter);
app.use("/api/read", ReadRouter);
app.use("/api/update", UpdateRouter);
app.use("/api/delete", DeleteRouter)


app.get("/", (req, res) => {
    res.send("vanakam from server.");
});


await connectToMongo().then(() => {
    handleConnectoMainServer(MONGO_URL);
    app.listen(3000, () => {
        console.log("Server listening at port 3000");
    });
}).catch((err) => {
    console.error("Application startup failed due to MongoDB connection error.", err);
});
