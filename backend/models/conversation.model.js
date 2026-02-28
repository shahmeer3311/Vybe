import mongoose from "mongoose";

const conversationSchema=new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    isGroupChat: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        trim: true
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
},{timestamps: true});

// Validate only for group chats; use throw-based validation to avoid `next` issues
conversationSchema.pre("save", function () {
  if (!this.isGroupChat) return;

  if (!this.groupName) {
    throw new Error("Group name is required");
  }
  if (!this.groupAdmin) {
    throw new Error("Group admin is required");
  }
  if (this.participants.length < 3) {
    throw new Error("Group chat must have at least 3 participants");
  }
});

conversationSchema.index({ participants: 1 });

const Conversation=mongoose.model('Conversation', conversationSchema);

export default Conversation;