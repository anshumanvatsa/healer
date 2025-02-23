import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Could be patient or doctor
        userType: { type: String, enum: ["patient", "doctor"], required: true },
        group: { type: String, enum: ["mental", "physical", "sexual"], required: true }, // Enforced enum
        content: { type: String, required: true },
        image: { type: String }, // Optional, if posts contain images
        likes: [{ type: mongoose.Schema.Types.ObjectId }], // Users who liked the post
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Linked comments
    },
    { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
