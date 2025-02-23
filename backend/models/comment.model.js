import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Could be patient or doctor
        userType: { type: String, enum: ["patient", "doctor"], required: true },
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
