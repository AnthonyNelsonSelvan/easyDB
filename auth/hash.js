import argon2 from "argon2";

async function handleHashText(text) {
    const hashedText = await argon2.hash(text);
    return hashedText;
}

async function handleVerifyHash(hashedText, text) {
    const result = await argon2.verify(hashedText, text)
    return result;
}