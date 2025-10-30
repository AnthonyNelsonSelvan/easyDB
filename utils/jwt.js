import jwt from "jsonwebtoken";

const tempSecret = "krgkergnlkergkseg"

function handleSignToken(data) {
    const token = jwt.sign(
        { id: data._id, username: data.username },
        process.env.JWT_SECRET || tempSecret,
        { expiresIn: "1d" }
    );
    return token;
}

function handleVerifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || tempSecret);
        return decoded
    } catch (error) {
        return null;
    }
}

export { handleSignToken, handleVerifyToken };