import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    bio: {
        type: String,
        maxlength: 160,
        default: ''
    },
    profession: {
        type: String,
        maxlength: 100,
        default: ''
    },
    profileImg: {
        type: String,
        default: ''
    },
    profileImgId: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    isPrivate: {
        type: Boolean,
        default: false
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post"}],
    stories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story"}],
    loops: [{ type: mongoose.Schema.Types.ObjectId, ref: "Loop"}],
},{timestamps: true});

userSchema.pre("save", async function () {
    if (!this.password || !this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword=async function (candidatePassword){
    if(!this.password) throw new Error("Password not set for this user.");
    return await bcrypt.compare(candidatePassword,this.password);
}

const User=mongoose.model("User", userSchema);
export default User;