import { model, Schema } from "mongoose";
import argon2 from "argon2"


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    dbs: {
        type: [String],
        default: [],
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await argon2.hash(this.password);
        next();
    } catch (error) {
        console.error("Error hashing password:", error);
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
   try {
       return await argon2.verify(this.password, candidatePassword);
   } catch (error) {
       console.error("Error comparing password:", error);
       return false;
   }
};

const User = model('user', userSchema);

export default User;