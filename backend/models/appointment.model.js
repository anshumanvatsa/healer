import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        date: { type: Date, required: true },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        notes: { type: String }, // Optional, for doctor-patient notes
    },
    { timestamps: true }
);

export default mongoose.model("Appointment", AppointmentSchema);
