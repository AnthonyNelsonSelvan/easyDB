
function handleSetCookie(res,token) {
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,      // use HTTPS in production
        sameSite: "strict"
    });
    return true;
}

export default handleSetCookie;
