import mongoose from 'mongoose';

const messageSchema=new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        trim: true  
    },
    media: {
        type: String,

    },
    mediaType: {
        type: String,
        enum: ['image', 'video']
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'seen'],
        default: 'sent'
    },
    deliveredAt: { type: Date, default: null },
    seenAt: { type: Date, default: null },
    isForwarded: { type: Boolean, default: false }   
},{timestamps: true});

// Ensure every message has either text or media
messageSchema.pre("save", function () {
    if (!this.message && !this.media) {
        throw new Error("Message must contain text or media");
    }
});

const Message=mongoose.model('Message', messageSchema);

export default Message;