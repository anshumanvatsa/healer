import mongoose from "mongoose";
const NotificationSchema = new mongoose.Schema(
    {
        recipientId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be doctor or patient
        recipientType: { type: String, enum: ["patient", "doctor"], required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId },
        senderType: { type: String, enum: ["patient", "doctor"] },
        type: {
            type: String,
            enum: ["like", "comment", "appointment_request", "appointment_accepted"],
            required: true,
        },
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // If it's a post notification
        appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }, // If it's an appointment notification
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
