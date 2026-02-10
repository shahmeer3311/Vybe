import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    device: {
        type: String,
        default: 'unknown',
    },
    ip: {
        type: String,
        default: 'unknown',
    },
    expiresAt: {
        type: Date,
        required: true,
    }
},{timestamps: true});

const RefreshToken=mongoose.model('RefreshToken',refreshTokenSchema);

export default RefreshToken;