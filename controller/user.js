import User from "../model/user.js";
import handleSetCookie from "../utils/cookie.js";
import { handleSignToken } from "../utils/jwt.js";

async function handleSignUp(req, res) {
    const { username, email, password } = req.body;
    try {
        const validUsername = await User.findOne({ username: username });
        const validEmail = await User.findOne({ email: email })
        if (validUsername) {
            res.status(409).json({ message: "Username already taken." });
        }
        if (validEmail) {
            res.status(409).json({ message: "Email already exist." })
        }
        await User.create({ username: username, password: password, email: email });
        return res.status(201).json({ message: "User registered Succesfully." })
    } catch (err) {
        console.log("SignUp error : ", err);
        return res.status(500).json("Unexpected Error While sign Up")
    }
}

async function handleLogin(req, res) {
    const { emailOrUsername, password } = req.body;
    console.log(emailOrUsername)
    try {
        const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
        if (!user) {
            return res.status(404).json({ message: "Email or Password Incorrect (email)." });
        }
        const validLogin = await user.comparePassword(password);
        if (!validLogin) {
            return res.status(404).json({ message: "Email or Password Incorrect(password)." });
        }
        const token = handleSignToken(user);
        handleSetCookie(res, token);
        return res.status(200).json({ message: "You are logged In. Welcome Back." })
    } catch (error) {
        console.log("Error while logging in : ", error);
        res.status(500).json({ message: "Unexpected Error Occured while login" })
    }
}

export { handleLogin, handleSignUp }