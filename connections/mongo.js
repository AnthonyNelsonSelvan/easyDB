import mongoose from "mongoose";

async function handleConnectoMainServer(Url) {
    await mongoose.connect(Url).then(() => {
        console.log("Connected to main server");
    }).catch((err) => {
        console.log("Error connecting to main server : ", err);
    })
}

export default handleConnectoMainServer;