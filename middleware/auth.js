import { handleVerifyToken } from "../utils/jwt.js";

const publicRoutes = [
    "/api/user"
];

async function handleCheckIfLoggedIn(req, res, next) {
    try {
        if (publicRoutes.some((route) => req.path.startsWith(route) )) {
            return next();
        }

        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Please log in first." });
        }

        const verified = handleVerifyToken(token);
        if (!verified) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        req.user = verified;
        return next();
    } catch (error) {
        console.error("Error in handleCheckIfLoggedIn:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default handleCheckIfLoggedIn;